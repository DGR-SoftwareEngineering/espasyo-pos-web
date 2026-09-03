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
  Tooltip,
} from "@radix-ui/themes";;
import { TrashIcon, PlusIcon, CheckCircledIcon, FileTextIcon } from "@radix-ui/react-icons";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { Control, useFieldArray, type FieldArrayPath, type FieldValues } from "react-hook-form";
import { TextField } from "core-lib/components/radix/form/TextField";
import { Button } from "core-lib/components/radix/buttons/Button";
import { useApiCallback } from "core-lib/core/hooks";
import type { ProductVariantTemplateDto } from "core-lib/api/commons/types";
import { VariantRecipeDialog } from "../recipe/VariantRecipeDialog";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  variantsFieldName?: string;
  variantTemplates?: ProductVariantTemplateDto[];
  productId?: string;
  isEdit?: boolean;
}

export const ProductVariantsSection: React.FC<Props> = ({
  control,
  variantsFieldName = "variants",
  variantTemplates = [],
  productId,
  isEdit = false,
}) => {
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: variantsFieldName as FieldArrayPath<FieldValues>,
  });

  const [showTemplateSelect, setShowTemplateSelect] = React.useState(false);
  const [appliedTemplateId, setAppliedTemplateId] = React.useState<string | null>(null);
  const [variantIdsWithRecipes, setVariantIdsWithRecipes] = React.useState<Set<string>>(new Set());
  const [selectedVariantForRecipe, setSelectedVariantForRecipe] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  const loadRecipesCb = useApiCallback(
    async (api, pid: string) => api.commons.getVariantRecipesByProduct(pid),
  );

  const loadVariantRecipes = React.useCallback(async () => {
    if (!productId) return;
    try {
      const result = await loadRecipesCb.execute(productId);
      if (result.data.success && result.data.response) {
        const ids = new Set<string>(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          result.data.response.map((r: any) => r.productVariantID as string),
        );
        setVariantIdsWithRecipes(ids);
      }
    } catch {
      // non-critical — recipe buttons still work, just no visual state
    }
  }, [productId]);

  React.useEffect(() => {
    if (isEdit && productId) {
      loadVariantRecipes();
    }
  }, [isEdit, productId]);

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
    <>
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
            {fields.map((field, index) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const variantId = (field as any).productVariantID as string | null;
              const hasRecipe = !!variantId && variantIdsWithRecipes.has(variantId);

              return (
                <Card
                  key={field.id}
                  variant="surface"
                  style={{ padding: "12px", background: "var(--gray-a1)" }}
                >
                  <Box
                    style={{
                      display: "grid",
                      gridTemplateColumns: isEdit
                        ? "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) auto auto"
                        : "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) auto",
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
                    {isEdit && (
                      <Box style={{ display: "flex", alignItems: "flex-end" }}>
                        {variantId ? (
                          <Tooltip
                            content={
                              hasRecipe ? "Edit variant recipe" : "Add variant recipe"
                            }
                          >
                            <IconButton
                              size="2"
                              variant={hasRecipe ? "solid" : "ghost"}
                              color="indigo"
                              aria-label="Manage variant recipe"
                              onClick={() =>
                                setSelectedVariantForRecipe({
                                  id: variantId,
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  name: (field as any).name || "Variant",
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
                    <Tooltip content="Remove variant">
                      <IconButton
                        size="2"
                        variant="soft"
                        color="red"
                        aria-label="Remove variant"
                        style={{ alignSelf: "flex-end" }}
                        onClick={() => remove(index)}
                      >
                        <TrashIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              );
            })}
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

      {selectedVariantForRecipe && (
        <VariantRecipeDialog
          variantId={selectedVariantForRecipe.id}
          variantName={selectedVariantForRecipe.name}
          open={!!selectedVariantForRecipe}
          onClose={() => setSelectedVariantForRecipe(null)}
          onSaved={() => {
            loadVariantRecipes();
            setSelectedVariantForRecipe(null);
          }}
        />
      )}
    </>
  );
};
