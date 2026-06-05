import React, { useState } from "react";
import { Box, Button, Flex } from "@radix-ui/themes";
import { useApiCallback } from "../../../../core/hooks";
import { useToastContext } from "../../../../core/contexts";
import { CreatePlatformParams } from "../../../../api/platform/types";

interface PlatformCreateDialogContentProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export const PlatformCreateDialogContent: React.FC<PlatformCreateDialogContentProps> = ({
  onSuccess,
  onClose,
}) => {
  const { showToast } = useToastContext();
  const createCb = useApiCallback((api, params: CreatePlatformParams) =>
    api.platform.create(params)
  );
  const [formData, setFormData] = useState<CreatePlatformParams>({
    name: "",
    slugKey: "",
    description: "",
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.slugKey) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    try {
      await createCb.execute(formData);
      showToast("Platform created successfully", "success");
      onSuccess?.();
      onClose?.();
    } catch (error) {
      showToast(
        Array.isArray(error) ? error[0] : "Failed to create platform",
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
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={{ padding: "var(--space-2)", borderRadius: "var(--radius-2)", border: "1px solid var(--gray-7)" }}
        />
        <input
          type="text"
          placeholder="Slug Key"
          value={formData.slugKey}
          onChange={(e) => setFormData({ ...formData, slugKey: e.target.value })}
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
          disabled={createCb.loading}
        >
          {createCb.loading ? "Creating..." : "Create"}
        </Button>
      </Flex>
    </>
  );
};
