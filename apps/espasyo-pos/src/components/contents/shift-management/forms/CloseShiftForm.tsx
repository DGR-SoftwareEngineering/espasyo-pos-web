import React from "react";
import { Badge, Box, Card, Flex, Separator, Text } from "@radix-ui/themes";
import { AttachMoneyOutlined, LockOutlined, NotesOutlined, SummarizeOutlined } from "@mui/icons-material";
import { Controller } from "react-hook-form";
import { TextField } from "core-lib/components/radix/form/TextField";
import { FormSection } from "core-lib/components/radix/FormSection";
import { FormActions } from "core-lib/components/radix/FormActions";
import { FormErrorSummary } from "core-lib/components/radix/FormErrorSummary";
import { MpinInput } from "core-lib/components/radix/security/MpinInput";
import { formatCurrency } from "core-lib/business/strings";
import { useCloseShiftForm } from "../hooks";
import { PLACEHOLDERS, SUBMISSION_KEYS } from "../constants";
import { CloseShiftFormProps } from "./types";

const FIELD_LABELS: Record<string, string> = {
  cashierShiftID: "Shift ID",
  actualCash: "Actual Cash",
  mpin: "MPIN",
  notes: "Notes",
};

const SummaryRow: React.FC<{ label: string; value: string; highlight?: "green" | "red" | "gray" }> = ({
  label,
  value,
  highlight,
}) => (
  <Flex justify="between" align="center" py="1">
    <Text size="2" color="gray">{label}</Text>
    <Text
      size="2"
      weight={highlight ? "bold" : "medium"}
      style={{
        color: highlight === "green"
          ? "var(--green-11)"
          : highlight === "red"
          ? "var(--red-11)"
          : undefined,
      }}
    >
      {value}
    </Text>
  </Flex>
);

export const CloseShiftForm: React.FC<CloseShiftFormProps> = ({
  onSubmit,
  submitLoading,
  initialValues,
  isInDialog,
  shiftSummary,
}) => {
  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
    isDirty,
    watch,
  } = useCloseShiftForm({ onSubmit, initialValues });

  const actualCashRaw = watch("actualCash");
  const actualCash = Number(actualCashRaw) || 0;
  const expectedCash = shiftSummary?.expectedCash ?? 0;
  const diff = actualCash - expectedCash;
  const diffHighlight: "green" | "red" | "gray" =
    diff > 0 ? "green" : diff < 0 ? "red" : "gray";
  const diffLabel = diff > 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff);

  const handleFormSubmit = handleSubmit(onSubmit);

  return (
    <Box>
      <FormErrorSummary errors={errors} fieldLabels={FIELD_LABELS} />

      {shiftSummary && (
        <Card variant="surface" size="2" mb="4" style={{ background: "var(--gray-a2)" }}>
          <Flex align="center" gap="2" mb="3">
            <SummarizeOutlined style={{ fontSize: 18, color: "var(--indigo-11)" }} />
            <Text size="2" weight="bold" style={{ color: "var(--indigo-11)" }}>
              Shift Summary
            </Text>
            <Badge color="indigo" variant="soft" size="1" ml="auto">
              Shift {shiftSummary.shiftNumber}
            </Badge>
          </Flex>

          <SummaryRow label="Cashier" value={shiftSummary.cashierName} />
          <SummaryRow label="Opening Cash" value={formatCurrency(shiftSummary.openingCash)} />
          <Separator size="4" my="2" />
          <SummaryRow label="Cash Sales" value={formatCurrency(shiftSummary.cashSales)} />
          <SummaryRow label="Non-Cash Sales" value={formatCurrency(shiftSummary.nonCashSales)} />
          <SummaryRow label="Total Refunds" value={formatCurrency(shiftSummary.totalRefunds)} />
          <Separator size="4" my="2" />
          <SummaryRow label="Expected Cash" value={formatCurrency(expectedCash)} />
          {actualCash > 0 && (
            <SummaryRow
              label="Over / Short"
              value={diffLabel}
              highlight={diffHighlight}
            />
          )}
        </Card>
      )}

      <FormSection
        icon={<LockOutlined style={{ color: "var(--accent-11)" }} />}
        title="Verify Identity"
        description="Enter your 6-digit MPIN to confirm this shift closure."
      >
        <Controller
          name="mpin"
          control={control}
          render={({ field, fieldState }) => (
            <MpinInput
              value={field.value}
              onChange={field.onChange}
              label="MPIN"
              description="Your 6-digit security PIN"
              errorMessage={fieldState.error?.message ?? null}
            />
          )}
        />
      </FormSection>

      <FormSection
        icon={<AttachMoneyOutlined style={{ color: "var(--green-11)" }} />}
        title="Actual Cash"
        description="Count the physical cash in the drawer and enter the total."
      >
        <TextField
          name="actualCash"
          control={control}
          label="Actual Cash Amount"
          placeholder={PLACEHOLDERS.actualCash}
          type="number"
        />
      </FormSection>

      <FormSection
        icon={<NotesOutlined style={{ color: "var(--gray-11)" }} />}
        title="Notes"
        description="Optional closing notes for this shift."
      >
        <TextField
          name="notes"
          control={control}
          label="Notes"
          placeholder={PLACEHOLDERS.notes}
          multiline
          rows={3}
        />
      </FormSection>

      <FormActions
        isEdit={false}
        isValid={isValid}
        isDirty={isDirty}
        submitLoading={submitLoading}
        isInDialog={isInDialog}
        submissionKey={SUBMISSION_KEYS.close}
        onButtonClick={() => handleFormSubmit()}
        buttonText="Close Shift"
      />
    </Box>
  );
};
