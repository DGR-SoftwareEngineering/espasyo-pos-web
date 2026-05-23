import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Card,
  Badge,
  IconButton,
} from "@radix-ui/themes";
import { PlusIcon, Pencil1Icon, TrashIcon, ReloadIcon } from "@radix-ui/react-icons";
import { useApi, useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import { ProductVariantTemplateDto } from "core-lib/api/commons/types";
import { Button } from "core-lib/components/radix/buttons/Button";
import { VariantTemplateFormDialog } from "./VariantTemplateFormDialog";

interface Props {
  onTemplatesChange?: () => void;
}

interface DeleteConfirmState {
  id: string;
  name: string;
}

export const VariantTemplatesBlock: React.FC<Props> = ({ onTemplatesChange }) => {
  const { showToast } = useToastContext();

  const [templates, setTemplates] = useState<ProductVariantTemplateDto[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<ProductVariantTemplateDto | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const dataApi = useApi((api) => api.commons.variantTemplateList());

  React.useEffect(() => {
    if (dataApi.result?.data?.response) {
      setTemplates(dataApi.result.data.response);
    }
  }, [dataApi.result]);

  const deleteCb = useApiCallback(async (api, id: string) =>
    api.commons.variantTemplateDelete(id),
  );

  const handleRefresh = useCallback(() => {
    dataApi.execute();
  }, [dataApi]);

  const handleSuccess = useCallback(() => {
    handleRefresh();
    onTemplatesChange?.();
  }, [handleRefresh, onTemplatesChange]);

  const handleOpenCreate = useCallback(() => {
    setEditTemplate(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((template: ProductVariantTemplateDto) => {
    setEditTemplate(template);
    setFormOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirm) return;
    setDeletingId(deleteConfirm.id);
    try {
      await deleteCb.execute(deleteConfirm.id);
      showToast("Template deleted", "success");
      setDeleteConfirm(null);
      handleRefresh();
      onTemplatesChange?.();
    } catch {
      showToast("Failed to delete template", "error");
    } finally {
      setDeletingId(null);
    }
  }, [deleteConfirm, deleteCb, showToast, handleRefresh, onTemplatesChange]);

  const stats = useMemo(() => {
    const totalItems = templates.reduce((sum, t) => sum + (t.items?.length ?? 0), 0);
    return { totalTemplates: templates.length, totalItems };
  }, [templates]);

  return (
    <Box>
      {/* Header */}
      <Flex justify="between" align="center" mb="4">
        <Box>
          <Text size="5" weight="bold">
            Variant Templates
          </Text>
          <Flex gap="3" mt="2">
            <Flex align="center" gap="1">
              <Badge color="blue" variant="soft">
                {stats.totalTemplates} Templates
              </Badge>
              <Badge color="gray" variant="soft">
                {stats.totalItems} Total Items
              </Badge>
            </Flex>
          </Flex>
        </Box>
        <Flex gap="2">
          <Button
            type="Secondary"
            onClick={handleRefresh}
            disabled={dataApi.loading}
          >
            <Flex align="center" gap="2">
              <ReloadIcon />
              Refresh
            </Flex>
          </Button>
          <Button type="Primary" onClick={handleOpenCreate}>
            <Flex align="center" gap="2">
              <PlusIcon />
              New Template
            </Flex>
          </Button>
        </Flex>
      </Flex>

      {/* Empty state */}
      {!dataApi.loading && templates.length === 0 && (
        <Card variant="surface" size="2">
          <Flex align="center" justify="center" py="6">
            <Text color="gray" size="2">
              No variant templates yet. Click &quot;New Template&quot; to create one.
            </Text>
          </Flex>
        </Card>
      )}

      {/* Loading state */}
      {dataApi.loading && templates.length === 0 && (
        <Card variant="surface" size="2">
          <Flex align="center" justify="center" py="6">
            <Text color="gray" size="2">
              Loading templates…
            </Text>
          </Flex>
        </Card>
      )}

      {/* Template cards */}
      <Flex direction="column" gap="3">
        {templates.map((template) => {
          const isDeleting = deletingId === template.productVariantTemplateID;
          const isConfirming =
            deleteConfirm?.id === template.productVariantTemplateID;
          const visibleItems = template.items?.slice(0, 5) ?? [];
          const extraCount = (template.items?.length ?? 0) - 5;

          return (
            <Card
              key={template.productVariantTemplateID}
              variant="surface"
              size="2"
            >
              <Flex justify="between" align="start" gap="3">
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Flex align="center" gap="2" mb="1">
                    <Text size="3" weight="bold">
                      {template.name}
                    </Text>
                    <Badge color="blue" variant="soft" size="1">
                      {template.items?.length ?? 0}{" "}
                      {(template.items?.length ?? 0) === 1 ? "item" : "items"}
                    </Badge>
                  </Flex>

                  {template.description && (
                    <Text size="2" color="gray" as="div" mb="2">
                      {template.description}
                    </Text>
                  )}

                  <Flex gap="1" wrap="wrap" align="center">
                    {visibleItems.map((item) => (
                      <Badge
                        key={item.productVariantTemplateItemID}
                        color="gray"
                        variant="soft"
                        size="1"
                      >
                        {item.name}
                      </Badge>
                    ))}
                    {extraCount > 0 && (
                      <Badge color="gray" variant="outline" size="1">
                        +{extraCount} more
                      </Badge>
                    )}
                  </Flex>
                </Box>

                {/* Actions */}
                <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
                  {isConfirming ? (
                    <Flex align="center" gap="2">
                      <Text size="1" color="gray">
                        Confirm?
                      </Text>
                      <Button
                        type="Secondary"
                        size="1"
                        onClick={() => setDeleteConfirm(null)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="Critical"
                        size="1"
                        onClick={handleDeleteConfirm}
                        loading={isDeleting}
                      >
                        Confirm
                      </Button>
                    </Flex>
                  ) : (
                    <>
                      <IconButton
                        size="2"
                        variant="ghost"
                        color="gray"
                        onClick={() => handleEdit(template)}
                        disabled={!!deletingId}
                      >
                        <Pencil1Icon />
                      </IconButton>
                      <IconButton
                        size="2"
                        variant="ghost"
                        color="red"
                        onClick={() =>
                          setDeleteConfirm({
                            id: template.productVariantTemplateID,
                            name: template.name,
                          })
                        }
                        disabled={!!deletingId}
                      >
                        <TrashIcon />
                      </IconButton>
                    </>
                  )}
                </Flex>
              </Flex>
            </Card>
          );
        })}
      </Flex>

      <VariantTemplateFormDialog
        open={formOpen}
        editTemplate={editTemplate}
        onClose={() => {
          setFormOpen(false);
          setEditTemplate(null);
        }}
        onSuccess={handleSuccess}
      />
    </Box>
  );
};
