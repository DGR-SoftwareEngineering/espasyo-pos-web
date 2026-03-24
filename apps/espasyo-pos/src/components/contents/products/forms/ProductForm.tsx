import React from "react";
import {
  Grid,
  CardContent,
  InputAdornment,
  Box,
  alpha,
  Typography,
} from "@mui/material";
import {
  Card,
  TextField,
  SelectField,
  FormHeader,
  FormSection,
  FormActions,
  PreviewBanner,
  ToggleField,
  ToggleOption,
} from "core-lib";
import {
  DescriptionOutlined,
  InfoOutlined,
  InventoryOutlined,
  KitchenOutlined,
  RestaurantMenuOutlined,
} from "@mui/icons-material";
import { useProductForm } from "./hooks";
import { toSelectOptionsWithField } from "core-lib/business/array";
import { formatPrice } from "core-lib/business/strings";
import { PLACEHOLDERS } from "../constants";
import { ProductFormProps } from "./types";

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
  categories,
}) => {
  const {
    control,
    handleSubmit,
    formState: { isValid },
    watchedValues,
    isDirty,
    submissionKey,
  } = useProductForm({
    initialValues,
    resetForm,
    isEdit,
    isInDialog,
    onSubmit,
  });

  const categoryOptions = React.useMemo(
    () => toSelectOptionsWithField(categories ?? [], "categoryID", "name"),
    [categories],
  );
  const selectedCategory = categories?.find(
    (c) => c.categoryID === watchedValues.categoryId,
  );

  const handleFormSubmit = handleSubmit(onSubmit);
  const handleButtonClick = () => {
    if (isValid && (isDirty || isEdit)) {
      handleFormSubmit();
    }
  };

  const isMenuItem = watchedValues.isMenuItem;

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
    <Card
      hoverEffect={false}
      sx={{
        width: "100%",
        borderRadius: 3,
        overflow: "hidden",
        border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: (theme) =>
          `0 8px 24px ${alpha(theme.palette.common.black, 0.05)}`,
      }}
    >
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
          showCategory={true}
          onClick={undefined} // Optional: add click handler if needed
        />
      )}

      <CardContent sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid size={{ xs: 12 }}>
            <FormSection
              icon={<DescriptionOutlined color="primary" />}
              title="Basic Information"
            >
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

              <Grid size={{ xs: 12, md: 6 }}>
                <ToggleField
                  name="isMenuItem"
                  control={control}
                  options={PRODUCT_TYPE_OPTIONS}
                  label="Product Type"
                  required
                  orientation="horizontal"
                  spacing={2}
                />
              </Grid>
            </FormSection>
          </Grid>

          {isMenuItem ? (
            <Grid size={{ xs: 12 }}>
              <FormSection
                icon={<RestaurantMenuOutlined color="success" />}
                title="Menu Item Pricing"
              >
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      name="unitPrice"
                      control={control}
                      label="Selling Price"
                      type="number"
                      placeholder={PLACEHOLDERS.price}
                      startAdornment={
                        <InputAdornment position="start">₱</InputAdornment>
                      }
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      Price customers pay
                    </Typography>
                  </Grid>
                </Grid>
              </FormSection>
            </Grid>
          ) : (
            <Grid size={{ xs: 12 }}>
              <FormSection
                icon={<KitchenOutlined color="success" />}
                title="Ingredient Cost"
              >
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      name="costPrice"
                      control={control}
                      label="Cost Price"
                      type="number"
                      placeholder={PLACEHOLDERS.price}
                      startAdornment={
                        <InputAdornment position="start">₱</InputAdornment>
                      }
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      How much you pay for this ingredient
                    </Typography>
                  </Grid>
                </Grid>
              </FormSection>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.03),
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
              }}
            >
              <InfoOutlined
                sx={{ color: (theme) => theme.palette.info.main, fontSize: 20 }}
              />
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Product Information:</strong>
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  • {isMenuItem ? "Menu items" : "Ingredients"} have been
                  created successfully
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  •{" "}
                  {isMenuItem
                    ? "You can now create recipes using this menu item"
                    : "You can now set up inventory levels for this ingredient"}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>

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
