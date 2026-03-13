import { useToastContext } from "core-lib";
import React, { useEffect, useState } from "react";
import { ProductForm } from "./ProductForm";
import { ProductForm as ProductFormType } from "./validation";
import { useApiCallback, useApi } from "../../../../core/hooks";
import {
  CategoryDataList,
  CreateProductParams,
} from "../../../../api/commons/types";

export const ProductFormBlock: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resetForm, setResetForm] = useState(false);
  const [categories, setCategories] = useState<CategoryDataList[]>([]);
  const { showToast } = useToastContext();

  const data = useApi((api) => api.commons.categoryList());
  const productCb = useApiCallback(
    async (api, args: CreateProductParams) =>
      await api.commons.createNewProduct(args),
  );

  useEffect(() => {
    setCategories(data.result?.data.response ?? []);
  }, [data.result?.data.response]);

  const handleSubmit = async (formData: ProductFormType) => {
    try {
      setLoading(true);

      const payload: CreateProductParams = {
        name: formData.name,
        description: formData.description || "",
        isMenuItem: formData.isMenuItem,
        categoryID: formData.categoryID || null,
      };

      if (formData.isMenuItem) {
        payload.unitPrice = formData.unitPrice!;
      } else {
        payload.costPrice = formData.costPrice!;
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

  return (
    <ProductForm
      submitLoading={loading || data.loading}
      resetForm={resetForm}
      onSubmit={handleSubmit}
      isInDialog={false}
      categories={categories}
    />
  );
};
