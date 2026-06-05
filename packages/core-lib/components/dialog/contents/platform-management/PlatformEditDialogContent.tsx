import React, { useState } from "react";
import { Box, Button, Flex, Text, Badge } from "@radix-ui/themes";
import { useApiCallback } from "../../../../core/hooks";
import { useToastContext } from "../../../../core/contexts";
import { PlatformDto, UpdatePlatformParams } from "../../../../api/platform/types";

interface PlatformEditDialogContentProps {
  data: PlatformDto;
  onSuccess?: () => void;
  onClose?: () => void;
}

export const PlatformEditDialogContent: React.FC<PlatformEditDialogContentProps> = ({
  data,
  onSuccess,
  onClose,
}) => {
  const { showToast } = useToastContext();
  const updateCb = useApiCallback((api, { id, params }: { id: string; params: UpdatePlatformParams }) =>
    api.platform.update(id, params)
  );
  const [formData, setFormData] = useState<UpdatePlatformParams>({
    name: data.name,
    description: data.description,
  });

  if (data.isSystem) {
    return (
      <>
        <Box style={{ padding: "var(--space-4)" }}>
          <Badge color="orange" variant="soft" size="3">
            System platforms cannot be edited
          </Badge>
        </Box>
        <Flex gap="2" justify="end" style={{ padding: "var(--space-4)", borderTop: "1px solid var(--gray-6)" }}>
          <Button onClick={onClose}>Close</Button>
        </Flex>
      </>
    );
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      showToast("Platform name is required", "error");
      return;
    }

    try {
      await updateCb.execute({ id: data.platformID, params: formData });
      showToast("Platform updated successfully", "success");
      onSuccess?.();
      onClose?.();
    } catch (error) {
      showToast(
        Array.isArray(error) ? error[0] : "Failed to update platform",
        "error"
      );
    }
  };

  return (
    <>
      <Box style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <input
          type="text"
          placeholder="Platform Name"
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={{ padding: "var(--space-2)", borderRadius: "var(--radius-2)", border: "1px solid var(--gray-7)" }}
        />
        <textarea
          placeholder="Description"
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          style={{ padding: "var(--space-2)", borderRadius: "var(--radius-2)", border: "1px solid var(--gray-7)", fontFamily: "inherit" }}
        />
      </Box>
      <Flex gap="2" justify="end" style={{ padding: "var(--space-4)", borderTop: "1px solid var(--gray-6)" }}>
        <Button onClick={onClose} variant="soft" color="gray">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={updateCb.loading}
        >
          {updateCb.loading ? "Saving..." : "Save"}
        </Button>
      </Flex>
    </>
  );
};
