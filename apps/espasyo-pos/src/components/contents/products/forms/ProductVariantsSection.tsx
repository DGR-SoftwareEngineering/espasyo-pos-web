import React from "react";
import { Badge, Box, Card, Flex, IconButton, Select, Text, Tooltip } from "@radix-ui/themes";
import { TrashIcon, PlusIcon, CheckCircledIcon } from "@radix-ui/react-icons";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { Control, useFieldArray, type FieldArrayPath, type FieldValues } from "react-hook-form";
import { TextField } from "core-lib/components/radix/form/TextField";
import { Button } from "core-lib/components/radix/buttons/Button";
import type { ProductVariantTemplateDto } from "core-lib/api/commons/types";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  variantsFieldName?: string;
  variantTemplates?: ProductVariantTemplateDto[];
}

export const ProductVariantsSection: React.FC<Props> = ({
  control,
  variantsFieldName = "variants",
  variantTemplates = [],
}) => {
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: variantsFieldName as FieldArrayPath<FieldValues>,
  });

  const [showTemplateSelect, setShowTemplateSelect] = React.useState(false);
  const [appliedTemplateId, setAppliedTemplateId] = React.useState<string | null>(null);

  const appliedTemplate = appliedTemplateId
    ? variantTemplates.find((t) => t.productVariantTemplateID === appliedTemplateId)
    : null;

  const handleAdd = () => {
    const nextOrder = fields.length;
    append({
      productVariantID: null,
      name: "",
      price: 0,
      displayOrder: nextOrder,
    });
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = variantTemplates.find(
      (t) => t.productVariantTemplateID === templateId,
    );
    if (!template) return;
    replace(
      template.items.map((item, idx) => ({
        productVariantID: null,
        name: item.name,
        price: 0,
        displayOrder: item.displayOrder ?? idx + 1,
      })),
    );
    setAppliedTemplateId(templateId);
    setShowTemplateSelect(false);
  };

  const handleRemoveTemplate = () => {
    setAppliedTemplateId(null);
    replace([]);
  };

  return (
    <Flex direction="column" gap="3">
      <Text size="1" color="gray">
        When variants exist, the cashier must pick one before adding this item
        to the order. The selected variant's price overrides the base price.
      </Text>

      {variantTemplates.length > 0 && (
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
                  {variantTemplates.map((t) => (
                    <Select.Item
                      key={t.productVariantTemplateID}
                      value={t.productVariantTemplateID}
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
            No variants yet. Add at least one (e.g., 12oz, 16oz, 22oz) to enable
            variant selection.
          </Text>
        </Box>
      ) : (
        <Flex direction="column" gap="2">
          {fields.map((field, index) => (
            <Card
              key={field.id}
              variant="surface"
              style={{ padding: "12px", background: "var(--gray-a1)" }}
            >
              <Box
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) auto",
                  gap: "var(--space-3)",
                  alignItems: "end",
                }}
              >
                <TextField
                  name={`${variantsFieldName}.${index}.name`}
                  control={control}
                  label={index === 0 ? "Name" : ""}
                  placeholder="e.g., 12oz"
                />
                <TextField
                  name={`${variantsFieldName}.${index}.price`}
                  control={control}
                  label={index === 0 ? "Price" : ""}
                  type="number"
                  placeholder="0.00"
                />
                <TextField
                  name={`${variantsFieldName}.${index}.displayOrder`}
                  control={control}
                  label={index === 0 ? "Order" : ""}
                  type="number"
                  placeholder="0"
                />
                <Tooltip content="Remove variant">
                  <IconButton
                    size="2"
                    variant="soft"
                    color="red"
                    aria-label="Remove variant"
                    onClick={() => remove(index)}
                  >
                    <TrashIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          ))}
        </Flex>
      )}

      <Box>
        <Button type="Secondary" onClick={handleAdd}>
          <Flex align="center" gap="2">
            <PlusIcon />
            Add Variant
          </Flex>
        </Button>
      </Box>
    </Flex>
  );
};
