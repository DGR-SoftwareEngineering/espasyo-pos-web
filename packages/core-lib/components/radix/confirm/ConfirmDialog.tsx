import React from "react";
import { AlertDialog, Button, Flex } from "@radix-ui/themes";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: "red" | "amber" | "blue" | "green" | "gray";
  loading?: boolean;
  onConfirm: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmColor = "red",
  loading = false,
  onConfirm,
}) => (
  <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
    <AlertDialog.Content style={{ maxWidth: 420 }}>
      <AlertDialog.Title>{title}</AlertDialog.Title>
      <AlertDialog.Description size="2">{description}</AlertDialog.Description>
      <Flex gap="3" mt="4" justify="end">
        <AlertDialog.Cancel>
          <Button variant="soft" color="gray" disabled={loading}>
            {cancelLabel}
          </Button>
        </AlertDialog.Cancel>
        <Button
          color={confirmColor}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? `${confirmLabel}\u2026` : confirmLabel}
        </Button>
      </Flex>
    </AlertDialog.Content>
  </AlertDialog.Root>
);
