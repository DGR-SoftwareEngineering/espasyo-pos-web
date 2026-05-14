import React from "react";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { DialogBox } from "../dialog/DialogBox";
import { PrimaryButton } from "../buttons/PrimaryButton";
import { SecondaryButton } from "../buttons/SecondaryButton";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onSave: () => void;
  onClose: () => void;
  isLoading: boolean;
}

export const SaveConfirmationModal: React.FC<Props> = ({
  isOpen,
  onCancel,
  onSave,
  onClose,
  isLoading,
}) => (
  <DialogBox
    open={isOpen}
    onClose={onClose}
    maxWidth="sm"
    aria-label="save-confirmation-modal"
  >
    <Box p="4">
      <Heading align="center" size="6" mb="4">
        Save Confirmation
      </Heading>
      <Text align="center" size="3" as="p" mb="5">
        Do you wish to save it now?
      </Text>
      <Flex direction="column" gap="3">
        <PrimaryButton onClick={onSave} loading={isLoading} fullWidth>
          Save
        </PrimaryButton>
        <SecondaryButton onClick={onCancel} fullWidth disabled={isLoading}>
          Cancel
        </SecondaryButton>
      </Flex>
    </Box>
  </DialogBox>
);
