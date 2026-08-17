import React, { useEffect, useState } from "react";
import {
  Flex,
  Text,
  IconButton,
  Badge,
  Separator,
} from "core-lib/components/radix/proxies";
import {
  useForm,
  useFieldArray,
  Controller } from "react-hook-form"; import {   Box,
  Card,
  Switch,
} from "@radix-ui/themes";;
import {
  PlusIcon,
  Cross1Icon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import { useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import {
  ProductAddOnTemplateDto,
  CreateAddOnTemplateParams,
  UpdateAddOnTemplateParams,
} from "core-lib/api/commons/types";
import { DialogBox } from "core-lib/components/radix/dialog/DialogBox";
import { TextField } from "core-lib/components/radix/form/TextField";
import { Button } from "core-lib/components/radix/buttons/Button";

interface AddOnItemForm {
  productAddOnTemplateItemID?: string;
  name: string;
  displayOrder: number;
}

interface AddOnGroupForm {
  productAddOnTemplateGroupID?: string;
  name: string;
  isRequired: boolean;
  minSelections: number | string;
  maxSelections: number | string;
  displayOrder: number;
  items: AddOnItemForm[];
}

interface AddOnTemplateForm {
  name: string;
  description: string;
  groups: AddOnGroupForm[];
}

interface Props {
  open: boolean;
  editTemplate?: ProductAddOnTemplateDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddOnTemplateFormDialog: React.FC<Props> = ({
  open,
  editTemplate,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToastContext();
  const isEdit = !!editTemplate;

  const [expandedGroups, setExpandedGroups] = useState<boolean[]>([true]);

  const { control, handleSubmit, reset } = useForm<AddOnTemplateForm>({
    defaultValues: {
      name: "",
      description: "",
      groups: [
        {
          name: "",
          isRequired: false,
          minSelections: 0,
          maxSelections: 1,
          displayOrder: 1,
          items: [{ name: "", displayOrder: 1 }],
        },
      ],
    },
  });

  const {
    fields: groupFields,
    append: appendGroup,
    remove: removeGroup,
  } = useFieldArray({ control, name: "groups" });

  useEffect(() => {
    if (open) {
      if (editTemplate) {
        reset({
          name: editTemplate.name,
          description: editTemplate.description ?? "",
          groups: editTemplate.groups.map((g, gi) => ({
            productAddOnTemplateGroupID: g.productAddOnTemplateGroupID,
            name: g.name,
            isRequired: g.isRequired,
            minSelections: g.minSelections,
            maxSelections: g.maxSelections,
            displayOrder: g.displayOrder ?? gi + 1,
            items: g.items.map((item, ii) => ({
              productAddOnTemplateItemID: item.productAddOnTemplateItemID,
              name: item.name,
              displayOrder: item.displayOrder ?? ii + 1,
            })),
          })),
        });
        setExpandedGroups(editTemplate.groups.map(() => true));
      } else {
        reset({
          name: "",
          description: "",
          groups: [
            {
              name: "",
              isRequired: false,
              minSelections: 0,
              maxSelections: 1,
              displayOrder: 1,
              items: [{ name: "", displayOrder: 1 }],
            },
          ],
        });
        setExpandedGroups([true]);
      }
    }
  }, [open, editTemplate, reset]);

  const createCb = useApiCallback(
    async (api, params: CreateAddOnTemplateParams) =>
      api.commons.addOnTemplateCreate(params),
  );

  const updateCb = useApiCallback(
    async (api, params: UpdateAddOnTemplateParams) =>
      api.commons.addOnTemplateUpdate(params),
  );

  const loading = createCb.loading || updateCb.loading;

  const toggleGroup = (index: number) => {
    setExpandedGroups((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const handleAddGroup = () => {
    appendGroup({
      name: "",
      isRequired: false,
      minSelections: 0,
      maxSelections: 1,
      displayOrder: groupFields.length + 1,
      items: [{ name: "", displayOrder: 1 }],
    });
    setExpandedGroups((prev) => [...prev, true]);
  };

  const handleRemoveGroup = (index: number) => {
    removeGroup(index);
    setExpandedGroups((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: AddOnTemplateForm) => {
    const mappedGroups = values.groups.map((group, gi) => ({
      productAddOnTemplateGroupID: group.productAddOnTemplateGroupID,
      name: group.name,
      isRequired: group.isRequired,
      minSelections: Number(group.minSelections),
      maxSelections: Number(group.maxSelections),
      displayOrder: gi + 1,
      isActive: true,
      items: group.items.map((item, ii) => ({
        productAddOnTemplateItemID: item.productAddOnTemplateItemID,
        name: item.name,
        additionalPrice: 0,
        displayOrder: ii + 1,
        isActive: true,
      })),
    }));

    try {
      if (isEdit && editTemplate) {
        await updateCb.execute({
          productAddOnTemplateID: editTemplate.productAddOnTemplateID,
          name: values.name,
          description: values.description || undefined,
          groups: mappedGroups,
        });
        showToast("Add-on template updated successfully", "success");
      } else {
        await createCb.execute({
          name: values.name,
          description: values.description || undefined,
          groups: mappedGroups.map((g) => ({
            name: g.name,
            isRequired: g.isRequired,
            minSelections: g.minSelections,
            maxSelections: g.maxSelections,
            displayOrder: g.displayOrder,
            items: g.items.map((item) => ({
              name: item.name,
              additionalPrice: 0,
              displayOrder: item.displayOrder,
            })),
          })),
        });
        showToast("Add-on template created successfully", "success");
      }
      onSuccess();
      onClose();
    } catch {
      showToast(
        isEdit ? "Failed to update add-on template" : "Failed to create add-on template",
        "error",
      );
    }
  };

  return (
    <DialogBox
      open={open}
      onClose={() => !loading && onClose()}
      title={isEdit ? "Edit Add-On Template" : "Create Add-On Template"}
      maxWidth="lg"
      loading={loading}
      actions={
        <Flex gap="2" justify="end">
          <Button type="Secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="Primary"
            onClick={handleSubmit(onSubmit)}
            loading={loading}
          >
            {isEdit ? "Update Template" : "Create Template"}
          </Button>
        </Flex>
      }
    >
      <Flex direction="column" gap="4">
        <TextField
          name="name"
          control={control}
          label="Name"
          placeholder="e.g. Coffee Customizations"
        />

        <TextField
          name="description"
          control={control}
          label="Description"
          placeholder="Optional description"
        />

        <Separator size="4" />

        <Box>
          <Flex justify="between" align="center" mb="2">
            <Text size="2" weight="bold">
              Add-On Groups
            </Text>
            <Text size="1" color="gray">
              {groupFields.length} group{groupFields.length !== 1 ? "s" : ""}
            </Text>
          </Flex>
          <Text size="1" color="gray" mb="3" as="p">
            Each group is a choice the cashier presents at POS — e.g. &quot;Sugar Level&quot;
            with a required single-pick, or &quot;Extras&quot; with optional multi-pick.
          </Text>

          <Flex direction="column" gap="3">
            {groupFields.map((groupField, groupIndex) => (
              <GroupCard
                key={groupField.id}
                groupIndex={groupIndex}
                control={control}
                expanded={expandedGroups[groupIndex] ?? true}
                onToggle={() => toggleGroup(groupIndex)}
                onRemove={() => handleRemoveGroup(groupIndex)}
                canRemove={groupFields.length > 1}
              />
            ))}
          </Flex>

          <Box mt="3">
            <Button type="Secondary" onClick={handleAddGroup}>
              <Flex align="center" gap="2">
                <PlusIcon />
                Add Group
              </Flex>
            </Button>
          </Box>
        </Box>
      </Flex>
    </DialogBox>
  );
};

interface GroupCardProps {
  groupIndex: number;
  control: ReturnType<typeof useForm<AddOnTemplateForm>>["control"];
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  canRemove: boolean;
}

const GroupCard: React.FC<GroupCardProps> = ({
  groupIndex,
  control,
  expanded,
  onToggle,
  onRemove,
  canRemove,
}) => {
  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control,
    name: `groups.${groupIndex}.items`,
  });

  return (
    <Card variant="surface" size="2">
      {/* Group header */}
      <Flex align="start" gap="2" mb={expanded ? "3" : "0"}>
        <IconButton
          size="1"
          variant="ghost"
          color="gray"
          onClick={onToggle}
          style={{ marginTop: 4, flexShrink: 0 }}
        >
          {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
        </IconButton>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Flex align="start" gap="2" wrap="wrap">
            {/* Group name */}
            <Box style={{ flex: "1 1 180px", minWidth: 120 }}>
              <Controller
                name={`groups.${groupIndex}.name`}
                control={control}
                rules={{ required: "Group name required" }}
                render={({ field, fieldState }) => (
                  <Flex direction="column" gap="1">
                    <input
                      {...field}
                      placeholder="Group name (e.g. Temperature)"
                      style={{
                        width: "100%",
                        padding: "6px 10px",
                        borderRadius: "var(--radius-2)",
                        border: fieldState.error
                          ? "1px solid var(--red-9)"
                          : "1px solid var(--gray-7)",
                        background: "var(--color-surface)",
                        color: "var(--gray-12)",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    />
                    {fieldState.error && (
                      <Text size="1" color="red">
                        {fieldState.error.message}
                      </Text>
                    )}
                  </Flex>
                )}
              />
            </Box>

            {/* Min selections */}
            <Box style={{ flex: "0 0 110px" }}>
              <Controller
                name={`groups.${groupIndex}.minSelections`}
                control={control}
                render={({ field }) => (
                  <Flex direction="column" gap="1">
                    <Text size="1" color="gray">
                      Min
                    </Text>
                    <input
                      {...field}
                      type="number"
                      min={0}
                      placeholder="Min"
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        borderRadius: "var(--radius-2)",
                        border: "1px solid var(--gray-7)",
                        background: "var(--color-surface)",
                        color: "var(--gray-12)",
                        fontSize: "13px",
                        boxSizing: "border-box",
                      }}
                    />
                    <Text size="1" color="gray">
                      Min items the customer must pick. 0 = optional.
                    </Text>
                  </Flex>
                )}
              />
            </Box>

            {/* Max selections */}
            <Box style={{ flex: "0 0 110px" }}>
              <Controller
                name={`groups.${groupIndex}.maxSelections`}
                control={control}
                render={({ field }) => (
                  <Flex direction="column" gap="1">
                    <Text size="1" color="gray">
                      Max
                    </Text>
                    <input
                      {...field}
                      type="number"
                      min={1}
                      placeholder="Max"
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        borderRadius: "var(--radius-2)",
                        border: "1px solid var(--gray-7)",
                        background: "var(--color-surface)",
                        color: "var(--gray-12)",
                        fontSize: "13px",
                        boxSizing: "border-box",
                      }}
                    />
                    <Text size="1" color="gray">
                      Max items the customer can pick (≥ Min).
                    </Text>
                  </Flex>
                )}
              />
            </Box>

            {/* Required toggle */}
            <Flex direction="column" gap="1" style={{ flex: "0 0 130px" }}>
              <Text size="1" color="gray">
                Required
              </Text>
              <Controller
                name={`groups.${groupIndex}.isRequired`}
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    size="2"
                  />
                )}
              />
              <Text size="1" color="gray">
                When ON, customer must pick at least Min items.
              </Text>
            </Flex>
          </Flex>
        </Box>

        {/* Remove group button */}
        {canRemove && (
          <IconButton
            size="2"
            variant="ghost"
            color="red"
            onClick={onRemove}
            style={{ flexShrink: 0, marginTop: 2 }}
          >
            <Cross1Icon />
          </IconButton>
        )}
      </Flex>

      {/* Group items (collapsible) */}
      {expanded && (
        <Box pl="6">
          <Flex direction="column" gap="2">
            {itemFields.map((itemField, itemIndex) => (
              <Flex key={itemField.id} align="start" gap="2">
                <Box style={{ flex: 1 }}>
                  <Controller
                    name={`groups.${groupIndex}.items.${itemIndex}.name`}
                    control={control}
                    rules={{ required: "Item name required" }}
                    render={({ field, fieldState }) => (
                      <Flex direction="column" gap="1">
                        <input
                          {...field}
                          placeholder="Item name (e.g. Hot)"
                          style={{
                            width: "100%",
                            padding: "5px 9px",
                            borderRadius: "var(--radius-2)",
                            border: fieldState.error
                              ? "1px solid var(--red-9)"
                              : "1px solid var(--gray-7)",
                            background: "var(--color-surface)",
                            color: "var(--gray-12)",
                            fontSize: "13px",
                            boxSizing: "border-box",
                          }}
                        />
                        {fieldState.error && (
                          <Text size="1" color="red">
                            {fieldState.error.message}
                          </Text>
                        )}
                      </Flex>
                    )}
                  />
                </Box>

                <IconButton
                  size="1"
                  variant="ghost"
                  color="red"
                  onClick={() => removeItem(itemIndex)}
                  disabled={itemFields.length === 1}
                  style={{ marginTop: 3 }}
                >
                  <Cross1Icon />
                </IconButton>
              </Flex>
            ))}
          </Flex>

          <Box mt="2">
            <Button
              type="Secondary"
              size="1"
              onClick={() =>
                appendItem({
                  name: "",
                  displayOrder: itemFields.length + 1,
                })
              }
            >
              <Flex align="center" gap="1">
                <PlusIcon />
                Add Item
              </Flex>
            </Button>
          </Box>
        </Box>
      )}
    </Card>
  );
};
