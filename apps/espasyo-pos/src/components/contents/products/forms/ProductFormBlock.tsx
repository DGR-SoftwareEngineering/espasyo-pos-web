import { useToastContext } from "core-lib";
import React, { useMemo, useState } from "react";
import { Box } from "@radix-ui/themes";
import {
  TabsContextProvider,
  TabsHeaderDesktop,
  TabsHeaderMobile,
  TabPanel,
  TabOption,
} from "core-lib/components/radix/tabs";
import { ProductForm } from "./ProductForm";
import { ProductForm as ProductFormType } from "./validation";
import { BusinessExpenseFormBlock } from "./BusinessExpenseForm/BusinessExpenseFormBlock";
import { useApiCallback, useApi, useResolution } from "core-lib/core/hooks";
import {
  CreateProductParams,
  IngredientCategoryDto,
  ProductCategoryDto,
  UnitDto,
} from "core-lib/api/commons/types";
import { useEffect } from "react";

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
  const { isMobile } = useResolution();

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

      const isMenuItem = formData.productMode === "menuItem";

      const payload: CreateProductParams = {
        name: formData.name,
        description: formData.description || "",
        isMenuItem,
        categoryID: formData.categoryID || null,
        imageFile: formData.imageFile ?? null,
      };

      if (isMenuItem) {
        payload.unitPrice = formData.unitPrice!;
        if (formData.costPrice != null && formData.costPrice > 0) {
          payload.costPrice = formData.costPrice;
        }
      } else {
        // ingredient
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

  const tabs = useMemo<TabOption[]>(
    () => [
      {
        key: "product_creation",
        label: "Product",
        content: (
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
        ),
      },
      {
        key: "business_expense_creation",
        label: "Business Expense",
        content: <BusinessExpenseFormBlock />,
      },
    ],
    [productCategories, ingredientCategories, units, loading, lookupsLoading, resetForm],
  );

  return (
    <TabsContextProvider>
      {isMobile ? (
        <TabsHeaderMobile id="product_creation_mobile" tabs={tabs} />
      ) : (
        <TabsHeaderDesktop id="product_creation_desktop" tabs={tabs} />
      )}
      {tabs.map((tab, index) => (
        <TabPanel
          index={index}
          id={`${tab.key}_tabpanel_${index}`}
          aria-labelledby={`${tab.key}_tab_${index}`}
          key={`${tab.key}_${index}`}
        >
          <Box pt="4">{tab.content}</Box>
        </TabPanel>
      ))}
    </TabsContextProvider>
  );
};
