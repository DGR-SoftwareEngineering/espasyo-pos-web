import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Text, TextArea } from "@radix-ui/themes";
import { UndoOutlined } from "@mui/icons-material";
import { DialogBox } from "core-lib/components/radix/dialog/DialogBox";
import { DIALOG_TITLES } from "../constants";

interface RemoveStampDialogProps {
  open: boolean;
  customerName?: string;
  currentStamps: number;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (reason: string | null) => void;
}

const MAX_REASON = 300;

export const RemoveStampDialog: React.FC<RemoveStampDialogProps> = ({
  open,
  customerName,
  currentStamps,
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
      title={DIALOG_TITLES.removeStamp}
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
                background: "var(--red-a3)",
                color: "var(--red-11)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UndoOutlined style={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Text size="3" weight="bold" as="div">
                Remove 1 stamp from {customerName ?? "this customer"}
              </Text>
              <Text size="1" color="gray" as="div">
                {currentStamps} → {Math.max(0, currentStamps - 1)} stamps
              </Text>
            </Box>
          </Flex>

          <Text size="2" color="gray">
            Use this to correct a stamp added by mistake. This logs a{" "}
            <strong>Correction</strong> audit entry and cannot be undone.
          </Text>

          <Box>
            <Text as="label" size="2" weight="medium" mb="1">
              Reason <Text as="span" size="1" color="gray">(optional)</Text>
            </Text>
            <TextArea
              placeholder="e.g. Stamp added by mistake"
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
            <Button color="red" onClick={handleSubmit} loading={loading}>
              <UndoOutlined style={{ fontSize: 16 }} />
              Remove Stamp
            </Button>
          </Flex>
        </Flex>
      </Box>
    </DialogBox>
  );
};
