import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Text, TextArea } from "@radix-ui/themes";
import { LocalCafeOutlined } from "@mui/icons-material";
import { DialogBox } from "core-lib/components/radix/dialog/DialogBox";
import { DIALOG_TITLES } from "../constants";

interface AddStampDialogProps {
  open: boolean;
  customerName?: string;
  slotNumber?: number | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (reason: string | null) => void;
}

const MAX_REASON = 300;

export const AddStampDialog: React.FC<AddStampDialogProps> = ({
  open,
  customerName,
  slotNumber,
  loading,
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  const handleSubmit = () => {
    const trimmed = reason.trim();
    onSubmit(trimmed.length > 0 ? trimmed : null);
  };

  return (
    <DialogBox
      open={open}
      onClose={onClose}
      title={DIALOG_TITLES.addStamp}
      maxWidth="xs"
      disableDismiss={loading}
    >
      <Box p="4">
        <Flex direction="column" gap="3">
          <Flex align="center" gap="2">
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "var(--brown-a3, var(--orange-a3))",
                color: "var(--brown-11, #4A2F1E)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LocalCafeOutlined style={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Text size="3" weight="bold" as="div">
                Add 1 stamp to {customerName ?? "this customer"}
              </Text>
              {slotNumber != null && (
                <Text size="1" color="gray" as="div">
                  Filling slot #{slotNumber}
                </Text>
              )}
            </Box>
          </Flex>

          <Text size="2" color="gray">
            Use this when a customer presents the physical card and a sale stamp
            wasn&apos;t recorded, or as a compensation gesture. This does not
            count as a visit or affect the customer&apos;s segment.
          </Text>

          <Box>
            <Text as="label" size="2" weight="medium" mb="1">
              Reason <Text as="span" size="1" color="gray">(optional)</Text>
            </Text>
            <TextArea
              placeholder="e.g. Customer brought stamped paper card from yesterday"
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, MAX_REASON))}
              disabled={loading}
              rows={3}
              size="2"
            />
            <Flex justify="end" mt="1">
              <Text size="1" color="gray">
                {reason.length}/{MAX_REASON}
              </Text>
            </Flex>
          </Box>

          <Flex gap="2" justify="end" mt="2">
            <Button variant="soft" color="gray" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button color="amber" onClick={handleSubmit} loading={loading}>
              <LocalCafeOutlined style={{ fontSize: 16 }} />
              Add Stamp
            </Button>
          </Flex>
        </Flex>
      </Box>
    </DialogBox>
  );
};
