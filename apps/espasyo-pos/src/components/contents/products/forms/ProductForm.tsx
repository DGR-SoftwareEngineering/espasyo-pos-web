import React from "react";
import { useWatch } from "react-hook-form";
import { Box, Callout, Card, Flex, Grid, Select, Text } from "@radix-ui/themes";
import {
  DescriptionOutlined,
  ImageOutlined,
  InfoOutlined,
  InventoryOutlined,
  KitchenOutlined,
  LocalShippingOutlined,
  RestaurantMenuOutlined,
  ScaleOutlined,
  SwapHorizOutlined,
  TuneOutlined,
  LocalCafeOutlined,
} from "@mui/icons-material";
import { ProductVariantsSection } from "./ProductVariantsSection";
import { ProductAddOnGroupsSection } from "./ProductAddOnGroupsSection";
import { ToggleField, ToggleOption } from "core-lib/components/radix/toggle/ToggleField";
import { TextField } from "core-lib/components/radix/form/TextField";
import { SelectField } from "core-lib/components/radix/form/SelectField";
import { ImageUploadField } from "core-lib/components/radix/form/ImageUploadField";
import { ImageReader } from "core-lib/components/radix/ImageReader";
import { Button } from "core-lib/components/radix/buttons/Button";
import { FormHeader } from "core-lib/components/radix/FormHeader";
import { FormSection } from "core-lib/components/radix/FormSection";
import { FormActions } from "core-lib/components/radix/FormActions";
import { FormErrorSummary } from "core-lib/components/radix/FormErrorSummary";
import { PreviewBanner } from "core-lib/components/radix/banner/PreviewBanner";
import { useProductForm } from "../hooks";
import { toSelectOptionsWithField } from "core-lib/business/array";
import { formatPrice } from "core-lib/business/strings";
import { PLACEHOLDERS } from "../constants";
import { ProductFormProps } from "./types";
import type { ProductMode } from "./validation";

const FIELD_LABELS: Record<string, string> = {
  name: "Product Name",
  description: "Description",
  productMode: "Product Type",
  unitPrice: "Selling Price",
  costPrice: "Cost Price",
  purchaseQuantity: "Purchase Quantity",
  purchaseUnitID: "Purchase Unit",
  stockUnitID: "Stock Unit",
  categoryID: "Category",
  imageFile: "Image",
};

const PRODUCT_MODE_OPTIONS: ToggleOption<ProductMode>[] = [
  {
    value: "menuItem",
    label: "Menu Item",
    description: "Sold to customers at POS",
    icon: <RestaurantMenuOutlined fontSize="small" />,
    selectedColor: "success",
  },
  {
    value: "ingredient",
    label: "Ingredient",
    description: "Raw material for recipes — stock deducted on sale",
    icon: <KitchenOutlined fontSize="small" />,
    selectedColor: "info",
  },
];

export const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  submitLoading,
  resetForm,
  initialValues,
  isEdit = false,
  isInDialog = false,
  productCategories,
  ingredientCategories,
  units,
  currentImageUrl,
  variantTemplates,
  addOnTemplates,
}) => {
  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
    watchedValues,
    isDirty,
    submissionKey,
    handleProductModeChange,
    watch,
    setValue,
  } = useProductForm({
    initialValues,
    resetForm,
    isEdit,
    isInDialog,
    onSubmit,
  });

  const productMode = watchedValues.productMode;
  const isMenuItem = productMode === "menuItem";
  const isIngredient = productMode === "ingredient";

  const watchedImageFile = watch("imageFile");
  const watchedRemoveImage = watch("removeImage");
  const watchedVariants = useWatch({ control, name: "variants" });
  const hasVariantsDefined = (watchedVariants ?? []).length > 0;
  const showCurrentImage = isEdit && !!currentImageUrl && !watchedImageFile;

  const [selectedRootId, setSelectedRootId] = React.useState<string | null>(null);

  // Reset root selection when product mode changes (mode change also clears categoryID)
  React.useEffect(() => {
    setSelectedRootId(null);
  }, [productMode]);

  // On edit pre-load: auto-derive the root from the saved categoryID
  React.useEffect(() => {
    const currentCatId = watchedValues.categoryId;
    if (!currentCatId) return;
    setSelectedRootId((prevRoot) => {
      if (prevRoot) return prevRoot;
      if (isMenuItem) {
        const found = (productCategories ?? []).find((c) => c.productCategoryID === currentCatId);
        if (found?.parentProductCategoryID) return found.parentProductCategoryID;
        if (found) return currentCatId;
      } else {
        const found = (ingredientCategories ?? []).find((c) => c.ingredientCategoryID === currentCatId);
        if (found?.parentIngredientCategoryID) return found.parentIngredientCategoryID;
        if (found) return currentCatId;
      }
      return prevRoot;
    });
  }, [watchedValues.categoryId, productCategories, ingredientCategories, isMenuItem]);

  const rootCategoryOptions = React.useMemo(() => {
    if (isMenuItem) {
      return (productCategories ?? [])
        .filter((c) => !c.parentProductCategoryID)
        .map((c) => ({ value: c.productCategoryID, label: c.name }));
    }
    return (ingredientCategories ?? [])
      .filter((c) => !c.parentIngredientCategoryID)
      .map((c) => ({ value: c.ingredientCategoryID, label: c.name }));
  }, [isMenuItem, productCategories, ingredientCategories]);

  const subCategoryOptions = React.useMemo(() => {
    if (!selectedRootId) return [];
    if (isMenuItem) {
      return (productCategories ?? [])
        .filter((c) => c.parentProductCategoryID === selectedRootId)
        .map((c) => ({ value: c.productCategoryID, label: c.name }));
    }
    return (ingredientCategories ?? [])
      .filter((c) => c.parentIngredientCategoryID === selectedRootId)
      .map((c) => ({ value: c.ingredientCategoryID, label: c.name }));
  }, [isMenuItem, productCategories, ingredientCategories, selectedRootId]);

  const rootHasChildren = subCategoryOptions.length > 0;

  const handleRootChange = React.useCallback((rootId: string) => {
    const hasChildren = isMenuItem
      ? (productCategories ?? []).some((c) => c.parentProductCategoryID === rootId)
      : (ingredientCategories ?? []).some((c) => c.parentIngredientCategoryID === rootId);
    setSelectedRootId(rootId);
    if (!hasChildren) {
      setValue("categoryID", rootId, { shouldValidate: true });
    } else {
      setValue("categoryID", null as any, { shouldValidate: false });
    }
  }, [isMenuItem, productCategories, ingredientCategories, setValue]);

  const unitOptions = React.useMemo(
    () => toSelectOptionsWithField(units ?? [], "unitID", "name"),
    [units],
  );

  const selectedCategory = React.useMemo(() => {
    if (!watchedValues.categoryId) return undefined;
    if (isMenuItem) {
      const cat = productCategories?.find(
        (c) => c.productCategoryID === watchedValues.categoryId,
      );
      return cat
        ? { categoryID: cat.productCategoryID, name: cat.name }
        : undefined;
    }
    const cat = ingredientCategories?.find(
      (c) => c.ingredientCategoryID === watchedValues.categoryId,
    );
    return cat
      ? { categoryID: cat.ingredientCategoryID, name: cat.name }
      : undefined;
  }, [
    isMenuItem,
    productCategories,
    ingredientCategories,
    watchedValues.categoryId,
  ]);

  const handleFormSubmit = handleSubmit(onSubmit);
  const handleButtonClick = () => handleFormSubmit();

  const previewItem = React.useMemo(() => {
    const price = isMenuItem
      ? watchedValues.unitPrice
      : watchedValues.costPrice;
    const formattedPrice = price && price > 0 ? formatPrice(price) : undefined;
    return {
      name: watchedValues.name || "",
      category: selectedCategory,
      formattedPrice,
      priceValue: price,
    };
  }, [
    watchedValues.name,
    watchedValues.unitPrice,
    watchedValues.costPrice,
    isMenuItem,
    selectedCategory,
  ]);

  return (
    <Card variant="surface" size="3" style={{ width: "100%" }}>
      <FormHeader
        isEdit={isEdit}
        title="Product"
        editTitle="Edit Product"
        subtitle="Add a new product to your inventory catalog"
        editSubtitle="Update product details"
        icon={InventoryOutlined}
      />

      {watchedValues.name && (
        <PreviewBanner
          item={previewItem}
          type={isMenuItem ? "menuItem" : "ingredient"}
          showCategory
        />
      )}

      <Box p="4">
        <Flex direction="column" gap="4">
          <FormErrorSummary errors={errors} fieldLabels={FIELD_LABELS} />

          <FormSection
            icon={<DescriptionOutlined style={{ color: "var(--accent-11)" }} />}
            title="Basic Information"
          >
            <Flex direction="column" gap="3">
              <TextField
                name="name"
                control={control}
                label="Product Name"
                placeholder={PLACEHOLDERS.productName}
              />
              <TextField
                name="description"
                control={control}
                label="Description"
                placeholder={PLACEHOLDERS.description}
                multiline
                rows={3}
              />

              {/* Single flat 3-way toggle — replaces the nested isMenuItem + productType approach */}
              <ToggleField
                name="productMode"
                control={control}
                options={PRODUCT_MODE_OPTIONS}
                label="Product Type"
                required
                onChange={handleProductModeChange}
              />

              {/* Main Category — uncontrolled by RHF; drives sub-category list */}
              <Flex direction="column" gap="1">
                <Text as="label" size="2" weight="medium">
                  {isMenuItem ? "Main Category" : "Category"}
                </Text>
                <Select.Root
                  value={selectedRootId ?? undefined}
                  onValueChange={handleRootChange}
                >
                  <Select.Trigger placeholder="Select main category…" />
                  <Select.Content position="popper">
                    {rootCategoryOptions.length === 0 ? (
                      <Select.Item value="__empty" disabled>No categories</Select.Item>
                    ) : (
                      rootCategoryOptions.map((opt) => (
                        <Select.Item key={opt.value} value={opt.value}>
                          {opt.label}
                        </Select.Item>
                      ))
                    )}
                  </Select.Content>
                </Select.Root>
                {!selectedRootId && errors.categoryID && (
                  <Text size="1" color="red">{errors.categoryID.message}</Text>
                )}
              </Flex>

              {/* Sub-Category — only when selected root has children */}
              {selectedRootId && rootHasChildren && (
                <SelectField
                  name="categoryID"
                  control={control}
                  label="Sub-Category"
                  options={subCategoryOptions}
                  placeholder="Select sub-category…"
                />
              )}
            </Flex>
          </FormSection>

          <FormSection
            icon={<ImageOutlined style={{ color: "var(--violet-11)" }} />}
            title="Product Image"
            description="Optional. Used on menu cards and inventory chips. PNG, JPG, WebP up to 5 MB."
          >
            <Flex direction="column" gap="3">
              {showCurrentImage && (
                <Flex
                  align="center"
                  gap="3"
                  p="3"
                  style={{
                    borderRadius: "var(--radius-3)",
                    border: "1px solid var(--gray-a5)",
                    background: watchedRemoveImage
                      ? "var(--red-a2)"
                      : "var(--gray-a2)",
                  }}
                >
                  <ImageReader
                    src={currentImageUrl}
                    alt={watchedValues.name || "Current product image"}
                    size={56}
                    radius="2"
                    border
                    fallbackText={watchedValues.name}
                    style={{
                      opacity: watchedRemoveImage ? 0.4 : 1,
                      filter: watchedRemoveImage ? "grayscale(0.6)" : undefined,
                    }}
                  />
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      size="2"
                      weight="bold"
                      as="div"
                      style={{
                        textDecoration: watchedRemoveImage
                          ? "line-through"
                          : undefined,
                      }}
                    >
                      Current image
                    </Text>
                    <Text size="1" color="gray" as="div">
                      {watchedRemoveImage
                        ? "Will be removed when you save."
                        : "Drop a new image below to replace it."}
                    </Text>
                  </Box>
                  {watchedRemoveImage ? (
                    <Button
                      type="Secondary"
                      onClick={() =>
                        setValue("removeImage", false, { shouldDirty: true })
                      }
                    >
                      Undo
                    </Button>
                  ) : (
                    <Button
                      type="Critical"
                      onClick={() => {
                        setValue("imageFile", null, { shouldDirty: true });
                        setValue("removeImage", true, { shouldDirty: true });
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </Flex>
              )}

              <ImageUploadField
                name="imageFile"
                control={control}
                label=""
                accept="image/*"
                maxSizeBytes={5 * 1024 * 1024}
              />
            </Flex>
          </FormSection>

          {/* ── Menu Item: selling price + optional material cost ── */}
          {isMenuItem && (
            <FormSection
              icon={<RestaurantMenuOutlined style={{ color: "var(--green-11)" }} />}
              title="Menu Item Pricing"
            >
              <Grid columns={{ initial: "1", md: "2" }} gap="3">
                <Box>
                  <TextField
                    name="unitPrice"
                    control={control}
                    label={hasVariantsDefined ? "Selling Price (Optional)" : "Selling Price"}
                    type="number"
                    placeholder={PLACEHOLDERS.price}
                  />
                  <Text size="1" color="gray" as="div" mt="1">
                    {hasVariantsDefined
                      ? "Optional — POS will use the selected variant's price."
                      : "Price customers pay at the POS."}
                  </Text>
                </Box>
                <Box>
                  <TextField
                    name="costPrice"
                    control={control}
                    label="Material Cost (Optional)"
                    type="number"
                    placeholder="0.00"
                  />
                  <Text size="1" color="gray" as="div" mt="1">
                    Estimated cost to produce this item — used for profit tracking
                  </Text>
                </Box>
              </Grid>
            </FormSection>
          )}

          {/* ── Menu Item: variants ── */}
          {isMenuItem && (
            <FormSection
              icon={<TuneOutlined style={{ color: "var(--orange-11)" }} />}
              title="Product Variants"
              description="Optional. Define size or format options (e.g., 12oz · 16oz · 22oz). Each variant has its own price."
            >
              <ProductVariantsSection
                control={control}
                variantTemplates={variantTemplates ?? []}
              />
            </FormSection>
          )}

          {/* ── Menu Item: add-on groups ── */}
          {isMenuItem && (
            <FormSection
              icon={<LocalCafeOutlined style={{ color: "var(--purple-11)" }} />}
              title="Add-On Groups"
              description="Optional. Modifier groups customers can pick at the POS (e.g., 'Extras' with Cheese, Bacon)."
            >
              <ProductAddOnGroupsSection
                control={control}
                addOnTemplates={addOnTemplates ?? []}
              />
            </FormSection>
          )}

          {/* ── Ingredient: purchase info + stock unit (recipe conversion) ── */}
          {isIngredient && (
            <>
              <FormSection
                icon={<LocalShippingOutlined style={{ color: "var(--amber-11)" }} />}
                title="Purchase Information"
              >
                <Grid columns={{ initial: "1", md: "3" }} gap="3">
                  <Box>
                    <TextField
                      name="costPrice"
                      control={control}
                      label="Total Purchase Cost"
                      type="number"
                      placeholder="2300"
                    />
                    <Text size="1" color="gray" as="div" mt="1">
                      Total amount paid to supplier (e.g., ₱2,300 for 15 kg)
                    </Text>
                  </Box>
                  <Box>
                    <TextField
                      name="purchaseQuantity"
                      control={control}
                      label="Purchase Quantity"
                      type="number"
                      placeholder="15"
                    />
                    <Text size="1" color="gray" as="div" mt="1">
                      How many units you bought
                    </Text>
                  </Box>
                  <Box>
                    <SelectField
                      name="purchaseUnitID"
                      control={control}
                      options={unitOptions}
                      label="Purchase Unit"
                    />
                    <Text size="1" color="gray" as="div" mt="1">
                      Unit you buy from supplier (e.g., kg)
                    </Text>
                  </Box>
                </Grid>
              </FormSection>

              <FormSection
                icon={<ScaleOutlined style={{ color: "var(--blue-11)" }} />}
                title="Stock Information"
              >
                <Grid columns={{ initial: "1", md: "2" }} gap="3">
                  <Box>
                    <SelectField
                      name="stockUnitID"
                      control={control}
                      options={unitOptions}
                      label="Stock Unit"
                    />
                    <Text size="1" color="gray" as="div" mt="1">
                      Unit used in recipes and inventory (e.g., pcs)
                    </Text>
                  </Box>
                  <Box
                    p="3"
                    style={{
                      background: "var(--blue-a3)",
                      border: "1px solid var(--blue-a5)",
                      borderRadius: "var(--radius-3)",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Flex align="start" gap="2">
                      <SwapHorizOutlined
                        style={{
                          color: "var(--blue-11)",
                          fontSize: 20,
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      />
                      <Text size="2" color="gray">
                        <strong>Example:</strong> If you buy 15 kg for ₱2,300 and
                        use pieces in recipes:
                        <br />• Purchase Unit: <strong>kg</strong>
                        <br />• Stock Unit: <strong>pcs</strong>
                        <br />• The system converts automatically
                      </Text>
                    </Flex>
                  </Box>
                </Grid>
              </FormSection>
            </>
          )}


          <Callout.Root color="blue" variant="soft">
            <Callout.Icon>
              <InfoOutlined style={{ fontSize: 18 }} />
            </Callout.Icon>
            <Callout.Text>
              <strong>
                {isMenuItem ? "Menu Item" : "Ingredient"}:
              </strong>{" "}
              {isMenuItem
                ? "This product will appear on the POS and can be added to recipes."
                : "Stock will be deducted automatically when linked menu items are sold."}
            </Callout.Text>
          </Callout.Root>
        </Flex>
      </Box>

      <FormActions
        isEdit={isEdit}
        isValid={isValid}
        isDirty={isDirty}
        submitLoading={submitLoading}
        isInDialog={isInDialog}
        submissionKey={submissionKey}
        onButtonClick={handleButtonClick}
        buttonText={isEdit ? "Update Product" : "Create Product"}
      />
    </Card>
  );
};
