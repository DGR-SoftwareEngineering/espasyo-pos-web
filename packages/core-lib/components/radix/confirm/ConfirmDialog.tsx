import React from "react";
import { AlertDialog, Box, Button, Flex } from "@radix-ui/themes";
import { useResolution } from "../../../core/hooks";

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
}) => {
  const { isSmallMobile } = useResolution();
  const isFullScreen = isSmallMobile;

  return (
  <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
    <AlertDialog.Content
      style={{
        ...(isFullScreen
          ? {
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              transform: "none",
              maxWidth: "100dvw",
              maxHeight: "100dvh",
              width: "100dvw",
              height: "100dvh",
              borderRadius: 0,
              display: "flex",
              flexDirection: "column",
            }
          : { maxWidth: 420 }),
      }}
    >
      <AlertDialog.Title>{title}</AlertDialog.Title>
      <Box
        style={{
          ...(isFullScreen ? { flex: 1, overflowY: "auto", minHeight: 0 } : {}),
        }}
      >
        <AlertDialog.Description size="2">{description}</AlertDialog.Description>
      </Box>
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
};
