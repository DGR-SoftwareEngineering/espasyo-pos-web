import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useApi, useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import {
  CreatePromoParams,
  ProductCategoryDto,
  ProductVariantDto,
  PromoCalculateRequest,
  PromoCalculateResult,
  PromoFeasibilityItemResultDto,
  PromoFeasibilityRequestDto,
  PromoFeasibilityResultDto,
  PromoSuggestionDto,
  SellableProductDto,
} from "core-lib/api/commons/types";
import { PromoForm as PromoFormType } from "./validation";
import { PROMO_TYPE_INT_TO_STRING } from "../constants";
import { PromoForm } from "./PromoForm";

interface PromoFormBlockProps {
  fromSuggestion?: PromoSuggestionDto | null;
  onSuccess?: () => void;
}

const buildInitialValues = (
  suggestion: PromoSuggestionDto | null | undefined,
): Partial<PromoFormType> | undefined => {
  if (!suggestion) return undefined;
  return {
    type: suggestion.promoType,
    reason: suggestion.reason,
    discountPercent: suggestion.suggestedDiscountPercent ?? undefined,
    discountAmount: suggestion.suggestedDiscountAmount ?? undefined,
    buyQuantity: suggestion.suggestedBuyQuantity ?? undefined,
    getQuantity: suggestion.suggestedGetQuantity ?? undefined,
    bundlePrice: suggestion.suggestedBundlePrice ?? undefined,
    items: suggestion.suggestedProductIDs.map((id) => ({
      targetMode: "product" as const,
      productID: id,
      productCategoryID: null,
      productVariantID: null,
      variantProductID: null,
      quantity: 1,
      isFreeItem: false,
    })),
  };
};

export const PromoFormBlock: React.FC<PromoFormBlockProps> = ({
  fromSuggestion,
  onSuccess,
}) => {
  const { showToast } = useToastContext();
  const router = useRouter();
  const [calcResult, setCalcResult] = useState<PromoCalculateResult | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [variantsByProductId, setVariantsByProductId] = useState<Record<string, ProductVariantDto[]>>({});
  const [variantsLoading, setVariantsLoading] = useState<Record<string, boolean>>({});
  const [allVariantsLoaded, setAllVariantsLoaded] = useState(false);
  const [feasibilityResult, setFeasibilityResult] = useState<PromoFeasibilityResultDto | null>(null);
  const [feasibilityLoading, setFeasibilityLoading] = useState(false);

  const latestFormValues = useRef<PromoFormType | null>(null);

  const productsData = useApi(
    (api) => api.commons.sellableProductList({ pageNumber: 1, pageSize: 500 }),
    [],
  );
  const categoriesData = useApi(
    (api) => api.commons.productCategoryList(),
    [],
  );
  const calculateCb = useApiCallback(
    async (api, params: PromoCalculateRequest) => api.commons.promoCalculate(params),
  );
  const feasibilityCb = useApiCallback(
    async (api, params: PromoFeasibilityRequestDto) => api.commons.promoCheckFeasibility(params),
  );
  const createCb = useApiCallback(
    async (api, params: CreatePromoParams) => api.commons.promoCreate(params),
  );
  const loadVariantsCb = useApiCallback(
    async (api, productId: string) => api.commons.productVariantsByProduct(productId),
  );
  const loadAllVariantsCb = useApiCallback(
    async (api, productIds: string[]) =>
      Promise.allSettled(
        productIds.map((id) =>
          api.commons.productVariantsByProduct(id).then((r) => ({
            id,
            variants: ((r?.data?.response as ProductVariantDto[] | null) ?? []).filter(
              (v) => v.isActive,
            ),
          })),
        ),
      ),
  );

  const products: SellableProductDto[] = useMemo(
    () => (productsData.result?.data?.response?.items ?? []).filter((p) => p.isActive !== false),
    [productsData.result],
  );
  const productCategories: ProductCategoryDto[] = useMemo(
    () =>
      (categoriesData.result?.data?.response ?? []).filter(
        (c) => c.isActive !== false,
      ),
    [categoriesData.result],
  );

  useEffect(() => {
    if (products.length === 0 || allVariantsLoaded) return;
    loadAllVariantsCb.execute(products.map((p) => p.productID)).then((results) => {
      const updates: Record<string, ProductVariantDto[]> = {};
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          updates[result.value.id] = result.value.variants;
        }
      });
      setVariantsByProductId((prev) => ({ ...prev, ...updates }));
      setAllVariantsLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const handleLoadVariants = async (productId: string) => {
    if (variantsByProductId[productId] !== undefined) return; // already loaded
    setVariantsLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      const result = await loadVariantsCb.execute(productId);
      const variants = ((result?.data?.response as ProductVariantDto[] | null) ?? []).filter(
        (v) => v.isActive,
      );
      setVariantsByProductId((prev) => ({ ...prev, [productId]: variants }));
    } catch {
      setVariantsByProductId((prev) => ({ ...prev, [productId]: [] }));
    } finally {
      setVariantsLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleCalculate = async (values: PromoFormType) => {
    setCalcLoading(true);
    try {
      const request: PromoCalculateRequest = {
        promoType: values.type,
        discountPercent: values.discountPercent ?? null,
        discountAmount: values.discountAmount ?? null,
        buyQuantity: values.buyQuantity ?? null,
        getQuantity: values.getQuantity ?? null,
        bundlePrice: values.bundlePrice ?? null,
        items: (values.items ?? []).map((item) => ({
          productID:
            item.targetMode === "product" ? item.productID || null : null,
          productCategoryID:
            item.targetMode === "category" ? item.productCategoryID || null : null,
          productVariantID:
            item.targetMode === "variant" ? item.productVariantID || null : null,
          quantity: item.quantity,
          isFreeItem: item.isFreeItem ?? false,
        })),
      };
      const result = await calculateCb.execute(request);
      if (result?.data?.response) {
        setCalcResult(result.data.response);
      } else {
        showToast("Could not calculate cost. Check your product selections.", "error");
      }
    } catch {
      showToast("Calculation failed", "error");
    } finally {
      setCalcLoading(false);
    }
  };

  const handleSubmit = async (values: PromoFormType) => {
    latestFormValues.current = values;
    setSubmitLoading(true);
    try {
      const params: CreatePromoParams = {
        title: values.title,
        description: values.description || null,
        imageFile: values.imageFile ?? null,
        type: values.type,
        discountPercent: values.discountPercent ?? null,
        discountAmount: values.discountAmount ?? null,
        buyQuantity: values.buyQuantity ?? null,
        getQuantity: values.getQuantity ?? null,
        bundlePrice: values.bundlePrice ?? null,
        startDate: values.startDate || null,
        endDate: values.endDate || null,
        reason: values.reason || null,
        isAiGenerated: !!fromSuggestion,
        items: (values.items ?? []).map((item) => ({
          productID:
            item.targetMode === "product" ? item.productID || null : null,
          productCategoryID:
            item.targetMode === "category" ? item.productCategoryID || null : null,
          productVariantID:
            item.targetMode === "variant" ? item.productVariantID || null : null,
          quantity: item.quantity,
          isFreeItem: item.isFreeItem ?? false,
        })),
        targetSegment: values.targetSegment ?? null,
        minLoyaltyStamps: values.minLoyaltyStamps ?? null,
        targetCustomerIds: values.assignedCustomerIds ?? [],
      };
      const result = await createCb.execute(params);
      if (result?.data?.success) {
        showToast("Promo created successfully", "success");
        onSuccess?.();
        return;
      }
      const errorMsg =
        Array.isArray(result?.data?.errors) && result.data.errors.length > 0
          ? (result.data.errors as string[])[0]
          : result?.data?.message ?? "Failed to create promo";
      showToast(errorMsg, "error");
    } catch {
      showToast("Failed to create promo", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleValuesChange = (values: PromoFormType) => {
    if (latestFormValues.current?.type !== values.type) {
      setCalcResult(null);
      setFeasibilityResult(null);
    }
    latestFormValues.current = values;
  };

  const handleCheckFeasibility = async (values: PromoFormType) => {
    setFeasibilityLoading(true);
    try {
      const request: PromoFeasibilityRequestDto = {
        type: values.type,
        buyQuantity: values.buyQuantity ?? 0,
        getQuantity: values.getQuantity ?? 0,
        bundlePrice: values.bundlePrice ?? undefined,
        startDate: values.startDate ? values.startDate.substring(0, 10) : undefined,
        endDate: values.endDate ? values.endDate.substring(0, 10) : undefined,
        items: (values.items ?? [])
          .filter((i) => i.targetMode === "product" && !!i.productID)
          .map((i) => {
            const p = products.find((prod) => prod.productID === i.productID);
            return {
              productID: i.productID!,
              quantity: i.quantity ?? 1,
              isFreeItem: i.isFreeItem ?? false,
              currentStock: p?.currentStock,
              productName: p?.name,
            };
          }),
      };
      if (request.items.length === 0) {
        showToast("Add at least one specific product to check feasibility.", "error");
        return;
      }
      const result = await feasibilityCb.execute(request);
      if (result?.data?.response) {
        setFeasibilityResult(result.data.response);
      } else {
        showToast("Could not check feasibility. Try again.", "error");
      }
    } catch {
      showToast("Feasibility check failed", "error");
    } finally {
      setFeasibilityLoading(false);
    }
  };

  const handleCreatePO = (items: PromoFeasibilityItemResultDto[]) => {
    localStorage.setItem(
      "po_prefill",
      JSON.stringify(
        items.map((i) => ({
          productID: i.productID,
          productName: i.productName,
          quantity: Math.ceil(i.shortfall ?? i.reorderLevel ?? 1),
        })),
      ),
    );
    router.push("/admin/hub/procurement/purchase-orders?prefill=1");
  };

  const initialValues = buildInitialValues(fromSuggestion);

  return (
    <PromoForm
      onSubmit={handleSubmit}
      submitLoading={submitLoading}
      isInDialog
      initialValues={initialValues}
      products={products}
      productCategories={productCategories}
      fromSuggestion={fromSuggestion}
      calcResult={calcResult}
      onCalculate={handleCalculate}
      calcLoading={calcLoading}
      onValuesChange={handleValuesChange}
      variantsByProductId={variantsByProductId}
      onLoadVariants={handleLoadVariants}
      variantsLoading={variantsLoading}
      allVariantsLoaded={allVariantsLoaded}
      feasibilityResult={feasibilityResult}
      feasibilityLoading={feasibilityLoading}
      onCheckFeasibility={handleCheckFeasibility}
      onCreatePO={handleCreatePO}
    />
  );
};
