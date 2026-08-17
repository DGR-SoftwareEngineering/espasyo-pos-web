import React from "react";
import {
  Badge,
  Box,
  Flex,
  IconButton,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Card,
  Select,
  Switch,
  Tooltip,
} from "@radix-ui/themes";;
import { TrashIcon, PlusIcon, ChevronDownIcon, ChevronRightIcon, CheckCircledIcon, FileTextIcon } from "@radix-ui/react-icons";
import { Control, Controller, useFieldArray, type FieldArrayPath, type FieldValues } from "react-hook-form";
import { TextField } from "core-lib/components/radix/form/TextField";
import { Button } from "core-lib/components/radix/buttons/Button";
import type { ProductAddOnTemplateDto } from "core-lib/api/commons/types";
import { AddOnItemRecipeDialog } from "../recipe/AddOnItemRecipeDialog";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  addOnGroupsFieldName?: string;
  addOnTemplates?: ProductAddOnTemplateDto[];
  isEdit?: boolean;
}

interface ItemsArrayProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  groupFieldName: string;
  isEdit?: boolean;
}

const AddOnItemsArray: React.FC<ItemsArrayProps> = ({
  control,
  groupFieldName,
  isEdit = false,
}) => {
  const itemsFieldName = `${groupFieldName}.items`;
  const { fields, append, remove } = useFieldArray({
    control,
    name: itemsFieldName as FieldArrayPath<FieldValues>,
  });

  const [selectedItemForRecipe, setSelectedItemForRecipe] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleAddItem = () => {
    append({
      productAddOnItemID: null,
      name: "",
      additionalPrice: 0,
      displayOrder: fields.length,
    });
  };

  return (
    <>
      <Flex direction="column" gap="2">
        <Text size="1" weight="medium" color="gray">
          Items
        </Text>

        {fields.length === 0 ? (
          <Box
            p="3"
            style={{
              border: "1px dashed var(--gray-a6)",
              borderRadius: "var(--radius-2)",
              textAlign: "center",
              background: "var(--gray-a1)",
            }}
          >
            <Text size="1" color="gray">
              No items in this group yet.
            </Text>
          </Box>
        ) : (
          <Flex direction="column" gap="2">
            {fields.map((field, itemIndex) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const addOnItemId = (field as any).productAddOnItemID as string | null;

              return (
                <Box
                  key={field.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: isEdit
                      ? "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) auto auto"
                      : "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) auto",
                    gap: "var(--space-2)",
                    alignItems: "end",
                  }}
                >
                  <TextField
                    name={`${itemsFieldName}.${itemIndex}.name`}
                    control={control}
                    label={itemIndex === 0 ? "Item name" : ""}
                    placeholder="e.g., Cheese"
                  />
                  <TextField
                    name={`${itemsFieldName}.${itemIndex}.additionalPrice`}
                    control={control}
                    label={itemIndex === 0 ? "+ Price" : ""}
                    type="number"
                    placeholder="0.00"
                  />
                  <TextField
                    name={`${itemsFieldName}.${itemIndex}.displayOrder`}
                    control={control}
                    label={itemIndex === 0 ? "Order" : ""}
                    type="number"
                    placeholder="0"
                  />
                  {isEdit && (
                    <Box style={{ display: "flex", alignItems: "flex-end" }}>
                      {addOnItemId ? (
                        <Tooltip content="Manage add-on recipe">
                          <IconButton
                            size="2"
                            variant="ghost"
                            color="indigo"
                            aria-label="Manage add-on item recipe"
                            onClick={() =>
                              setSelectedItemForRecipe({
                                id: addOnItemId,
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                name: (field as any).name || "Add-on item",
                              })
                            }
                          >
                            <FileTextIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Box style={{ width: 32, height: 32 }} />
                      )}
                    </Box>
                  )}
                  <Tooltip content="Remove item">
                    <IconButton
                      size="2"
                      variant="soft"
                      color="red"
                      aria-label="Remove add-on item"
                      style={{ alignSelf: "flex-end" }}
                      onClick={() => remove(itemIndex)}
                    >
                      <TrashIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              );
            })}
          </Flex>
        )}

        <Box>
          <Button type="Secondary" onClick={handleAddItem}>
            <Flex align="center" gap="2">
              <PlusIcon />
              Add Item
            </Flex>
          </Button>
        </Box>
      </Flex>

      {selectedItemForRecipe && (
        <AddOnItemRecipeDialog
          addOnItemId={selectedItemForRecipe.id}
          addOnItemName={selectedItemForRecipe.name}
          open={!!selectedItemForRecipe}
          onClose={() => setSelectedItemForRecipe(null)}
          onSaved={() => setSelectedItemForRecipe(null)}
        />
      )}
    </>
  );
};

export const ProductAddOnGroupsSection: React.FC<Props> = ({
  control,
  addOnGroupsFieldName = "addOnGroups",
  addOnTemplates = [],
  isEdit = false,
}) => {
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: addOnGroupsFieldName as FieldArrayPath<FieldValues>,
  });

  const [expanded, setExpanded] = React.useState<Set<number>>(() => new Set());
  const [showTemplateSelect, setShowTemplateSelect] = React.useState(false);
  const [appliedTemplateId, setAppliedTemplateId] = React.useState<string | null>(null);

  const appliedTemplate = appliedTemplateId
    ? addOnTemplates.find((t) => t.productAddOnTemplateID === appliedTemplateId)
    : null;

  const toggleExpanded = (index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleAddGroup = () => {
    const nextIndex = fields.length;
    append({
      productAddOnGroupID: null,
      name: "",
      isRequired: false,
      minSelections: 0,
      maxSelections: 1,
      displayOrder: nextIndex,
      items: [],
    });
    setExpanded((prev) => new Set(prev).add(nextIndex));
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = addOnTemplates.find(
      (t) => t.productAddOnTemplateID === templateId,
    );
    if (!template) return;
    replace(
      template.groups.map((g, gi) => ({
        productAddOnGroupID: null,
        name: g.name,
        isRequired: g.isRequired,
        minSelections: g.minSelections,
        maxSelections: g.maxSelections,
        displayOrder: g.displayOrder ?? gi + 1,
        items: g.items.map((item, ii) => ({
          productAddOnItemID: null,
          name: item.name,
          additionalPrice: 0,
          displayOrder: item.displayOrder ?? ii + 1,
        })),
      })),
    );
    setExpanded(new Set(template.groups.map((_, i) => i)));
    setAppliedTemplateId(templateId);
    setShowTemplateSelect(false);
  };

  const handleRemoveTemplate = () => {
    setAppliedTemplateId(null);
    replace([]);
    setExpanded(new Set());
  };

  return (
    <Flex direction="column" gap="3">
      <Text size="1" color="gray">
        Add-on groups are optional modifiers customers can pick at the POS
        (e.g., "Extras" with Sauce, Rice). Set "required" to force a selection.
      </Text>

      {addOnTemplates.length > 0 && (
        <Flex align="center" gap="2">
          {appliedTemplate ? (
            <>
              <Badge color="green" size="2">
                <Flex align="center" gap="1">
                  <CheckCircledIcon />
                  Template Applied: {appliedTemplate.name}
                </Flex>
              </Badge>
              <Button type="Secondary" onClick={handleRemoveTemplate}>
                <Flex align="center" gap="1">
                  <TrashIcon />
                  Remove Template
                </Flex>
              </Button>
            </>
          ) : showTemplateSelect ? (
            <>
              <Select.Root onValueChange={handleApplyTemplate}>
                <Select.Trigger placeholder="Select a template…" />
                <Select.Content position="popper">
                  {addOnTemplates.map((t) => (
                    <Select.Item
                      key={t.productAddOnTemplateID}
                      value={t.productAddOnTemplateID}
                    >
                      {t.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              <Button type="Secondary" onClick={() => setShowTemplateSelect(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button type="Secondary" onClick={() => setShowTemplateSelect(true)}>
              Use Template
            </Button>
          )}
        </Flex>
      )}

      {fields.length === 0 ? (
        <Box
          p="4"
          style={{
            border: "1px dashed var(--gray-a6)",
            borderRadius: "var(--radius-3)",
            textAlign: "center",
            background: "var(--gray-a1)",
          }}
        >
          <Text size="2" color="gray">
            No add-on groups yet. Add a group like "Extras" or "Sides" to let
            cashiers customize this item.
          </Text>
        </Box>
      ) : (
        <Flex direction="column" gap="3">
          {fields.map((field, groupIndex) => {
            const isExpanded = expanded.has(groupIndex);
            const groupFieldName = `${addOnGroupsFieldName}.${groupIndex}`;
            return (
              <Card
                key={field.id}
                variant="surface"
                style={{
                  padding: "14px",
                  background: "var(--gray-a1)",
                  border: "1px solid var(--gray-a4)",
                }}
              >
                <Flex direction="column" gap="3">
                  <Flex align="center" gap="2" justify="between">
                    <Flex align="center" gap="2" style={{ flex: 1 }}>
                      <IconButton
                        size="1"
                        variant="ghost"
                        color="gray"
                        aria-label={isExpanded ? "Collapse group" : "Expand group"}
                        onClick={() => toggleExpanded(groupIndex)}
                      >
                        {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                      </IconButton>
                      <Text size="2" weight="bold">
                        Group #{groupIndex + 1}
                      </Text>
                    </Flex>
                    <Tooltip content="Remove group">
                      <IconButton
                        size="2"
                        variant="soft"
                        color="red"
                        aria-label="Remove add-on group"
                        onClick={() => remove(groupIndex)}
                      >
                        <TrashIcon />
                      </IconButton>
                    </Tooltip>
                  </Flex>

                  <Box
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) auto",
                      gap: "var(--space-3)",
                      alignItems: "end",
                    }}
                  >
                    <TextField
                      name={`${groupFieldName}.name`}
                      control={control}
                      label="Group name"
                      placeholder="e.g., Extras"
                    />
                    <Box>
                      <TextField
                        name={`${groupFieldName}.minSelections`}
                        control={control}
                        label="Min"
                        type="number"
                        placeholder="0"
                      />
                      <Text size="1" color="gray" as="div" mt="1">
                        Minimum items the customer must pick. Use 0 for optional groups.
                      </Text>
                    </Box>
                    <Box>
                      <TextField
                        name={`${groupFieldName}.maxSelections`}
                        control={control}
                        label="Max"
                        type="number"
                        placeholder="1"
                      />
                      <Text size="1" color="gray" as="div" mt="1">
                        Maximum items the customer can pick (must be ≥ Min).
                      </Text>
                    </Box>
                    <TextField
                      name={`${groupFieldName}.displayOrder`}
                      control={control}
                      label="Order"
                      type="number"
                      placeholder="0"
                    />
                    <Controller
                      control={control}
                      name={`${groupFieldName}.isRequired`}
                      render={({ field: f }) => (
                        <Flex direction="column" gap="1">
                          <Text size="1" weight="medium" color="gray">
                            Required
                          </Text>
                          <Box style={{ height: 32, display: "flex", alignItems: "center" }}>
                            <Switch
                              checked={!!f.value}
                              onCheckedChange={(c) => f.onChange(c)}
                            />
                          </Box>
                          <Text size="1" color="gray">
                            Customer must pick at least Min items.
                          </Text>
                        </Flex>
                      )}
                    />
                  </Box>

                  {isExpanded && (
                    <Box pl="4" style={{ borderLeft: "2px solid var(--gray-a4)" }}>
                      <AddOnItemsArray
                        control={control}
                        groupFieldName={groupFieldName}
                        isEdit={isEdit}
                      />
                    </Box>
                  )}
                </Flex>
              </Card>
            );
          })}
        </Flex>
      )}

      <Box>
        <Button type="Secondary" onClick={handleAddGroup}>
          <Flex align="center" gap="2">
            <PlusIcon />
            Add Group
          </Flex>
        </Button>
      </Box>
    </Flex>
  );
};
