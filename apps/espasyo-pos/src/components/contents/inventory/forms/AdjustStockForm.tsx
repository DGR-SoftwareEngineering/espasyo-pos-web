import React from "react";
import {
  Box,
  Stack,
  Typography,
  Grid,
  Chip,
  alpha,
  InputAdornment,
  useTheme,
} from "@mui/material";
import {
  SwapVertOutlined,
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  InfoOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import {
  Card,
  TextField,
  ToggleField,
  ToggleOption,
  FormHeader,
  FormSection,
  FormActions,
  FormErrorSummary,
} from "core-lib";
import { formatNumber } from "core-lib/business/number";
import { useAdjustStockForm } from "../hooks";
import {
  ADJUSTMENT_REASON_PRESETS,
  ADJUST_DIRECTION_OPTIONS,
  PLACEHOLDERS,
} from "../constants";
import { AdjustStockFormProps } from "./types";

const DIRECTION_OPTIONS: ToggleOption<"in" | "out">[] =
  ADJUST_DIRECTION_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
    description: opt.description,
    selectedColor: opt.selectedColor,
    icon:
      opt.value === "in" ? (
        <ArrowUpwardRounded fontSize="small" />
      ) : (
        <ArrowDownwardRounded fontSize="small" />
      ),
  }));

const FIELD_LABELS: Record<string, string> = {
  direction: "Direction",
  amount: "Amount",
  reason: "Reason",
};

export const AdjustStockForm: React.FC<AdjustStockFormProps> = ({
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
    watchedValues,
    isDirty,
    submissionKey,
    signedDelta,
    setValue,
  } = useAdjustStockForm({
    resetForm,
    isInDialog,
    onSubmit,
  });


  const projectedBalance = inventory.currentQuantity + signedDelta;
  const wouldGoNegative = projectedBalance < 0;
  const unitLabel = inventory.stockUnitName ?? "units";

  const handleFormSubmit = handleSubmit(onSubmit);
  const handleButtonClick = () => {
    if (wouldGoNegative) return;
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
        title="Adjust Stock"
        editTitle="Adjust Stock"
        subtitle={inventory.productName ?? "Inventory adjustment"}
        editSubtitle={inventory.productName ?? "Inventory adjustment"}
        icon={SwapVertOutlined}
      />

      <Box
        sx={{
          px: 4,
          py: 2.5,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
          gap: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">
            Current Stock
          </Typography>
          <Typography variant="h6" fontWeight={700}>
            {formatNumber(inventory.currentQuantity)} {unitLabel}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Reorder / Min
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {formatNumber(inventory.reorderLevel)} /{" "}
            {formatNumber(inventory.minimumStockLevel)} {unitLabel}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            After Adjustment
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              variant="h6"
              fontWeight={700}
              color={
                wouldGoNegative
                  ? "error.main"
                  : signedDelta > 0
                    ? "success.main"
                    : "text.primary"
              }
            >
              {formatNumber(projectedBalance)} {unitLabel}
            </Typography>
            {watchedValues.amount > 0 && !wouldGoNegative && (
              <Chip
                size="small"
                label={`${signedDelta > 0 ? "+" : ""}${formatNumber(signedDelta)}`}
                color={signedDelta > 0 ? "success" : "error"}
                sx={{ height: 20, fontWeight: 600 }}
              />
            )}
          </Stack>
        </Box>
      </Box>

      <Box sx={{ p: 4 }}>
        <Stack spacing={3}>
          <FormErrorSummary errors={errors} fieldLabels={FIELD_LABELS} />

          <FormSection
            icon={<SwapVertOutlined color="primary" />}
            title="Direction & Amount"
          >
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ToggleField
                  name="direction"
                  control={control}
                  options={DIRECTION_OPTIONS}
                  label="Direction"
                  required
                  orientation="horizontal"
                  spacing={2}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name="amount"
                  control={control}
                  label="Amount"
                  type="number"
                  placeholder={PLACEHOLDERS.adjustAmount}
                  endAdornment={
                    <InputAdornment position="end">{unitLabel}</InputAdornment>
                  }
                />
              </Grid>
            </Grid>
          </FormSection>

          {wouldGoNegative && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.error.main, 0.06),
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                display: "flex",
                gap: 1.5,
                alignItems: "flex-start",
              }}
            >
              <WarningAmberOutlined color="error" />
              <Box>
                <Typography variant="body2" fontWeight={600} color="error.main">
                  This adjustment would result in negative stock.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Reduce the amount or change the direction.
                </Typography>
              </Box>
            </Box>
          )}

          <FormSection
            icon={<InfoOutlined color="info" />}
            title="Reason"
            description="Required — this is written to the immutable stock-movement log."
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {ADJUSTMENT_REASON_PRESETS.map((preset) => (
                  <Chip
                    key={preset}
                    label={preset}
                    variant={
                      watchedValues.reason === preset ? "filled" : "outlined"
                    }
                    color={
                      watchedValues.reason === preset ? "primary" : "default"
                    }
                    onClick={() =>
                      setValue("reason", preset, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    sx={{ borderRadius: 2 }}
                  />
                ))}
              </Stack>
              <TextField
                name="reason"
                control={control}
                label={null}
                placeholder={PLACEHOLDERS.adjustReason}
                multiline
                rows={2}
              />
            </Stack>
          </FormSection>
        </Stack>
      </Box>

      <FormActions
        isEdit
        isValid={isValid && !wouldGoNegative}
        isDirty={isDirty}
        submitLoading={submitLoading}
        isInDialog={isInDialog}
        submissionKey={submissionKey}
        onButtonClick={handleButtonClick}
        buttonText="Submit Adjustment"
      />
    </Card>
  );
};
