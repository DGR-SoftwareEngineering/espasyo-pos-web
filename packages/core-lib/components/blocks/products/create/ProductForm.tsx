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
} from "core-lib";
import {
  DescriptionOutlined,
  InfoOutlined,
  InventoryOutlined,
  KitchenOutlined,
  RestaurantMenuOutlined,
} from "@mui/icons-material";

import { useProductForm } from "./hooks";
import { toSelectOptions, formatPrice } from "./utils";
import { PLACEHOLDERS, SUBMISSION_KEYS } from "./constants";
import { PreviewBanner } from "./components";
import { ProductFormProps } from "./types";
import { ProductTypeToggle } from "./components/ProductTypeToggle";

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
    () => toSelectOptions(categories ?? []),
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
          name={watchedValues.name}
          category={selectedCategory}
          price={watchedValues.unitPrice || watchedValues.costPrice}
          formatPrice={formatPrice}
          isMenuItem={isMenuItem}
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
                <ProductTypeToggle control={control} />
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
                  {/* REMOVED: costPrice field - not in backend */}
                </Grid>
              </FormSection>
            </Grid>
          ) : (
            /* INGREDIENT PRICING - Only Cost Price */
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
                  {/* REMOVED: unitPrice for ingredients - they don't have selling price */}
                </Grid>
              </FormSection>
            </Grid>
          )}

          {/* REMOVED: Inventory Thresholds section - now in separate Inventory management */}

          {/* Info Note about Inventory */}
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
