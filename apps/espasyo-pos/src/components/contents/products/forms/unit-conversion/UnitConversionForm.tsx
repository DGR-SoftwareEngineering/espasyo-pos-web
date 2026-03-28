import React, { useMemo } from "react";
import { Grid, CardContent, Box, alpha, Typography } from "@mui/material";
import {
  Card,
  TextField,
  SelectField,
  FormHeader,
  FormSection,
  FormActions,
  ToggleField,
} from "core-lib";
import {
  SwapHorizOutlined,
  InfoOutlined,
  ScaleOutlined,
  TrendingUpOutlined,
  WarningAmberOutlined,
  NotesOutlined,
  HelpOutlineOutlined,
} from "@mui/icons-material";
import { useUnitConversionForm } from "../../hooks";
import { toSelectOptionsWithField } from "core-lib/business/array";
import { UnitConversionFormProps } from "../types";
import { APPROXIMATE_OPTIONS } from "../../constants";

export const UnitConversionForm: React.FC<UnitConversionFormProps> = ({
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
    formState: { isValid, errors },
    watchedValues,
    isDirty,
    submissionKey,
  } = useUnitConversionForm({
    initialValues,
    resetForm,
    isEdit,
    isInDialog,
    onSubmit,
  });

  const unitCategories = React.useMemo(() => {
    return categories?.filter((cat) => cat.type === 3) ?? [];
  }, [categories]);

  const unitOptions = React.useMemo(
    () => toSelectOptionsWithField(unitCategories ?? [], "categoryID", "name"),
    [unitCategories],
  );

  const handleFormSubmit = handleSubmit(onSubmit);
  const handleButtonClick = () => {
    if (isValid && (isDirty || isEdit)) {
      handleFormSubmit();
    }
  };

  const fromUnit = unitCategories?.find(
    (u) => u.categoryID === watchedValues.fromUnitID,
  );
  const toUnit = unitCategories?.find(
    (u) => u.categoryID === watchedValues.toUnitID,
  );
  const conversionRate = watchedValues.conversionRate;
  const isApproximate = watchedValues.isApproximate;

  const showPreview =
    fromUnit?.name && toUnit?.name && conversionRate && conversionRate > 0;

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
        title="Unit Conversion"
        editTitle="Edit Unit Conversion"
        subtitle="Define how different units relate to each other"
        editSubtitle="Update conversion rate between units"
        icon={SwapHorizOutlined}
      />

      {showPreview && (
        <Box
          sx={{
            mx: 4,
            mt: 2,
            mb: 0,
            p: 2,
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.success.main, 0.05),
            border: (theme) =>
              `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="body1" fontWeight={500}>
            1 {fromUnit.name}
          </Typography>
          <Typography variant="h6" color="success.main">
            =
          </Typography>
          <Typography variant="body1" fontWeight={700} color="success.main">
            {conversionRate}
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {toUnit.name}
          </Typography>
          {isApproximate && (
            <Typography
              variant="caption"
              sx={{
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                color: "warning.main",
                px: 1,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              Approximate
            </Typography>
          )}
        </Box>
      )}

      <CardContent sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {/* Unit Selection Section */}
          <Grid size={{ xs: 12 }}>
            <FormSection
              icon={<ScaleOutlined color="primary" />}
              title="1. Select Units to Convert"
              description={
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Choose the units you want to create a conversion for.
                  </Typography>
                  <Box
                    sx={{
                      mt: 1,
                      p: 1.5,
                      bgcolor: (theme) => alpha(theme.palette.info.main, 0.05),
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="info.main"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <HelpOutlineOutlined sx={{ fontSize: 14 }} />
                      <strong>Example:</strong> If you buy chicken wings by{" "}
                      <strong>kg</strong> but use <strong>pieces</strong> in
                      recipes, select:
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      • From Unit: <strong>kg</strong> (how you buy)
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      • To Unit: <strong>pcs</strong> (how you use)
                    </Typography>
                  </Box>
                </Box>
              }
            >
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <SelectField
                    name="fromUnitID"
                    control={control}
                    options={unitOptions}
                    label="From Unit"
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    The unit you purchase or have
                  </Typography>
                  {errors.fromUnitID && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      {errors.fromUnitID.message}
                    </Typography>
                  )}
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <SelectField
                    name="toUnitID"
                    control={control}
                    options={unitOptions}
                    label="To Unit"
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    The unit you use in recipes or inventory
                  </Typography>
                  {errors.toUnitID && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      {errors.toUnitID.message}
                    </Typography>
                  )}
                </Grid>
              </Grid>

              {watchedValues.fromUnitID === watchedValues.toUnitID &&
                watchedValues.fromUnitID && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: (theme) =>
                        alpha(theme.palette.warning.main, 0.1),
                      border: (theme) =>
                        `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <WarningAmberOutlined
                      sx={{ color: (theme) => theme.palette.warning.main }}
                    />
                    <Typography variant="caption" color="warning.main">
                      Cannot create conversion from a unit to itself. Please
                      select different units.
                    </Typography>
                  </Box>
                )}
            </FormSection>
          </Grid>

          {/* Conversion Rate Section */}
          <Grid size={{ xs: 12 }}>
            <FormSection
              icon={<TrendingUpOutlined color="success" />}
              title="2. Set the Conversion Rate"
              description={
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Define how many "To Units" equal one "From Unit".
                  </Typography>
                  <Box
                    sx={{
                      mt: 1,
                      p: 1.5,
                      bgcolor: (theme) => alpha(theme.palette.info.main, 0.05),
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="info.main"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <HelpOutlineOutlined sx={{ fontSize: 14 }} />
                      <strong>Example:</strong>
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      • If 1 kg = 8 pieces, enter <strong>8</strong>
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      • If 1 kg = 1000 grams, enter <strong>1000</strong>
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      • If 1 liter = 1000 ml, enter <strong>1000</strong>
                    </Typography>
                  </Box>
                </Box>
              }
            >
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    name="conversionRate"
                    control={control}
                    label="Conversion Rate"
                    type="number"
                    placeholder="8"
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    1 {fromUnit?.name || "unit"} = ? {toUnit?.name || "unit"}
                  </Typography>
                  {errors.conversionRate && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      {errors.conversionRate.message}
                    </Typography>
                  )}
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: (theme) => alpha(theme.palette.info.main, 0.05),
                      border: (theme) =>
                        `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={500} gutterBottom>
                        Quick Reference
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        • <strong>kg → g:</strong> 1000
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        • <strong>kg → pcs:</strong> varies (e.g., 8 for chicken
                        wings)
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        • <strong>liter → ml:</strong> 1000
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        • <strong>kg → lb:</strong> 2.20462
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </FormSection>
          </Grid>

          {/* Approximate Conversion Section */}
          <Grid size={{ xs: 12 }}>
            <FormSection
              icon={<WarningAmberOutlined color="warning" />}
              title="3. Specify Accuracy"
              description={
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Mark if this conversion is approximate or exact.
                  </Typography>
                  <Box
                    sx={{
                      mt: 1,
                      p: 1.5,
                      bgcolor: (theme) =>
                        alpha(theme.palette.warning.main, 0.05),
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="warning.main"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <HelpOutlineOutlined sx={{ fontSize: 14 }} />
                      <strong>When to mark as "Approximate":</strong>
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      • Weight to pieces (e.g., 1 kg = 8 pieces, but pieces may
                      vary in size)
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      • When the conversion depends on item size or type
                    </Typography>
                    <Typography
                      variant="caption"
                      color="success.main"
                      sx={{ display: "block", mt: 1 }}
                    >
                      <strong>Mark as "Exact" for:</strong> kg → g, liter → ml,
                      etc.
                    </Typography>
                  </Box>
                </Box>
              }
            >
              <ToggleField
                control={control}
                name="isApproximate"
                options={APPROXIMATE_OPTIONS}
                orientation="horizontal"
                spacing={2}
                showErrorBelow={false}
              />
            </FormSection>
          </Grid>

          {/* Notes Section */}
          <Grid size={{ xs: 12 }}>
            <FormSection
              icon={<NotesOutlined color="secondary" />}
              title="4. Additional Notes (Optional)"
              description="Add any notes or comments about this conversion for future reference"
            >
              <TextField
                name="notes"
                control={control}
                label="Notes"
                placeholder="e.g., 1 kg of chicken wings = approximately 8 pieces (varies by size)"
                multiline
                rows={3}
              />
              {errors.notes && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  {errors.notes.message}
                </Typography>
              )}
            </FormSection>
          </Grid>

          {/* Info Box */}
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
                  <strong>How Unit Conversions Work</strong>
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  • When you create a product, you'll specify:
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ pl: 2 }}
                >
                  - <strong>Purchase Unit:</strong> How you buy (e.g., kg)
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ pl: 2 }}
                >
                  - <strong>Stock Unit:</strong> How you track (e.g., pcs)
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mt: 1 }}
                >
                  • The system will automatically use this conversion to
                  calculate costs
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  • Example: 15 kg @ ₱2,300 = ₱153.33/kg → ÷ 8 = ₱19.17/piece →
                  × 4 pieces = ₱76.67
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
        onButtonClick={handleButtonClick}
        isInDialog={isInDialog}
        buttonText={isEdit ? "Update Conversion" : "Create Conversion"}
        submissionKey={submissionKey}
      />
    </Card>
  );
};
