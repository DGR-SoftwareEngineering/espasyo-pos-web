import React, { useEffect, useMemo, useState } from "react";
import { useToastContext } from "core-lib";
import { useApi, useApiCallback } from "core-lib/core/hooks";
import {
  CreateInventoryParams,
  ProductDataList,
} from "core-lib/api/commons/types";
import { InventoryForm } from "./InventoryForm";
import { InventoryFormValues } from "./validation";

export const InventoryFormBlock: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resetForm, setResetForm] = useState(false);
  const { showToast } = useToastContext();

  const ingredientsData = useApi((api) =>
    api.commons.getProductByIngredientsOrMenu(false),
  );

  const ingredients = useMemo<ProductDataList[]>(
    () =>
      (ingredientsData.result?.data.response ?? []).filter((p) => p.isActive),
    [ingredientsData.result?.data.response],
  );

  const createInventoryCb = useApiCallback(
    async (api, args: CreateInventoryParams) =>
      await api.commons.createInventory(args),
  );

  const handleSubmit = async (formData: InventoryFormValues) => {
    try {
      setLoading(true);
      const payload: CreateInventoryParams = {
        productID: formData.productID,
        currentQuantity: formData.currentQuantity,
        reorderLevel: formData.reorderLevel,
        minimumStockLevel: formData.minimumStockLevel,
      };

      const result = await createInventoryCb.execute(payload);

      if (result.status >= 200 && result.status < 300 && result.data.success) {
        showToast("Inventory created successfully", "success");
        setResetForm(true);
        setTimeout(() => setResetForm(false), 100);
      } else {
        const errMessage =
          (Array.isArray(result.data.errors)
            ? (result.data.errors as string[])[0]
            : null) ??
          result.data.message ??
          "Failed to create inventory";
        showToast(errMessage, "error");
      }
    } catch (error) {
      console.error("Error creating inventory:", error);
      showToast("Failed to create inventory", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // noop — keeps lint happy and reserves a place for side effects later
  }, [ingredients]);

  return (
    <InventoryForm
      submitLoading={loading || createInventoryCb.loading}
      resetForm={resetForm}
      onSubmit={handleSubmit}
      isInDialog={false}
      ingredients={ingredients}
      ingredientsLoading={ingredientsData.loading}
    />
  );
};
