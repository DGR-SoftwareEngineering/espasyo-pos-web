import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Card,
  Badge,
  IconButton,
} from "@radix-ui/themes";
import {
  PlusIcon,
  Pencil1Icon,
  TrashIcon,
  ReloadIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import { useApi, useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import { ProductAddOnTemplateDto } from "core-lib/api/commons/types";
import { Button } from "core-lib/components/radix/buttons/Button";
import { AddOnTemplateFormDialog } from "./AddOnTemplateFormDialog";

interface Props {
  onTemplatesChange?: () => void;
}

interface DeleteConfirmState {
  id: string;
  name: string;
}

export const AddOnTemplatesBlock: React.FC<Props> = ({ onTemplatesChange }) => {
  const { showToast } = useToastContext();

  const [templates, setTemplates] = useState<ProductAddOnTemplateDto[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<ProductAddOnTemplateDto | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const dataApi = useApi((api) => api.commons.addOnTemplateList());

  React.useEffect(() => {
    if (dataApi.result?.data?.response) {
      setTemplates(dataApi.result.data.response);
    }
  }, [dataApi.result]);

  const deleteCb = useApiCallback(async (api, id: string) =>
    api.commons.addOnTemplateDelete(id),
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

  const handleEdit = useCallback((template: ProductAddOnTemplateDto) => {
    setEditTemplate(template);
    setFormOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirm) return;
    setDeletingId(deleteConfirm.id);
    try {
      await deleteCb.execute(deleteConfirm.id);
      showToast("Add-on template deleted", "success");
      setDeleteConfirm(null);
      handleRefresh();
      onTemplatesChange?.();
    } catch {
      showToast("Failed to delete add-on template", "error");
    } finally {
      setDeletingId(null);
    }
  }, [deleteConfirm, deleteCb, showToast, handleRefresh, onTemplatesChange]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const stats = useMemo(() => {
    const totalGroups = templates.reduce(
      (sum, t) => sum + (t.groups?.length ?? 0),
      0,
    );
    return { totalTemplates: templates.length, totalGroups };
  }, [templates]);

  return (
    <Box>
      {/* Header */}
      <Flex justify="between" align="center" mb="4">
        <Box>
          <Text size="5" weight="bold">
            Add-On Templates
          </Text>
          <Flex gap="3" mt="2">
            <Badge color="violet" variant="soft">
              {stats.totalTemplates} Templates
            </Badge>
            <Badge color="gray" variant="soft">
              {stats.totalGroups} Total Groups
            </Badge>
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
              No add-on templates yet. Click &quot;New Template&quot; to create one.
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
          const isDeleting = deletingId === template.productAddOnTemplateID;
          const isConfirming = deleteConfirm?.id === template.productAddOnTemplateID;
          const isExpanded = expandedCards.has(template.productAddOnTemplateID);
          const groupCount = template.groups?.length ?? 0;

          return (
            <Card
              key={template.productAddOnTemplateID}
              variant="surface"
              size="2"
            >
              {/* Template header row */}
              <Flex justify="between" align="start" gap="3">
                <Flex
                  align="start"
                  gap="2"
                  style={{ flex: 1, minWidth: 0, cursor: groupCount > 0 ? "pointer" : "default" }}
                  onClick={() => groupCount > 0 && toggleExpand(template.productAddOnTemplateID)}
                >
                  {groupCount > 0 && (
                    <Box style={{ flexShrink: 0, marginTop: 2 }}>
                      {isExpanded ? (
                        <ChevronDownIcon width={16} height={16} />
                      ) : (
                        <ChevronRightIcon width={16} height={16} />
                      )}
                    </Box>
                  )}
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Flex align="center" gap="2" mb="1">
                      <Text size="3" weight="bold">
                        {template.name}
                      </Text>
                      <Badge color="violet" variant="soft" size="1">
                        {groupCount} {groupCount === 1 ? "group" : "groups"}
                      </Badge>
                    </Flex>
                    {template.description && (
                      <Text size="2" color="gray" as="div">
                        {template.description}
                      </Text>
                    )}
                  </Box>
                </Flex>

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
                            id: template.productAddOnTemplateID,
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

              {/* Expandable group details */}
              {isExpanded && groupCount > 0 && (
                <Box mt="3" pl="5">
                  <Flex direction="column" gap="2">
                    {template.groups.map((group) => {
                      const visibleItems = group.items?.slice(0, 6) ?? [];
                      const extraCount = (group.items?.length ?? 0) - 6;
                      return (
                        <Box
                          key={group.productAddOnTemplateGroupID}
                          style={{
                            borderLeft: "2px solid var(--gray-a5)",
                            paddingLeft: "12px",
                          }}
                        >
                          <Flex align="center" gap="2" mb="1">
                            <Text size="2" weight="medium">
                              {group.name}
                            </Text>
                            {group.isRequired && (
                              <Badge color="red" variant="soft" size="1">
                                Required
                              </Badge>
                            )}
                            <Badge color="gray" variant="soft" size="1">
                              {group.minSelections}–{group.maxSelections} selections
                            </Badge>
                          </Flex>
                          <Flex gap="1" wrap="wrap" align="center">
                            {visibleItems.map((item) => (
                              <Badge
                                key={item.productAddOnTemplateItemID}
                                color="gray"
                                variant="soft"
                                size="1"
                              >
                                {item.name}
                                {item.additionalPrice > 0 && (
                                  <Text size="1" color="gray">
                                    {" "}
                                    +{item.additionalPrice}
                                  </Text>
                                )}
                              </Badge>
                            ))}
                            {extraCount > 0 && (
                              <Badge color="gray" variant="outline" size="1">
                                +{extraCount} more
                              </Badge>
                            )}
                          </Flex>
                        </Box>
                      );
                    })}
                  </Flex>
                </Box>
              )}
            </Card>
          );
        })}
      </Flex>

      <AddOnTemplateFormDialog
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
