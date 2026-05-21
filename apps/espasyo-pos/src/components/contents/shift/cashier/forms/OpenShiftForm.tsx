import React from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { AttachMoneyOutlined, NotesOutlined } from "@mui/icons-material";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { TextField } from "core-lib/components/radix/form/TextField";
import { FormSection } from "core-lib/components/radix/FormSection";
import { FormErrorSummary } from "core-lib/components/radix/FormErrorSummary";
import { Button } from "core-lib/components/radix/buttons/Button";
import { useOpenShiftForm } from "../hooks";
import { PLACEHOLDERS } from "../constants";
import { OpenShiftFormProps } from "./types";

const FIELD_LABELS: Record<string, string> = {
  openingCash: "Opening Cash",
  notes: "Notes",
};

export const OpenShiftForm: React.FC<OpenShiftFormProps> = ({
  onSubmit,
  submitLoading,
  resetForm,
}) => {
  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty, errors },
  } = useOpenShiftForm({ onSubmit, resetForm });

  const handleFormSubmit = handleSubmit(onSubmit);

  return (
    <Flex direction="column" gap="4">
      <FormErrorSummary errors={errors} fieldLabels={FIELD_LABELS} />

      <FormSection
        icon={<AttachMoneyOutlined style={{ color: "var(--green-11)" }} />}
        title="Opening Cash"
        description="Count and enter the physical cash currently in the drawer."
      >
        <TextField
          name="openingCash"
          control={control}
          label="Opening Cash Amount"
          placeholder={PLACEHOLDERS.openingCash}
          type="number"
          size="3"
        />
      </FormSection>

      <FormSection
        icon={<NotesOutlined style={{ color: "var(--gray-11)" }} />}
        title="Notes"
        description="Optional notes for this shift (e.g., shift type, special instructions)."
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

      <Box mt="2">
        <Button
          type="Primary"
          size="3"
          fullWidth
          loading={submitLoading}
          disabled={!isDirty || submitLoading}
          onClick={() => handleFormSubmit()}
        >
          <Flex align="center" justify="center" gap="2">
            <Text size="3" weight="bold">Open Shift</Text>
            {!submitLoading && <ArrowRightIcon />}
          </Flex>
        </Button>
      </Box>
    </Flex>
  );
};
