import React from "react";
import { Flex, Box } from "@radix-ui/themes";
import { Button } from "./buttons/Button";

interface FormActionsProps {
  isEdit: boolean;
  isValid: boolean;
  isDirty: boolean;
  submitLoading: boolean;
  isInDialog: boolean;
  submissionKey?: string;
  onButtonClick: () => void;
  buttonText: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  isEdit,
  isDirty,
  submitLoading,
  onButtonClick,
  buttonText,
  submissionKey,
  isInDialog,
}) => (
  <Box
    px="5"
    py="4"
    style={{
      borderTop: "1px solid var(--gray-a4)",
    }}
  >
    <Flex justify="end" gap="3">
      <Button
        type="Primary"
        size="3"
        loading={submitLoading}
        disabled={!isDirty && !isEdit}
        onClick={onButtonClick}
        customActionKey={isInDialog ? undefined : submissionKey}
        style={{ minWidth: 180 }}
      >
        {buttonText}
      </Button>
    </Flex>
  </Box>
);
