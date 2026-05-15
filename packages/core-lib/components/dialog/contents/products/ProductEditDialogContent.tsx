import { useEffect, useState } from "react";
import {
  CreateProductParams,
  IngredientCategoryDto,
  ProductCategoryDto,
  ProductDataList,
  UnitDto,
} from "../../../../api/commons/types";
import { useToastContext } from "../../../../core/contexts";
import { useApi, useApiCallback } from "../../../../core/hooks";
import { Box } from "@mui/material";
import { FormRenderer } from "../../../radix/form/FormRenderer";

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
  const [units, setUnits] = useState<UnitDto[]>([]);

  const productCategoryData = useApi((api) => api.commons.productCategoryList());
  const ingredientCategoryData = useApi((api) =>
    api.commons.ingredientCategoryList(),
  );
  const unitData = useApi((api) => api.commons.unitList());

  useEffect(() => {
    setProductCategories(productCategoryData.result?.data.response ?? []);
  }, [productCategoryData.result?.data.response]);

  useEffect(() => {
    setIngredientCategories(ingredientCategoryData.result?.data.response ?? []);
  }, [ingredientCategoryData.result?.data.response]);

  useEffect(() => {
    setUnits(unitData.result?.data.response ?? []);
  }, [unitData.result?.data.response]);

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

  const lookupsLoading =
    productCategoryData.loading ||
    ingredientCategoryData.loading ||
    unitData.loading;

  return (
    <Box sx={{ p: 2 }}>
      <FormRenderer
        formKey="product-form"
        onSubmit={handleSubmit}
        submitLoading={updateProductCb.loading}
        initialValues={initialValues}
        productCategories={productCategories}
        ingredientCategories={ingredientCategories}
        units={units}
        lookupsLoading={lookupsLoading}
        isInDialog={true}
        isEdit={true}
      />
    </Box>
  );
};
