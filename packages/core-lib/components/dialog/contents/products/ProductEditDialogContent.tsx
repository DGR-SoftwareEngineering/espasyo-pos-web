import { useEffect, useState } from "react";
import {
  CategoryDataList,
  CreateProductParams,
  ProductDataList,
} from "../../../../api/commons/types";
import { useToastContext } from "../../../../core/contexts";
import { useApi, useApiCallback } from "../../../../core/hooks";
import { Box } from "@mui/material";
import { FormRenderer } from "../../../form";

export const ProductEditDialogContent: React.FC<{
  product: ProductDataList;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ product, onSuccess, onClose }) => {
  const { showToast } = useToastContext();
  const [categories, setCategories] = useState<CategoryDataList[]>([]);

  const categoriesData = useApi((api) => api.commons.categoryList());

  useEffect(() => {
    setCategories(categoriesData.result?.data.response ?? []);
  }, [categoriesData.result?.data.response]);
  const updateProductCb = useApiCallback(
    async (api, args: CreateProductParams & { productID: string }) =>
      await api.commons.updateProduct(args),
  );

  const handleSubmit = async (formValues: CreateProductParams) => {
    try {
      const apiValues: CreateProductParams = {
        name: formValues.name,
        description: formValues.description,
        isMenuItem: formValues.isMenuItem,
        categoryID: formValues.categoryID,
      };

      if (formValues.isMenuItem) {
        apiValues.unitPrice = formValues.unitPrice;
      } else if (formValues.costPrice) {
        apiValues.costPrice = formValues.costPrice;
      }

      const updateData = {
        productID: product.productID,
        ...apiValues,
      };

      const result = await updateProductCb.execute(updateData);

      if (result.status === 200 && result.data.success) {
        showToast("Product updated successfully", "success");
        onSuccess();
        onClose();
      }
    } catch (error) {
      showToast("Failed to update product", "error");
    }
  };

  const initialValues: Partial<CreateProductParams> = {
    name: product.name,
    description: product.description ?? "no-description",
    unitPrice: product.unitPrice ?? 0.01,
    costPrice: product.costPrice ?? undefined,
    isMenuItem: product.isMenuItem,
    categoryID: product.categoryID || null,
  };

  return (
    <Box sx={{ p: 2 }}>
      <FormRenderer
        formKey="product-form" //TODO: we can pass this as a prop
        onSubmit={handleSubmit}
        submitLoading={updateProductCb.loading}
        initialValues={initialValues}
        categories={categories}
        isInDialog={true}
        isEdit={true}
      />
    </Box>
  );
};
