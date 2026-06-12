import React, { useState } from "react";
import { Table, Badge, IconButton, Text, Flex, Box, Dialog, Button } from "@radix-ui/themes";
import { Cross2Icon, Pencil1Icon } from "@radix-ui/react-icons";
import { IngredientPreviewItemDto } from "core-lib/api/commons/types";

interface IngredientImportTableProps {
  items: IngredientPreviewItemDto[];
  onRemove: (name: string) => void;
  onUpdate: (originalName: string, patch: Partial<IngredientPreviewItemDto>) => void;
}

const EditIngredientDialog: React.FC<{
  item: IngredientPreviewItemDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patch: Partial<IngredientPreviewItemDto>) => void;
}> = ({ item, open, onOpenChange, onSave }) => {
  const [name, setName] = useState(item.name);
  const [packagePrice, setPackagePrice] = useState(item.packagePrice.toString());
  const [qtyPerPack, setQtyPerPack] = useState(item.qtyPerPack.toString());
  const [unitName, setUnitName] = useState(item.unitName);

  const handleSave = () => {
    onSave({
      name: name.trim(),
      packagePrice: parseFloat(packagePrice) || 0,
      qtyPerPack: parseFloat(qtyPerPack) || 1,
      unitName: unitName.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Title>Edit Ingredient</Dialog.Title>
        <Flex direction="column" gap="4">
          <Box>
            <Text as="div" mb="2" size="2" weight="medium">
              Name
            </Text>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={item.alreadyExistsInDb}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid var(--gray-a7)",
                fontFamily: "inherit",
                fontSize: "inherit",
                opacity: item.alreadyExistsInDb ? 0.6 : 1,
                cursor: item.alreadyExistsInDb ? "not-allowed" : "auto",
              }}
            />
            {item.alreadyExistsInDb && (
              <Text size="1" color="gray" mt="1" as="p">
                Cannot rename existing ingredient
              </Text>
            )}
          </Box>

          <Box>
            <Text as="div" mb="2" size="2" weight="medium">
              Package Price
            </Text>
            <input
              type="number"
              step="0.01"
              value={packagePrice}
              onChange={(e) => setPackagePrice(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid var(--gray-a7)",
                fontFamily: "inherit",
                fontSize: "inherit",
              }}
            />
          </Box>

          <Box>
            <Text as="div" mb="2" size="2" weight="medium">
              Qty Per Pack
            </Text>
            <input
              type="number"
              step="0.01"
              value={qtyPerPack}
              onChange={(e) => setQtyPerPack(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid var(--gray-a7)",
                fontFamily: "inherit",
                fontSize: "inherit",
              }}
            />
          </Box>

          <Box>
            <Text as="div" mb="2" size="2" weight="medium">
              Unit Name
            </Text>
            <input
              type="text"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid var(--gray-a7)",
                fontFamily: "inherit",
                fontSize: "inherit",
              }}
            />
          </Box>

          <Flex gap="2" justify="end">
            <Dialog.Close>
              <Button variant="outline">Cancel</Button>
            </Dialog.Close>
            <Button onClick={handleSave}>Save</Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export const IngredientImportTable: React.FC<IngredientImportTableProps> = ({
  items,
  onRemove,
  onUpdate,
}) => {
  const [editingName, setEditingName] = useState<string | null>(null);

  const getStatusBadge = (item: IngredientPreviewItemDto) => {
    if (item.alreadyExistsInDb) {
      return <Badge color="amber">Already Exists</Badge>;
    }
    if (!item.unitExistsInDb && item.unitName) {
      return <Badge color="orange">Missing Unit</Badge>;
    }
    if (item.warnings.length > 0) {
      return <Badge color="orange">Warning</Badge>;
    }
    return <Badge color="green">Will Create</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fil-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

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
                    {item.warnings.length > 0 && (
                      <Flex direction="column" gap="1">
                        {item.warnings.map((warning, i) => (
                          <Text key={i} as="p" size="1" color="orange">
                            ⚠ {warning}
                          </Text>
                        ))}
                      </Flex>
                    )}
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
          item={items.find(i => i.name === editingName)!}
          open={editingName !== null}
          onOpenChange={(open) => !open && setEditingName(null)}
          onSave={(patch) => {
            onUpdate(editingName, patch);
            setEditingName(null);
          }}
        />
      )}
    </>
  );
};
