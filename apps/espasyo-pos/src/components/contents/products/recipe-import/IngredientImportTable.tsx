import React, { useState } from "react";
import { Table, Badge, IconButton, Text, Flex, Box, Dialog, Button } from "@radix-ui/themes";
import { Cross2Icon, Pencil1Icon } from "@radix-ui/react-icons";
import { IngredientPreviewItemDto, IngredientCategoryDto } from "core-lib/api/commons/types";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { editIngredientSchema, EditIngredientFormValues } from "./validation";
import { TextField } from "core-lib/components/radix/form/TextField";
import { SelectField } from "core-lib/components/radix/form/SelectField";

interface IngredientImportTableProps {
  items: IngredientPreviewItemDto[];
  onRemove: (name: string) => void;
  onUpdate: (originalName: string, patch: Partial<IngredientPreviewItemDto>) => void;
  ingredientCategories: IngredientCategoryDto[];
  ingredientCategoriesLoading?: boolean;
}

const EditIngredientDialog: React.FC<{
  item: IngredientPreviewItemDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patch: Partial<IngredientPreviewItemDto>) => void;
  ingredientCategories: IngredientCategoryDto[];
  ingredientCategoriesLoading?: boolean;
}> = ({ item, open, onOpenChange, onSave, ingredientCategories, ingredientCategoriesLoading }) => {
  const { control, handleSubmit } = useForm<EditIngredientFormValues>({
    resolver: yupResolver(editIngredientSchema),
    defaultValues: {
      name: item.name,
      categoryID: item.categoryID ?? "",
      packagePrice: item.packagePrice,
      qtyPerPack: item.qtyPerPack,
      unitName: item.unitName,
    },
  });

  const onSubmit = (values: EditIngredientFormValues) => {
    onSave({
      name: values.name,
      categoryID: values.categoryID,
      packagePrice: values.packagePrice,
      qtyPerPack: values.qtyPerPack,
      unitName: values.unitName,
    });
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Title>Edit Ingredient</Dialog.Title>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="4">
            <TextField
              name="name"
              control={control}
              label="Name"
              disabled={item.alreadyExistsInDb}
              size="3"
            />
            {!item.alreadyExistsInDb && (
              <SelectField
                name="categoryID"
                control={control}
                label="Category"
                size="3"
                isLoading={ingredientCategoriesLoading}
                options={ingredientCategories.map((c) => ({
                  value: c.ingredientCategoryID,
                  label: c.name,
                }))}
                placeholder="Select category…"
              />
            )}
            <TextField
              name="packagePrice"
              control={control}
              label="Package Price"
              type="number"
              size="3"
            />
            <TextField
              name="qtyPerPack"
              control={control}
              label="Qty Per Pack"
              type="number"
              size="3"
            />
            <TextField
              name="unitName"
              control={control}
              label="Unit Name"
              size="3"
            />
            <Flex gap="2" justify="end">
              <Dialog.Close>
                <Button variant="outline">Cancel</Button>
              </Dialog.Close>
              <Button type="submit">Save</Button>
            </Flex>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export const IngredientImportTable: React.FC<IngredientImportTableProps> = ({
  items,
  onRemove,
  onUpdate,
  ingredientCategories,
  ingredientCategoriesLoading,
}) => {
  const [editingName, setEditingName] = useState<string | null>(null);

  const getStatusBadge = (item: IngredientPreviewItemDto) => {
    if (item.alreadyExistsInDb) return <Badge color="amber">Already Exists</Badge>;
    if (!item.unitExistsInDb && item.unitName) return <Badge color="orange">Missing Unit</Badge>;
    if (item.warnings.length > 0) return <Badge color="orange">Warning</Badge>;
    return <Badge color="green">Will Create</Badge>;
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("fil-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <>
      <Box style={{ overflowX: "auto" }}>
        <Table.Root size="2" layout="auto">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell align="right">Package Cost</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell align="right">Qty/Pack</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Unit</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell align="right">Unit Cost</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items.map((item) => (
              <Table.Row key={item.name}>
                <Table.Cell>
                  <Flex direction="column" gap="1">
                    <Text weight="medium">{item.name}</Text>
                    {item.warnings.map((warning, i) => (
                      <Text key={i} as="p" size="1" color="orange">
                        ⚠ {warning}
                      </Text>
                    ))}
                  </Flex>
                </Table.Cell>
                <Table.Cell align="right">
                  <Text>{formatCurrency(item.packagePrice)}</Text>
                </Table.Cell>
                <Table.Cell align="right">
                  <Text>{item.qtyPerPack.toFixed(2)}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text>{item.unitName || "—"}</Text>
                </Table.Cell>
                <Table.Cell align="right">
                  <Text>{formatCurrency(item.unitCost)}</Text>
                </Table.Cell>
                <Table.Cell>
                  {!item.alreadyExistsInDb && !item.categoryID && (
                    <Badge color="amber">No category</Badge>
                  )}
                  {item.categoryID && (
                    <Text size="2">
                      {ingredientCategories.find(
                        (c) => c.ingredientCategoryID === item.categoryID
                      )?.name || "Unknown"}
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell>{getStatusBadge(item)}</Table.Cell>
                <Table.Cell>
                  <Flex gap="1">
                    <IconButton
                      onClick={() => setEditingName(item.name)}
                      variant="ghost"
                      size="1"
                      color="gray"
                      title="Edit ingredient"
                    >
                      <Pencil1Icon width={16} height={16} />
                    </IconButton>
                    {!item.alreadyExistsInDb && (
                      <IconButton
                        onClick={() => onRemove(item.name)}
                        variant="ghost"
                        size="1"
                        color="gray"
                        title="Remove ingredient"
                      >
                        <Cross2Icon width={16} height={16} />
                      </IconButton>
                    )}
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {editingName && (
        <EditIngredientDialog
          item={items.find((i) => i.name === editingName)!}
          open={editingName !== null}
          onOpenChange={(open) => !open && setEditingName(null)}
          onSave={(patch) => {
            onUpdate(editingName, patch);
            setEditingName(null);
          }}
          ingredientCategories={ingredientCategories}
          ingredientCategoriesLoading={ingredientCategoriesLoading}
        />
      )}
    </>
  );
};
