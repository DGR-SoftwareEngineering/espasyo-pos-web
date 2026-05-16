import { useEffect, useState } from "react";
import {
  IngredientCategoryDto,
  ProductCategoryDto,
  ProductDataList,
  UnitDto,
  UpdateProductParams,
} from "../../../../api/commons/types";
import { useToastContext } from "../../../../core/contexts";
import { useApi, useApiCallback } from "../../../../core/hooks";
import { Box } from "@radix-ui/themes";
import { FormRenderer } from "../../../radix/form/FormRenderer";

interface ProductFormSubmitValues {
  name: string;
  description?: string | null;
  isMenuItem: boolean;
  categoryID?: string | null;
  unitPrice?: number;
  costPrice?: number;
  purchaseQuantity?: number;
  purchaseUnitID?: string;
  stockUnitID?: string;
  imageFile?: File | null;
  removeImage?: boolean;
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
    async (api, args: UpdateProductParams) =>
      await api.commons.updateProduct(args),
  );

  const handleSubmit = async (formValues: ProductFormSubmitValues) => {
    try {
      const payload: UpdateProductParams = {
        productID: product.productID,
        name: formValues.name,
        description: formValues.description ?? "",
        isMenuItem: formValues.isMenuItem,
        categoryID: formValues.categoryID ?? null,
      };

      if (formValues.isMenuItem) {
        payload.unitPrice = formValues.unitPrice;
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

      if (result.status === 200 && result.data.success) {
        showToast("Product updated successfully", "success");
        onSuccess();
        onClose();
      } else {
        showToast(result.data.message || "Failed to update product", "error");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      showToast("Failed to update product", "error");
    }
  };

  const initialValues: Partial<ProductFormSubmitValues> = {
    name: product.name,
    description: product.description ?? "",
    unitPrice: product.unitPrice ?? undefined,
    costPrice: product.costPrice ?? undefined,
    purchaseQuantity: product.purchaseQuantity ?? undefined,
    purchaseUnitID: product.purchaseUnitID ?? "",
    stockUnitID: product.stockUnitID ?? "",
    isMenuItem: product.isMenuItem,
    categoryID:
      (product.isMenuItem
        ? product.productCategoryID
        : product.ingredientCategoryID) ?? null,
    imageFile: null,
    removeImage: false,
  };

  const lookupsLoading =
    productCategoryData.loading ||
    ingredientCategoryData.loading ||
    unitData.loading;

  return (
    <Box p="2">
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
        currentImageUrl={product.imageUrl}
      />
    </Box>
  );
};
