import React, { useMemo, useRef, useState } from "react";
import { useApi, useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import {
  CreatePromoParams,
  ProductCategoryDto,
  ProductDataList,
  PromoCalculateRequest,
  PromoCalculateResult,
  PromoSuggestionDto,
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
    items: suggestion.suggestedProductIDs.map((id) => ({
      targetMode: "product" as const,
      productID: id,
      productCategoryID: null,
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
  const [calcResult, setCalcResult] = useState<PromoCalculateResult | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const latestFormValues = useRef<PromoFormType | null>(null);

  const productsData = useApi(
    (api) => api.commons.getProductByIngredientsOrMenu(true),
    [],
  );
  const categoriesData = useApi(
    (api) => api.commons.productCategoryList(),
    [],
  );
  const calculateCb = useApiCallback(
    async (api, params: PromoCalculateRequest) => api.commons.promoCalculate(params),
  );
  const createCb = useApiCallback(
    async (api, params: CreatePromoParams) => api.commons.promoCreate(params),
  );

  const products: ProductDataList[] = useMemo(
    () => (productsData.result?.data?.response ?? []).filter((p) => p.isActive !== false),
    [productsData.result],
  );
  const productCategories: ProductCategoryDto[] = useMemo(
    () =>
      (categoriesData.result?.data?.response ?? []).filter(
        (c) => c.isActive !== false,
      ),
    [categoriesData.result],
  );

  const handleCalculate = async () => {
    const values = latestFormValues.current;
    if (!values) return;
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
            item.targetMode === "category"
              ? item.productCategoryID || null
              : null,
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
            item.targetMode === "category"
              ? item.productCategoryID || null
              : null,
          quantity: item.quantity,
          isFreeItem: item.isFreeItem ?? false,
        })),
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
    latestFormValues.current = values;
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
    />
  );
};
