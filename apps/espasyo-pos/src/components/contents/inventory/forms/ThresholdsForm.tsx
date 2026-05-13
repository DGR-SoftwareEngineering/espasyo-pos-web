import React from "react";
import {
  Box,
  Grid,
  Typography,
  alpha,
  Stack,
  useTheme,
  InputAdornment,
} from "@mui/material";
import { TuneOutlined, InfoOutlined } from "@mui/icons-material";
import {
  Card,
  TextField,
  FormHeader,
  FormSection,
  FormActions,
  FormErrorSummary,
} from "core-lib";
import { formatNumber } from "core-lib/business/number";
import { useThresholdsForm } from "../hooks";
import { PLACEHOLDERS } from "../constants";
import { ThresholdsFormProps } from "./types";

const FIELD_LABELS: Record<string, string> = {
  reorderLevel: "Reorder Level",
  minimumStockLevel: "Minimum Stock Level",
};

export const ThresholdsForm: React.FC<ThresholdsFormProps> = ({
  inventory,
  onSubmit,
  submitLoading,
  resetForm,
  isInDialog,
}) => {
  const theme = useTheme();
  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
    isDirty,
    submissionKey,
  } = useThresholdsForm({
    initialValues: {
      reorderLevel: inventory.reorderLevel,
      minimumStockLevel: inventory.minimumStockLevel,
    },
    resetForm,
    isInDialog,
    onSubmit,
  });

  const unitLabel = inventory.stockUnitName ?? "units";

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
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <FormHeader
        isEdit
        title="Edit Thresholds"
        editTitle="Edit Thresholds"
        subtitle={inventory.productName ?? "Inventory thresholds"}
        editSubtitle={inventory.productName ?? "Inventory thresholds"}
        icon={TuneOutlined}
      />

      <Box
        sx={{
          px: 4,
          py: 2,
          bgcolor: alpha(theme.palette.info.main, 0.04),
          borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <InfoOutlined fontSize="small" sx={{ color: theme.palette.info.main }} />
          <Typography variant="body2" color="text.secondary">
            Current stock is{" "}
            <strong>
              {formatNumber(inventory.currentQuantity)} {unitLabel}
            </strong>{" "}
            — use <em>Adjust Stock</em> if you need to change it.
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ p: 4 }}>
        <FormErrorSummary
          errors={errors}
          fieldLabels={FIELD_LABELS}
          sx={{ mb: 3 }}
        />

        <FormSection
          icon={<TuneOutlined color="info" />}
          title="Threshold Levels"
          description="Reorder level must be at or above the minimum stock level."
        >
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                name="reorderLevel"
                control={control}
                label="Reorder Level"
                type="number"
                placeholder={PLACEHOLDERS.reorderLevel}
                endAdornment={
                  <InputAdornment position="end">{unitLabel}</InputAdornment>
                }
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                Triggers Low Stock when quantity drops to this level.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                name="minimumStockLevel"
                control={control}
                label="Minimum Stock Level"
                type="number"
                placeholder={PLACEHOLDERS.minimumStockLevel}
                endAdornment={
                  <InputAdornment position="end">{unitLabel}</InputAdornment>
                }
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                Triggers Critical when quantity drops to this level.
              </Typography>
            </Grid>
          </Grid>
        </FormSection>
      </Box>

      <FormActions
        isEdit
        isValid={isValid}
        isDirty={isDirty}
        submitLoading={submitLoading}
        isInDialog={isInDialog}
        submissionKey={submissionKey}
        onButtonClick={handleButtonClick}
        buttonText="Update Thresholds"
      />
    </Card>
  );
};
