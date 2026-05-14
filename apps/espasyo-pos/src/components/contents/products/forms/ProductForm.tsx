import React from "react";
import { Box, Callout, Card, Flex, Grid, Text } from "@radix-ui/themes";
import {
  DescriptionOutlined,
  InfoOutlined,
  InventoryOutlined,
  KitchenOutlined,
  LocalShippingOutlined,
  RestaurantMenuOutlined,
  ScaleOutlined,
  SwapHorizOutlined,
} from "@mui/icons-material";
import { ToggleField, ToggleOption } from "core-lib/components/radix/toggle/ToggleField";
import { TextField } from "core-lib/components/radix/form/TextField";
import { SelectField } from "core-lib/components/radix/form/SelectField";
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

const FIELD_LABELS: Record<string, string> = {
  name: "Product Name",
  description: "Description",
  unitPrice: "Selling Price",
  costPrice: "Cost Price",
  purchaseQuantity: "Purchase Quantity",
  purchaseUnitID: "Purchase Unit",
  stockUnitID: "Stock Unit",
  categoryID: "Category",
  isMenuItem: "Product Type",
};

const PRODUCT_TYPE_OPTIONS: ToggleOption<boolean>[] = [
  {
    value: true,
    label: "Menu Item",
    description: "Can be sold to customers",
    icon: <RestaurantMenuOutlined fontSize="small" />,
    selectedColor: "success",
  },
  {
    value: false,
    label: "Ingredient",
    description: "Raw material for recipes",
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
}) => {
  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
    watchedValues,
    isDirty,
    submissionKey,
    handleProductTypeChange,
  } = useProductForm({
    initialValues,
    resetForm,
    isEdit,
    isInDialog,
    onSubmit,
  });

  const isMenuItem = watchedValues.isMenuItem;

  const categoryOptions = React.useMemo(() => {
    if (isMenuItem) {
      return toSelectOptionsWithField(
        productCategories ?? [],
        "productCategoryID",
        "name",
      );
    }
    return toSelectOptionsWithField(
      ingredientCategories ?? [],
      "ingredientCategoryID",
      "name",
    );
  }, [isMenuItem, productCategories, ingredientCategories]);

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
              <SelectField
                name="categoryID"
                control={control}
                options={categoryOptions}
                label="Select a Category"
              />

              <ToggleField
                name="isMenuItem"
                control={control}
                options={PRODUCT_TYPE_OPTIONS}
                label="Product Type"
                required
                onChange={handleProductTypeChange}
              />
            </Flex>
          </FormSection>

          {isMenuItem ? (
            <FormSection
              icon={<RestaurantMenuOutlined style={{ color: "var(--green-11)" }} />}
              title="Menu Item Pricing"
            >
              <Grid columns={{ initial: "1", md: "2" }} gap="3">
                <Box>
                  <TextField
                    name="unitPrice"
                    control={control}
                    label="Selling Price"
                    type="number"
                    placeholder={PLACEHOLDERS.price}
                  />
                  <Text size="1" color="gray" as="div" mt="1">
                    Price customers pay
                  </Text>
                </Box>
              </Grid>
            </FormSection>
          ) : (
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
                      How many units you bought (e.g., 15)
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
                      Unit you use in recipes and inventory (e.g., pcs)
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
                        <br />• The system will automatically convert using unit
                        conversion
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
              <strong>Product Information:</strong>
              <br />•{" "}
              {isMenuItem ? "Menu items" : "Ingredients"} have been created
              successfully
              <br />•{" "}
              {isMenuItem
                ? "You can now create recipes using this menu item"
                : "You can now set up inventory levels for this ingredient"}
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
