import React from "react";
import { Box, Button, Flex, Text, Badge } from "@radix-ui/themes";
import { useApiCallback } from "../../../../core/hooks";
import { useToastContext } from "../../../../core/contexts";
import { PlatformDto } from "../../../../api/platform/types";

interface PlatformDeleteDialogContentProps {
  data: PlatformDto;
  onSuccess?: () => void;
  onClose?: () => void;
}

export const PlatformDeleteDialogContent: React.FC<PlatformDeleteDialogContentProps> = ({
  data,
  onSuccess,
  onClose,
}) => {
  const { showToast } = useToastContext();
  const deleteCb = useApiCallback((api, id: string) => api.platform.delete(id));

  if (data.isSystem) {
    return (
      <>
        <Box style={{ padding: "var(--space-4)" }}>
          <Badge color="red" variant="soft" size="3" style={{ marginBottom: "var(--space-3)" }}>
            System platforms cannot be deleted
          </Badge>
          <Text size="2">
            The "{data.name}" platform is a core system platform and cannot be removed.
          </Text>
        </Box>
        <Flex gap="2" justify="end" style={{ padding: "var(--space-4)", borderTop: "1px solid var(--gray-6)" }}>
          <Button onClick={onClose}>Close</Button>
        </Flex>
      </>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteCb.execute(data.platformID);
      showToast("Platform deleted successfully", "success");
      onSuccess?.();
      onClose?.();
    } catch (error) {
      showToast(
        Array.isArray(error) ? error[0] : "Failed to delete platform",
        "error"
      );
    }
  };

  return (
    <>
      <Box style={{ padding: "var(--space-4)" }}>
        <Badge color="orange" variant="soft" size="2" style={{ marginBottom: "var(--space-3)" }}>
          This action cannot be undone
        </Badge>
        <Text size="2" style={{ display: "block", marginBottom: "var(--space-2)" }}>
          Are you sure you want to delete the "{data.name}" platform?
        </Text>
        <Text size="1" color="gray">
          All user assignments to this platform will be removed.
        </Text>
      </Box>
      <Flex gap="2" justify="end" style={{ padding: "var(--space-4)", borderTop: "1px solid var(--gray-6)" }}>
        <Button onClick={onClose} variant="soft" color="gray">
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          disabled={deleteCb.loading}
          color="red"
        >
          {deleteCb.loading ? "Deleting..." : "Delete"}
        </Button>
      </Flex>
    </>
  );
};
