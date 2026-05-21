import { useEffect, useState } from "react";
import {
  BusinessSupplyCategoryDto,
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

type ProductMode = "menuItem" | "ingredient" | "supply";

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

  const productCategoryData = useApi((api) => api.commons.productCategoryList());
  const ingredientCategoryData = useApi((api) =>
    api.commons.ingredientCategoryList(),
  );
  const businessSupplyCategoryData = useApi((api) =>
    api.commons.businessSupplyCategoryList(),
  );
  const unitData = useApi((api) => api.commons.unitList());

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

  const handleSubmit = async (formValues: ProductFormSubmitValues) => {
    try {
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

  const productMode: ProductMode = product.isMenuItem
    ? "menuItem"
    : "ingredient";

  const initialValues: Partial<ProductFormSubmitValues> = {
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
  };

  const lookupsLoading =
    productCategoryData.loading ||
    ingredientCategoryData.loading ||
    businessSupplyCategoryData.loading ||
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
