import React from "react";
import {
  Badge,
  Box,
  Callout,
  Card,
  Flex,
  Grid,
  Heading,
  Text,
} from "@radix-ui/themes";
import {
  SwapVertOutlined,
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  InfoOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import { TextField } from "core-lib/components/radix/form/TextField";
import {
  ToggleField,
  ToggleOption,
} from "core-lib/components/radix/toggle/ToggleField";
import { FormHeader } from "core-lib/components/radix/FormHeader";
import { FormSection } from "core-lib/components/radix/FormSection";
import { FormActions } from "core-lib/components/radix/FormActions";
import { FormErrorSummary } from "core-lib/components/radix/FormErrorSummary";
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

  const projectedColor = wouldGoNegative
    ? "var(--red-11)"
    : signedDelta > 0
      ? "var(--green-11)"
      : "var(--gray-12)";

  const Shell: React.ElementType = isInDialog ? Box : Card;
  const shellProps = isInDialog
    ? { style: { width: "100%" } }
    : { variant: "surface" as const, size: "3" as const, style: { width: "100%" } };

  return (
    <Shell {...shellProps}>
      <FormHeader
        isEdit
        title="Adjust Stock"
        editTitle="Adjust Stock"
        subtitle={inventory.productName ?? "Inventory adjustment"}
        editSubtitle={inventory.productName ?? "Inventory adjustment"}
        icon={SwapVertOutlined}
      />

      <Box
        px="4"
        py="3"
        style={{
          background: "var(--accent-a2)",
          borderBottom: "1px solid var(--accent-a4)",
        }}
      >
        <Grid columns={{ initial: "1", sm: "3" }} gap="3">
          <Box>
            <Text size="1" color="gray" as="div">
              Current Stock
            </Text>
            <Heading size="4" weight="bold">
              {formatNumber(inventory.currentQuantity)} {unitLabel}
            </Heading>
          </Box>
          <Box>
            <Text size="1" color="gray" as="div">
              Reorder / Min
            </Text>
            <Text size="3" weight="medium" as="div">
              {formatNumber(inventory.reorderLevel)} /{" "}
              {formatNumber(inventory.minimumStockLevel)} {unitLabel}
            </Text>
          </Box>
          <Box>
            <Text size="1" color="gray" as="div">
              After Adjustment
            </Text>
            <Flex align="center" gap="2">
              <Heading size="4" weight="bold" style={{ color: projectedColor }}>
                {formatNumber(projectedBalance)} {unitLabel}
              </Heading>
              {watchedValues.amount > 0 && !wouldGoNegative && (
                <Badge
                  color={signedDelta > 0 ? "green" : "red"}
                  variant="soft"
                  radius="full"
                >
                  {signedDelta > 0 ? "+" : ""}
                  {formatNumber(signedDelta)}
                </Badge>
              )}
            </Flex>
          </Box>
        </Grid>
      </Box>

      <Box p="4">
        <Flex direction="column" gap="4">
          <FormErrorSummary errors={errors} fieldLabels={FIELD_LABELS} />

          <FormSection
            icon={<SwapVertOutlined style={{ color: "var(--accent-11)" }} />}
            title="Direction & Amount"
          >
            <Grid columns={{ initial: "1", md: "2" }} gap="3">
              <Box>
                <ToggleField
                  name="direction"
                  control={control}
                  options={DIRECTION_OPTIONS}
                  label="Direction"
                  required
                />
              </Box>
              <Box>
                <TextField
                  name="amount"
                  control={control}
                  label="Amount"
                  type="number"
                  placeholder={PLACEHOLDERS.adjustAmount}
                  endAdornment={
                    <Text size="2" color="gray">
                      {unitLabel}
                    </Text>
                  }
                />
              </Box>
            </Grid>
          </FormSection>

          {wouldGoNegative && (
            <Callout.Root color="red" variant="soft">
              <Callout.Icon>
                <WarningAmberOutlined style={{ fontSize: 18 }} />
              </Callout.Icon>
              <Callout.Text>
                <strong>This adjustment would result in negative stock.</strong>
                <br />
                Reduce the amount or change the direction.
              </Callout.Text>
            </Callout.Root>
          )}

          <FormSection
            icon={<InfoOutlined style={{ color: "var(--blue-11)" }} />}
            title="Reason"
            description="Required — this is written to the immutable stock-movement log."
          >
            <Flex direction="column" gap="3">
              <Flex gap="2" wrap="wrap">
                {ADJUSTMENT_REASON_PRESETS.map((preset) => {
                  const isSelected = watchedValues.reason === preset;
                  return (
                    <Badge
                      key={preset}
                      color={isSelected ? "indigo" : "gray"}
                      variant={isSelected ? "solid" : "soft"}
                      radius="full"
                      size="2"
                      onClick={() =>
                        setValue("reason", preset, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      style={{ cursor: "pointer", userSelect: "none" }}
                    >
                      {preset}
                    </Badge>
                  );
                })}
              </Flex>
              <TextField
                name="reason"
                control={control}
                label={null}
                placeholder={PLACEHOLDERS.adjustReason}
                multiline
                rows={2}
              />
            </Flex>
          </FormSection>
        </Flex>
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
    </Shell>
  );
};
