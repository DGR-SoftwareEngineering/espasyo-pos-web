import { useToastContext } from "core-lib";
import React, { useEffect, useState } from "react";
import { ProductForm } from "./ProductForm";
import { ProductForm as ProductFormType } from "./validation";
import { useApiCallback, useApi } from "core-lib/core/hooks";
import {
  CreateProductParams,
  IngredientCategoryDto,
  ProductCategoryDto,
  UnitDto,
} from "core-lib/api/commons/types";

export const ProductFormBlock: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resetForm, setResetForm] = useState(false);
  const [productCategories, setProductCategories] = useState<
    ProductCategoryDto[]
  >([]);
  const [ingredientCategories, setIngredientCategories] = useState<
    IngredientCategoryDto[]
  >([]);
  const [units, setUnits] = useState<UnitDto[]>([]);
  const { showToast } = useToastContext();

  const productCategoryData = useApi((api) => api.commons.productCategoryList());
  const ingredientCategoryData = useApi((api) =>
    api.commons.ingredientCategoryList(),
  );
  const unitData = useApi((api) => api.commons.unitList());

  const productCb = useApiCallback(
    async (api, args: CreateProductParams) =>
      await api.commons.createNewProduct(args),
  );

  useEffect(() => {
    setProductCategories(productCategoryData.result?.data.response ?? []);
  }, [productCategoryData.result?.data.response]);

  useEffect(() => {
    setIngredientCategories(ingredientCategoryData.result?.data.response ?? []);
  }, [ingredientCategoryData.result?.data.response]);

  useEffect(() => {
    setUnits(unitData.result?.data.response ?? []);
  }, [unitData.result?.data.response]);

  const handleSubmit = async (formData: ProductFormType) => {
    try {
      setLoading(true);

      const payload: CreateProductParams = {
        name: formData.name,
        description: formData.description || "",
        isMenuItem: formData.isMenuItem,
        categoryID: formData.categoryID || null,
        imageFile: formData.imageFile ?? null,
      };

      if (formData.isMenuItem) {
        payload.unitPrice = formData.unitPrice!;
      } else {
        payload.costPrice = formData.costPrice!;
        payload.purchaseQuantity = formData.purchaseQuantity;
        payload.purchaseUnitID = formData.purchaseUnitID!;
        payload.stockUnitID = formData.stockUnitID!;
      }

      const result = await productCb.execute(payload);

      if (result.status === 200 && result.data.success) {
        showToast("Product created successfully", "success");
        setResetForm(true);
        setTimeout(() => setResetForm(false), 100);
      } else {
        showToast(result.data.message || "Failed to create product", "error");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      showToast("Failed to create product", "error");
    } finally {
      setLoading(false);
    }
  };

  const lookupsLoading =
    productCategoryData.loading ||
    ingredientCategoryData.loading ||
    unitData.loading;

  return (
    <ProductForm
      submitLoading={loading || lookupsLoading}
      resetForm={resetForm}
      onSubmit={handleSubmit}
      isInDialog={false}
      productCategories={productCategories}
      ingredientCategories={ingredientCategories}
      units={units}
      lookupsLoading={lookupsLoading}
    />
  );
};
