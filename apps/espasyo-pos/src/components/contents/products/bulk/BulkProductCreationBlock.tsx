import React, { useMemo, useRef, useState } from "react";
import {
  Box,
  Card,
  Flex,
  ScrollArea,
  Text,
} from "@radix-ui/themes";
import {
  DownloadIcon,
  PlusIcon,
  UploadIcon,
} from "@radix-ui/react-icons";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { useApi, useApiCallback, useResolution } from "core-lib/core/hooks";
import { useToastContext } from "core-lib/core/contexts/ToastContext";
import { Button } from "core-lib/components/radix/buttons/Button";
import {
  TabsContextProvider,
  TabsHeaderDesktop,
  TabsHeaderMobile,
  TabPanel,
  TabOption,
} from "core-lib/components/radix/tabs";
import { BulkProductCard } from "./BulkProductCard";
import type { BulkProductForm, ProductEntry } from "./BulkProductCard";
import { ImportResultsModal } from "./ImportResultsModal";
import type {
  BulkCreateAddOnGroup,
  BulkCreateAddOnItem,
  BulkCreateProductItem,
  BulkCreateProductResult,
  BulkCreateVariantItem,
} from "core-lib/api/commons/types";

const DEFAULT_PRODUCT_ENTRY = (isMenuItem: boolean): ProductEntry => ({
  isMenuItem,
  name: "",
  description: "",
  unitPrice: "",
  costPrice: "",
  purchaseQuantity: "",
  purchaseUnitID: "",
  stockUnitID: "",
  productCategoryID: "",
  ingredientCategoryID: "",
  variants: [],
  addOnGroups: [],
});

export const BulkProductCreationBlock: React.FC = () => {
  const { showToast } = useToastContext();
  const { isMobile } = useResolution();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importResult, setImportResult] = useState<BulkCreateProductResult | null>(null);
  const [resultsOpen, setResultsOpen] = useState(false);

  const productCategoriesApi = useApi((api) => api.commons.productCategoryList());
  const ingredientCategoriesApi = useApi((api) => api.commons.ingredientCategoryList());
  const unitsApi = useApi((api) => api.commons.unitList());
  const variantTemplatesApi = useApi((api) => api.commons.variantTemplateList());
  const addOnTemplatesApi = useApi((api) => api.commons.addOnTemplateList());

  const productCategories = productCategoriesApi.result?.data.response ?? [];
  const ingredientCategories = ingredientCategoriesApi.result?.data.response ?? [];
  const units = unitsApi.result?.data.response ?? [];
  const variantTemplates = variantTemplatesApi.result?.data.response ?? [];
  const addOnTemplates = addOnTemplatesApi.result?.data.response ?? [];

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BulkProductForm>({
    defaultValues: { products: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  const products =
    (useWatch({ control, name: "products" }) as ProductEntry[] | undefined) ?? [];

  const validProductCount = useMemo(
    () => products.filter((p) => p.name.trim() !== "").length,
    [products],
  );

  const menuItemIndices = useMemo(
    () =>
      fields
        .map((_, i) => i)
        .filter((i) => products[i]?.isMenuItem === true),
    [fields, products],
  );

  const ingredientIndices = useMemo(
    () =>
      fields
        .map((_, i) => i)
        .filter((i) => products[i]?.isMenuItem === false),
    [fields, products],
  );

  const bulkCreateCallback = useApiCallback(
    async (api, params: { products: BulkCreateProductItem[] }) => {
      const res = await api.commons.bulkCreateProducts(params);
      return res.data.response;
    },
  );

  const importExcelCallback = useApiCallback(
    async (api, params: { file: File }) => {
      const res = await api.commons.importFromExcel(params);
      return res.data.response;
    },
  );

  const downloadTemplateCallback = useApiCallback(
    async (api) => api.commons.downloadImportTemplate(),
  );

  const handleAddMenuItem = () => append(DEFAULT_PRODUCT_ENTRY(true));
  const handleAddIngredient = () => append(DEFAULT_PRODUCT_ENTRY(false));

  const handleClearAll = () => {
    reset({ products: [] });
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await downloadTemplateCallback.execute(undefined);
      if (!res) return;
      const blob = new Blob([res.data as BlobPart]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "product-import-template.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast("Failed to download template.", "error");
    }
  };

  const handleImportExcelClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const result = await importExcelCallback.execute({ file });
      if (result) {
        setImportResult(result);
        setResultsOpen(true);
        if (result.created > 0) {
          showToast(
            `Import complete: ${result.created} product${result.created !== 1 ? "s" : ""} created.`,
            "success",
          );
        }
        if (result.failed > 0) {
          showToast(
            `${result.failed} product${result.failed !== 1 ? "s" : ""} failed to import. Check results for details.`,
            "error",
          );
        }
      }
    } catch {
      showToast("Import failed. Please check the file and try again.", "error");
    }
  };

  const mapVariants = (variants: ProductEntry["variants"]): BulkCreateVariantItem[] | undefined => {
    const mapped = variants
      .filter((v) => v.name.trim() !== "")
      .map((v, idx) => ({
        name: v.name,
        price: Number(v.price) || 0,
        displayOrder: idx + 1,
      }));
    return mapped.length > 0 ? mapped : undefined;
  };

  const mapAddOnGroups = (
    groups: ProductEntry["addOnGroups"],
  ): BulkCreateAddOnGroup[] | undefined => {
    const mapped = groups
      .filter((g) => g.name.trim() !== "")
      .map((g, gi) => ({
        name: g.name,
        isRequired: !!g.isRequired,
        minSelections: Number(g.minSelections) || 0,
        maxSelections: Number(g.maxSelections) || 1,
        displayOrder: gi + 1,
        items: g.items
          .filter((i) => i.name.trim() !== "")
          .map((i, ii): BulkCreateAddOnItem => ({
            name: i.name,
            additionalPrice: Number(i.additionalPrice) || 0,
            displayOrder: ii + 1,
          })),
      }));
    return mapped.length > 0 ? mapped : undefined;
  };

  const onSubmit = async (data: BulkProductForm) => {
    const validProducts = data.products.filter((p) => p.name.trim() !== "");
    if (validProducts.length === 0) return;

    const items: BulkCreateProductItem[] = validProducts.map((p) => {
      const item: BulkCreateProductItem = {
        name: p.name,
        isMenuItem: p.isMenuItem,
      };

      if (p.description) item.description = p.description;

      if (p.isMenuItem) {
        if (p.unitPrice !== "") item.unitPrice = parseFloat(p.unitPrice);
        if (p.productCategoryID !== "") item.productCategoryID = p.productCategoryID;
        const variants = mapVariants(p.variants);
        if (variants) item.variants = variants;
        const addOnGroups = mapAddOnGroups(p.addOnGroups);
        if (addOnGroups) item.addOnGroups = addOnGroups;
      } else {
        if (p.costPrice !== "") item.costPrice = parseFloat(p.costPrice);
        if (p.purchaseQuantity !== "") item.purchaseQuantity = parseFloat(p.purchaseQuantity);
        if (p.purchaseUnitID !== "") item.purchaseUnitID = p.purchaseUnitID;
        if (p.stockUnitID !== "") item.stockUnitID = p.stockUnitID;
        if (p.ingredientCategoryID !== "") item.ingredientCategoryID = p.ingredientCategoryID;
      }

      return item;
    });

    try {
      const result = await bulkCreateCallback.execute({ products: items });
      if (result) {
        setImportResult(result);
        setResultsOpen(true);
        if (result.created > 0) {
          showToast(
            `${result.created} product${result.created !== 1 ? "s" : ""} created successfully.`,
            "success",
          );
          if (result.failed === 0) {
            reset({ products: [] });
          }
        }
        if (result.failed > 0) {
          showToast(
            `${result.failed} product${result.failed !== 1 ? "s" : ""} failed. Check results for details.`,
            "error",
          );
        }
      }
    } catch {
      showToast("Bulk creation failed. Please try again.", "error");
    }
  };

  const isLoading =
    isSubmitting ||
    bulkCreateCallback.loading ||
    importExcelCallback.loading ||
    downloadTemplateCallback.loading;

  const renderProductList = (
    indices: number[],
    emptyTitle: string,
    emptyBody: string,
    addLabel: string,
    onAdd: () => void,
  ) => (
    <Box>
      <Flex justify="end" mb="3">
        <Button type="Primary" onClick={onAdd} disabled={isLoading}>
          <Flex align="center" gap="2">
            <PlusIcon />
            {addLabel}
          </Flex>
        </Button>
      </Flex>

      {indices.length === 0 ? (
        <Card variant="surface" size="3">
          <Flex direction="column" align="center" justify="center" py="8" gap="2">
            <Text size="3" color="gray" weight="medium">
              {emptyTitle}
            </Text>
            <Text size="2" color="gray">
              {emptyBody}
            </Text>
          </Flex>
        </Card>
      ) : (
        <ScrollArea
          style={{ maxHeight: "calc(100vh - 460px)" }}
          scrollbars="vertical"
        >
          <Flex direction="column" gap="3" pr="2">
            {indices.map((idx) => (
              <BulkProductCard
                key={fields[idx].id}
                index={idx}
                control={control}
                watch={watch}
                setValue={setValue}
                remove={() => remove(idx)}
                productCategories={productCategories}
                ingredientCategories={ingredientCategories}
                units={units}
                variantTemplates={variantTemplates}
                addOnTemplates={addOnTemplates}
                errors={errors.products?.[idx] as Record<string, unknown> | undefined}
              />
            ))}
          </Flex>
        </ScrollArea>
      )}
    </Box>
  );

  const tabs = useMemo<TabOption[]>(
    () => [
      {
        key: "bulk_menu_items",
        label: `Menu Items${menuItemIndices.length > 0 ? ` (${menuItemIndices.length})` : ""}`,
        content: renderProductList(
          menuItemIndices,
          "No menu items added yet",
          "Click \"Add Menu Item\" to create one.",
          "Add Menu Item",
          handleAddMenuItem,
        ),
      },
      {
        key: "bulk_ingredients",
        label: `Ingredients${ingredientIndices.length > 0 ? ` (${ingredientIndices.length})` : ""}`,
        content: renderProductList(
          ingredientIndices,
          "No ingredients added yet",
          "Click \"Add Ingredient\" to create one.",
          "Add Ingredient",
          handleAddIngredient,
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [menuItemIndices, ingredientIndices, isLoading, fields, productCategories, ingredientCategories, units, variantTemplates, addOnTemplates, errors],
  );

  return (
    <Box style={{ width: "100%" }}>
      <Card variant="surface" size="3" mb="4">
        <Flex justify="between" align="start" gap="4" wrap="wrap">
          <Box>
            <Text size="5" weight="bold" as="p" mb="1">
              Bulk Product Creation
            </Text>
            <Text size="2" color="gray" as="p">
              Create multiple menu items and ingredients in one go. Variants and add-ons are saved with each product.
            </Text>
          </Box>

          <Flex gap="2" wrap="wrap" style={{ flexShrink: 0 }}>
            <Button
              type="Secondary"
              onClick={handleDownloadTemplate}
              loading={downloadTemplateCallback.loading}
              disabled={isLoading}
            >
              <Flex align="center" gap="2">
                <DownloadIcon />
                Download Template
              </Flex>
            </Button>

            <Button
              type="Secondary"
              onClick={handleImportExcelClick}
              loading={importExcelCallback.loading}
              disabled={isLoading}
            >
              <Flex align="center" gap="2">
                <UploadIcon />
                Import from Excel
              </Flex>
            </Button>
          </Flex>
        </Flex>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </Card>

      <Card variant="surface" size="2" mb="4">
        <TabsContextProvider>
          {isMobile ? (
            <TabsHeaderMobile id="bulk_products_mobile" tabs={tabs} />
          ) : (
            <TabsHeaderDesktop id="bulk_products_desktop" tabs={tabs} />
          )}
          {tabs.map((tab, index) => (
            <TabPanel
              index={index}
              id={`${tab.key}_tabpanel_${index}`}
              aria-labelledby={`${tab.key}_tab_${index}`}
              key={tab.key}
            >
              <Box pt="4">{tab.content}</Box>
            </TabPanel>
          ))}
        </TabsContextProvider>
      </Card>

      {validProductCount > 0 && (
        <Card variant="surface" size="2">
          <Flex justify="between" align="center" gap="3">
            <Text size="2" color="gray">
              {validProductCount} product{validProductCount !== 1 ? "s" : ""} ready to create
            </Text>
            <Flex gap="2">
              <Button
                type="Secondary"
                onClick={handleClearAll}
                disabled={isLoading}
              >
                Clear All
              </Button>
              <Button
                type="Primary"
                onClick={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={validProductCount === 0 || isLoading}
              >
                Create {validProductCount} Product{validProductCount !== 1 ? "s" : ""}
              </Button>
            </Flex>
          </Flex>
        </Card>
      )}

      <ImportResultsModal
        open={resultsOpen}
        result={importResult}
        onClose={() => setResultsOpen(false)}
      />
    </Box>
  );
};
