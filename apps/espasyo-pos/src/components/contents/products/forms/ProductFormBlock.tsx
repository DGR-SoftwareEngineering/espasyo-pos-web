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
import { BulkProductCreationBlock } from "../bulk/BulkProductCreationBlock";
import { useApiCallback, useApi, useResolution } from "core-lib/core/hooks";
import {
  CreateProductParams,
  IngredientCategoryDto,
  ProductCategoryDto,
  UnitDto,
  ProductVariantTemplateDto,
  ProductAddOnTemplateDto,
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
  const [variantTemplates, setVariantTemplates] = useState<ProductVariantTemplateDto[]>([]);
  const [addOnTemplates, setAddOnTemplates] = useState<ProductAddOnTemplateDto[]>([]);
  const { showToast } = useToastContext();
  const { isMobile } = useResolution();

  const productCategoryData = useApi((api) => api.commons.productCategoryList());
  const ingredientCategoryData = useApi((api) =>
    api.commons.ingredientCategoryList(),
  );
  const unitData = useApi((api) => api.commons.unitList());
  const variantTemplatesData = useApi((api) => api.commons.variantTemplateList());
  const addOnTemplatesData = useApi((api) => api.commons.addOnTemplateList());

  const productCb = useApiCallback(
    async (api, args: CreateProductParams) =>
      await api.commons.createNewProduct(args),
  );

  const variantCreateCb = useApiCallback(
    async (
      api,
      args: { productID: string; name: string; price: number; displayOrder: number },
    ) => await api.commons.productVariantCreate(args),
  );

  const addOnGroupCreateCb = useApiCallback(
    async (
      api,
      args: {
        productID: string;
        name: string;
        isRequired: boolean;
        minSelections: number;
        maxSelections: number;
        displayOrder: number;
        items?: { name: string; additionalPrice: number; displayOrder: number }[];
      },
    ) => await api.commons.productAddOnGroupCreate(args),
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

  useEffect(() => {
    setVariantTemplates(variantTemplatesData.result?.data.response ?? []);
  }, [variantTemplatesData.result?.data.response]);

  useEffect(() => {
    setAddOnTemplates(addOnTemplatesData.result?.data.response ?? []);
  }, [addOnTemplatesData.result?.data.response]);

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
        const newProductId = (result.data.response as any)?.productID ?? null;

        // Post initial variants and add-on groups (menu items only)
        if (isMenuItem && newProductId) {
          const variants = formData.variants ?? [];
          const groups = formData.addOnGroups ?? [];
          try {
            await Promise.all([
              ...variants.map((v) =>
                variantCreateCb.execute({
                  productID: newProductId,
                  name: v.name,
                  price: Number(v.price),
                  displayOrder: Number(v.displayOrder) || 0,
                }),
              ),
              ...groups.map((g) =>
                addOnGroupCreateCb.execute({
                  productID: newProductId,
                  name: g.name,
                  isRequired: !!g.isRequired,
                  minSelections: Number(g.minSelections) || 0,
                  maxSelections: Number(g.maxSelections) || 1,
                  displayOrder: Number(g.displayOrder) || 0,
                  items: (g.items ?? []).map((i) => ({
                    name: i.name,
                    additionalPrice: Number(i.additionalPrice) || 0,
                    displayOrder: Number(i.displayOrder) || 0,
                  })),
                }),
              ),
            ]);
          } catch (e) {
            console.error(
              "Product created but variants/add-ons partially failed:",
              e,
            );
            showToast(
              "Product created but some variants/add-ons couldn't be saved.",
              "error",
            );
            setResetForm(true);
            setTimeout(() => setResetForm(false), 100);
            return;
          }
        }

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
    unitData.loading ||
    variantTemplatesData.loading ||
    addOnTemplatesData.loading;

  const tabs = useMemo<TabOption[]>(
    () => [
      {
        key: "product_creation",
        label: "Single Product",
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
            variantTemplates={variantTemplates}
            addOnTemplates={addOnTemplates}
          />
        ),
      },
      {
        key: "multiple_products_creation",
        label: "Multiple Products",
        content: <BulkProductCreationBlock />,
      },
      {
        key: "business_expense_creation",
        label: "Business Expense",
        content: <BusinessExpenseFormBlock />,
      },
    ],
    [productCategories, ingredientCategories, units, variantTemplates, addOnTemplates, loading, lookupsLoading, resetForm],
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
