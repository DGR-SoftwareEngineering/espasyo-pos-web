import React from "react";
import {
  Grid,
  CardContent,
  Box,
  alpha,
  Typography,
  Stack,
  Chip,
} from "@mui/material";
import {
  Inventory2Outlined,
  KitchenOutlined,
  TuneOutlined,
  InfoOutlined,
  CheckCircleOutlined,
  WarningAmberOutlined,
  ErrorOutlineOutlined,
} from "@mui/icons-material";
import {
  Card,
  TextField,
  AutoCompleteField,
  FormHeader,
  FormSection,
  FormActions,
  FormErrorSummary,
} from "core-lib";
import { ProductDataList } from "core-lib/api/commons/types";
import { getStockStatus } from "core-lib/business/number";
import { useInventoryForm } from "../hooks";
import { PLACEHOLDERS } from "../constants";
import { InventoryFormProps } from "./types";

const FIELD_LABELS: Record<string, string> = {
  productID: "Ingredient",
  currentQuantity: "Current Quantity",
  reorderLevel: "Reorder Level",
  minimumStockLevel: "Minimum Stock Level",
};

export const InventoryForm: React.FC<InventoryFormProps> = ({
  onSubmit,
  submitLoading,
  resetForm,
  initialValues,
  isEdit = false,
  isInDialog = false,
  ingredients,
  ingredientsLoading,
}) => {
  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
    watchedValues,
    isDirty,
    submissionKey,
  } = useInventoryForm({
    initialValues,
    resetForm,
    isEdit,
    isInDialog,
    onSubmit,
  });

  const selectedIngredient = React.useMemo(
    () => ingredients.find((p) => p.productID === watchedValues.productID),
    [ingredients, watchedValues.productID],
  );

  const projectedStatus = React.useMemo(() => {
    const { isNormal, isLow, isCritical } = getStockStatus(
      watchedValues.currentQuantity,
      watchedValues.reorderLevel,
      watchedValues.minimumStockLevel,
    );
    if (watchedValues.currentQuantity <= 0)
      return {
        label: "Out of Stock",
        color: "error" as const,
        icon: <ErrorOutlineOutlined fontSize="small" />,
      };
    if (isCritical)
      return {
        label: "Critical",
        color: "error" as const,
        icon: <ErrorOutlineOutlined fontSize="small" />,
      };
    if (isLow)
      return {
        label: "Low Stock",
        color: "warning" as const,
        icon: <WarningAmberOutlined fontSize="small" />,
      };
    if (isNormal)
      return {
        label: "In Stock",
        color: "success" as const,
        icon: <CheckCircleOutlined fontSize="small" />,
      };
    return null;
  }, [
    watchedValues.currentQuantity,
    watchedValues.reorderLevel,
    watchedValues.minimumStockLevel,
  ]);

  const handleFormSubmit = handleSubmit(onSubmit);
  const handleButtonClick = () => {
    handleFormSubmit();
  };

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
        title="Inventory"
        editTitle="Edit Inventory"
        subtitle="Initialize tracking for an ingredient. Use Adjust Stock afterwards to move quantities."
        editSubtitle="Update inventory thresholds"
        icon={Inventory2Outlined}
      />

      {selectedIngredient && (
        <Box
          sx={{
            px: 4,
            py: 2.5,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
            borderBottom: (theme) =>
              `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.5}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: (theme) => theme.palette.primary.main,
                }}
              >
                <KitchenOutlined />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {selectedIngredient.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedIngredient.categoryName ?? "Uncategorized"} ·
                  Ingredient
                </Typography>
              </Box>
            </Stack>
            {projectedStatus && (
              <Chip
                icon={projectedStatus.icon}
                label={`Projected: ${projectedStatus.label}`}
                color={projectedStatus.color}
                size="small"
                sx={{ fontWeight: 600, borderRadius: 2 }}
              />
            )}
          </Stack>
        </Box>
      )}

      <CardContent sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <FormErrorSummary errors={errors} fieldLabels={FIELD_LABELS} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormSection
              icon={<KitchenOutlined color="primary" />}
              title="Ingredient"
              description="Only ingredients (non-menu items) with a stock unit can have inventory."
            >
              <AutoCompleteField<typeof watchedValues, ProductDataList>
                name="productID"
                control={control}
                options={ingredients}
                loading={ingredientsLoading}
                getOptionLabel={(opt) => opt.name}
                getOptionValue={(opt) => opt.productID}
                placeholder={PLACEHOLDERS.productSearch}
                label="Select Ingredient"
                disableClearable={false}
                noOptionText="No matching ingredients"
                textFieldProps={{ size: "small" }}
              />
            </FormSection>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormSection
              icon={<TuneOutlined color="info" />}
              title="Stock Levels"
              description="Set the initial quantity and the thresholds that drive low-stock and critical statuses."
            >
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    name="currentQuantity"
                    control={control}
                    label="Current Quantity"
                    type="number"
                    placeholder={PLACEHOLDERS.currentQuantity}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    Opening balance — use 0 if stock will be received later.
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    name="reorderLevel"
                    control={control}
                    label="Reorder Level"
                    type="number"
                    placeholder={PLACEHOLDERS.reorderLevel}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    Triggers "Low Stock" when quantity drops to this level.
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    name="minimumStockLevel"
                    control={control}
                    label="Minimum Stock Level"
                    type="number"
                    placeholder={PLACEHOLDERS.minimumStockLevel}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    Triggers "Critical" when quantity drops to this level.
                  </Typography>
                </Grid>
              </Grid>
            </FormSection>
          </Grid>

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
                  <strong>How status is computed:</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • <strong>In Stock</strong> when quantity is above the reorder level
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • <strong>Low Stock</strong> when quantity is at or below the reorder level
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • <strong>Critical</strong> when quantity is at or below the minimum level
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • <strong>Out of Stock</strong> when quantity reaches zero
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
        buttonText={isEdit ? "Update Inventory" : "Create Inventory"}
      />
    </Card>
  );
};
