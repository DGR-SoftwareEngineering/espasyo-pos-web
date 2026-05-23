import { useEffect, useMemo, useState } from "react";
import {
  BusinessSupplyCategoryDto,
  IngredientCategoryDto,
  ProductAddOnGroupDto,
  ProductCategoryDto,
  ProductDataList,
  ProductVariantDto,
  UnitDto,
  UpdateProductParams,
} from "../../../../api/commons/types";
import { useToastContext } from "../../../../core/contexts";
import { useApi, useApiCallback } from "../../../../core/hooks";
import { Box } from "@radix-ui/themes";
import { FormRenderer } from "../../../radix/form/FormRenderer";

type ProductMode = "menuItem" | "ingredient" | "supply";

interface FormVariant {
  productVariantID?: string | null;
  name: string;
  price: number;
  displayOrder: number;
}

interface FormAddOnItem {
  productAddOnItemID?: string | null;
  name: string;
  additionalPrice: number;
  displayOrder: number;
}

interface FormAddOnGroup {
  productAddOnGroupID?: string | null;
  name: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  displayOrder: number;
  items: FormAddOnItem[];
}

interface ProductFormSubmitValues {
  name: string;
  description?: string | null;
  productMode: ProductMode;
  categoryID?: string | null;
  unitPrice?: number;
  costPrice?: number;
  purchaseQuantity?: number;
  purchaseUnitID?: string;
  stockUnitID?: string;
  imageFile?: File | null;
  removeImage?: boolean;
  variants?: FormVariant[];
  addOnGroups?: FormAddOnGroup[];
}

export const ProductEditDialogContent: React.FC<{
  product: ProductDataList;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ product, onSuccess, onClose }) => {
  const { showToast } = useToastContext();
  const [productCategories, setProductCategories] = useState<
    ProductCategoryDto[]
  >([]);
  const [ingredientCategories, setIngredientCategories] = useState<
    IngredientCategoryDto[]
  >([]);
  const [businessSupplyCategories, setBusinessSupplyCategories] = useState<
    BusinessSupplyCategoryDto[]
  >([]);
  const [units, setUnits] = useState<UnitDto[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const productCategoryData = useApi((api) => api.commons.productCategoryList());
  const ingredientCategoryData = useApi((api) =>
    api.commons.ingredientCategoryList(),
  );
  const businessSupplyCategoryData = useApi((api) =>
    api.commons.businessSupplyCategoryList(),
  );
  const unitData = useApi((api) => api.commons.unitList());

  // Load existing variants and add-on groups for menu items
  const variantsApi = useApi(
    (api) =>
      product.isMenuItem
        ? api.commons.productVariantsByProduct(product.productID)
        : Promise.resolve({ data: { success: true, response: [] } } as any),
    [product.productID, product.isMenuItem],
  );
  const addOnsApi = useApi(
    (api) =>
      product.isMenuItem
        ? api.commons.productAddOnGroupsByProduct(product.productID)
        : Promise.resolve({ data: { success: true, response: [] } } as any),
    [product.productID, product.isMenuItem],
  );

  const existingVariants = useMemo<ProductVariantDto[]>(
    () => variantsApi.result?.data?.response ?? [],
    [variantsApi.result],
  );
  const existingAddOnGroups = useMemo<ProductAddOnGroupDto[]>(
    () => addOnsApi.result?.data?.response ?? [],
    [addOnsApi.result],
  );

  useEffect(() => {
    setProductCategories(productCategoryData.result?.data.response ?? []);
  }, [productCategoryData.result?.data.response]);

  useEffect(() => {
    setIngredientCategories(ingredientCategoryData.result?.data.response ?? []);
  }, [ingredientCategoryData.result?.data.response]);

  useEffect(() => {
    setBusinessSupplyCategories(businessSupplyCategoryData.result?.data.response ?? []);
  }, [businessSupplyCategoryData.result?.data.response]);

  useEffect(() => {
    setUnits(unitData.result?.data.response ?? []);
  }, [unitData.result?.data.response]);

  const updateProductCb = useApiCallback(
    async (api, args: UpdateProductParams) =>
      await api.commons.updateProduct(args),
  );

  const reconcileVariants = async (
    api: any,
    submittedVariants: FormVariant[],
  ) => {
    const existingIds = new Set(existingVariants.map((v) => v.productVariantID));
    const submittedIds = new Set(
      submittedVariants
        .map((v) => v.productVariantID)
        .filter((id): id is string => !!id),
    );

    const toDelete = existingVariants.filter(
      (v) => !submittedIds.has(v.productVariantID),
    );
    const toCreate = submittedVariants.filter((v) => !v.productVariantID);
    const toUpdate = submittedVariants.filter(
      (v) => v.productVariantID && existingIds.has(v.productVariantID),
    );

    const ops: Promise<unknown>[] = [];
    toDelete.forEach((v) =>
      ops.push(api.commons.productVariantDelete(v.productVariantID)),
    );
    toCreate.forEach((v) =>
      ops.push(
        api.commons.productVariantCreate({
          productID: product.productID,
          name: v.name,
          price: Number(v.price),
          displayOrder: Number(v.displayOrder) || 0,
        }),
      ),
    );
    toUpdate.forEach((v) =>
      ops.push(
        api.commons.productVariantUpdate({
          productVariantID: v.productVariantID!,
          productID: product.productID,
          name: v.name,
          price: Number(v.price),
          displayOrder: Number(v.displayOrder) || 0,
        }),
      ),
    );
    await Promise.all(ops);
  };

  const reconcileAddOnGroups = async (
    api: any,
    submittedGroups: FormAddOnGroup[],
  ) => {
    const existingGroupById = new Map(
      existingAddOnGroups.map((g) => [g.productAddOnGroupID, g]),
    );
    const submittedGroupIds = new Set(
      submittedGroups
        .map((g) => g.productAddOnGroupID)
        .filter((id): id is string => !!id),
    );

    // Delete groups no longer present (server soft-deletes items too)
    const groupsToDelete = existingAddOnGroups.filter(
      (g) => !submittedGroupIds.has(g.productAddOnGroupID),
    );
    await Promise.all(
      groupsToDelete.map((g) =>
        api.commons.productAddOnGroupDelete(g.productAddOnGroupID),
      ),
    );

    // Process each submitted group sequentially so we know its ID before
    // creating items for newly-created groups.
    for (const group of submittedGroups) {
      let groupId = group.productAddOnGroupID ?? null;

      if (!groupId) {
        // New group — POST with its items inline
        const res = await api.commons.productAddOnGroupCreate({
          productID: product.productID,
          name: group.name,
          isRequired: !!group.isRequired,
          minSelections: Number(group.minSelections) || 0,
          maxSelections: Number(group.maxSelections) || 1,
          displayOrder: Number(group.displayOrder) || 0,
          items: group.items.map((it) => ({
            name: it.name,
            additionalPrice: Number(it.additionalPrice) || 0,
            displayOrder: Number(it.displayOrder) || 0,
          })),
        });
        groupId = res?.data?.response?.productAddOnGroupID ?? null;
        continue;
      }

      // Existing group — update the group fields, then reconcile items
      await api.commons.productAddOnGroupUpdate({
        productAddOnGroupID: groupId,
        productID: product.productID,
        name: group.name,
        isRequired: !!group.isRequired,
        minSelections: Number(group.minSelections) || 0,
        maxSelections: Number(group.maxSelections) || 1,
        displayOrder: Number(group.displayOrder) || 0,
      });

      const existingItems = existingGroupById.get(groupId)?.items ?? [];
      const submittedItemIds = new Set(
        group.items
          .map((i) => i.productAddOnItemID)
          .filter((id): id is string => !!id),
      );

      const itemOps: Promise<unknown>[] = [];
      existingItems
        .filter((i) => !submittedItemIds.has(i.productAddOnItemID))
        .forEach((i) =>
          itemOps.push(api.commons.productAddOnItemDelete(i.productAddOnItemID)),
        );

      group.items.forEach((i) => {
        if (!i.productAddOnItemID) {
          itemOps.push(
            api.commons.productAddOnItemCreate({
              productAddOnGroupID: groupId!,
              name: i.name,
              additionalPrice: Number(i.additionalPrice) || 0,
              displayOrder: Number(i.displayOrder) || 0,
            }),
          );
        } else {
          itemOps.push(
            api.commons.productAddOnItemUpdate({
              productAddOnItemID: i.productAddOnItemID,
              productAddOnGroupID: groupId!,
              name: i.name,
              additionalPrice: Number(i.additionalPrice) || 0,
              displayOrder: Number(i.displayOrder) || 0,
            }),
          );
        }
      });

      await Promise.all(itemOps);
    }
  };

  const reconcileCb = useApiCallback(
    async (api, payload: { variants: FormVariant[]; groups: FormAddOnGroup[] }) => {
      await reconcileVariants(api, payload.variants);
      await reconcileAddOnGroups(api, payload.groups);
      return { data: { success: true } } as any;
    },
  );

  const handleSubmit = async (formValues: ProductFormSubmitValues) => {
    try {
      setSubmitting(true);
      const isMenuItem = formValues.productMode === "menuItem";

      const payload: UpdateProductParams = {
        productID: product.productID,
        name: formValues.name,
        description: formValues.description ?? "",
        isMenuItem,
        categoryID: formValues.categoryID ?? null,
      };

      if (isMenuItem) {
        payload.unitPrice = formValues.unitPrice;
        if (formValues.costPrice != null && formValues.costPrice > 0) {
          payload.costPrice = formValues.costPrice;
        }
      } else {
        payload.costPrice = formValues.costPrice;
        payload.purchaseQuantity = formValues.purchaseQuantity;
        payload.purchaseUnitID = formValues.purchaseUnitID;
        payload.stockUnitID = formValues.stockUnitID;
      }

      if (formValues.imageFile instanceof File) {
        payload.imageFile = formValues.imageFile;
      } else if (formValues.removeImage) {
        payload.removeImage = true;
      }

      const result = await updateProductCb.execute(payload);

      if (!(result.status === 200 && result.data.success)) {
        showToast(result.data.message || "Failed to update product", "error");
        return;
      }

      // Reconcile variants and add-on groups for menu items
      if (isMenuItem) {
        try {
          await reconcileCb.execute({
            variants: formValues.variants ?? [],
            groups: formValues.addOnGroups ?? [],
          });
        } catch (e) {
          console.error("Variant/add-on reconciliation failed:", e);
          showToast(
            "Product saved but variants/add-ons couldn't be fully updated.",
            "error",
          );
          onSuccess();
          onClose();
          return;
        }
      }

      showToast("Product updated successfully", "success");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating product:", error);
      showToast("Failed to update product", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const productMode: ProductMode = product.isMenuItem
    ? "menuItem"
    : "ingredient";

  const initialValues = useMemo<Partial<ProductFormSubmitValues>>(() => {
    const byDisplayOrder = <T extends { displayOrder: number; name: string }>(
      a: T,
      b: T,
    ): number =>
      a.displayOrder !== b.displayOrder
        ? a.displayOrder - b.displayOrder
        : a.name.localeCompare(b.name, undefined, { numeric: true });

    const sortedVariants = [...existingVariants].sort(byDisplayOrder);
    const sortedAddOnGroups = [...existingAddOnGroups]
      .sort(byDisplayOrder)
      .map((g) => ({
        ...g,
        items: [...(g.items ?? [])].sort(byDisplayOrder),
      }));

    return {
      name: product.name,
      description: product.description ?? "",
      productMode,
      unitPrice: product.unitPrice ?? undefined,
      costPrice: product.costPrice ?? undefined,
      purchaseQuantity: product.purchaseQuantity ?? undefined,
      purchaseUnitID: product.purchaseUnitID ?? "",
      stockUnitID: product.stockUnitID ?? "",
      categoryID:
        (product.isMenuItem
          ? product.productCategoryID
          : product.ingredientCategoryID) ?? null,
      imageFile: null,
      removeImage: false,
      variants: sortedVariants.map((v) => ({
        productVariantID: v.productVariantID,
        name: v.name,
        price: v.price,
        displayOrder: v.displayOrder,
      })),
      addOnGroups: sortedAddOnGroups.map((g) => ({
        productAddOnGroupID: g.productAddOnGroupID,
        name: g.name,
        isRequired: g.isRequired,
        minSelections: g.minSelections,
        maxSelections: g.maxSelections,
        displayOrder: g.displayOrder,
        items: g.items.map((i) => ({
          productAddOnItemID: i.productAddOnItemID,
          name: i.name,
          additionalPrice: i.additionalPrice,
          displayOrder: i.displayOrder,
        })),
      })),
    };
  }, [product, productMode, existingVariants, existingAddOnGroups]);

  const lookupsLoading =
    productCategoryData.loading ||
    ingredientCategoryData.loading ||
    businessSupplyCategoryData.loading ||
    unitData.loading ||
    variantsApi.loading ||
    addOnsApi.loading;

  return (
    <Box p="2">
      <FormRenderer
        formKey="product-form"
        onSubmit={handleSubmit}
        submitLoading={updateProductCb.loading || submitting}
        initialValues={initialValues}
        productCategories={productCategories}
        ingredientCategories={ingredientCategories}
        businessSupplyCategories={businessSupplyCategories}
        units={units}
        lookupsLoading={lookupsLoading}
        isInDialog={true}
        isEdit={true}
        currentImageUrl={product.imageUrl}
      />
    </Box>
  );
};
