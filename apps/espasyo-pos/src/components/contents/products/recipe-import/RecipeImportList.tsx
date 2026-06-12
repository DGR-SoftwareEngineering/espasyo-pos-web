import React, { useState } from "react";
import { Badge, IconButton, Text, Flex, Box, Table, Dialog, Button, Callout } from "@radix-ui/themes";
import { Cross2Icon, ChevronDownIcon, ChevronRightIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { RecipePreviewItemDto, RecipeItemPreviewDto } from "core-lib/api/commons/types";

interface RecipeImportListProps {
  items: RecipePreviewItemDto[];
  onRemove: (name: string) => void;
  onUpdateName: (originalName: string, newName: string) => void;
  onUpdateItem: (menuItemName: string, itemIndex: number, patch: Partial<RecipeItemPreviewDto>) => void;
}

export const RecipeImportList: React.FC<RecipeImportListProps> = ({ items, onRemove, onUpdateName, onUpdateItem }) => {
  const [expandedRecipes, setExpandedRecipes] = useState<Set<string>>(new Set());

  const toggleExpanded = (name: string) => {
    const newExpanded = new Set(expandedRecipes);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpandedRecipes(newExpanded);
  };

  const getStatusBadge = (item: RecipePreviewItemDto) => {
    if (item.hasExistingActiveRecipe) {
      return <Badge color="amber">Already Has Recipe</Badge>;
    }
    if (item.menuItemAlreadyExistsInDb && !item.hasExistingActiveRecipe) {
      return <Badge color="blue">Menu Item Exists</Badge>;
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
    <Flex direction="column" gap="2">
      {items.map((recipe) => (
        <RecipeAccordionItem
          key={recipe.menuItemName}
          recipe={recipe}
          isExpanded={expandedRecipes.has(recipe.menuItemName)}
          onToggleExpand={() => toggleExpanded(recipe.menuItemName)}
          onRemove={() => onRemove(recipe.menuItemName)}
          onUpdateName={onUpdateName}
          onUpdateItem={(itemIndex, patch) => onUpdateItem(recipe.menuItemName, itemIndex, patch)}
          getStatusBadge={getStatusBadge}
          formatCurrency={formatCurrency}
        />
      ))}
    </Flex>
  );
};

interface RecipeAccordionItemProps {
  recipe: RecipePreviewItemDto;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRemove: () => void;
  onUpdateName: (originalName: string, newName: string) => void;
  onUpdateItem: (itemIndex: number, patch: Partial<RecipeItemPreviewDto>) => void;
  getStatusBadge: (item: RecipePreviewItemDto) => React.ReactNode;
  formatCurrency: (value: number) => string;
}

const RecipeAccordionItem: React.FC<RecipeAccordionItemProps> = ({
  recipe,
  isExpanded,
  onToggleExpand,
  onRemove,
  onUpdateName,
  onUpdateItem,
  getStatusBadge,
  formatCurrency,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(recipe.menuItemName);
  return (
    <Box
      style={{
        border: "1px solid var(--gray-a6)",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      <Flex
        onClick={onToggleExpand}
        style={{
          backgroundColor: "var(--gray-a2)",
          padding: "1rem",
          cursor: "pointer",
          userSelect: "none",
        }}
        justify="between"
        align="center"
      >
        <Flex gap="3" align="center" style={{ flex: 1 }}>
          <Box>
            {isExpanded ? (
              <ChevronDownIcon width={20} height={20} />
            ) : (
              <ChevronRightIcon width={20} height={20} />
            )}
          </Box>
          <Flex direction="column" gap="1" style={{ flex: 1 }}>
            <Text weight="medium">{recipe.menuItemName}</Text>
            <Flex gap="2" align="center">
              <Text size="2" color="gray">
                {recipe.items.length} items
              </Text>
              {recipe.estimatedCostPerServing > 0 && (
                <Text size="2" color="gray">
                  Est. cost {formatCurrency(recipe.estimatedCostPerServing)}
                </Text>
              )}
            </Flex>
          </Flex>
          <Flex gap="2" align="center">
            <Box>{getStatusBadge(recipe)}</Box>
            {recipe.hasExistingVariants && (
              <Badge color="blue">{recipe.existingVariantCount} variants</Badge>
            )}
            {recipe.hasExistingAddOnGroups && (
              <Badge color="violet">{recipe.existingAddOnGroupCount} add-ons</Badge>
            )}
          </Flex>
        </Flex>
        <Flex align="center" gap="2">
          {!recipe.menuItemAlreadyExistsInDb && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setEditingName(true);
              }}
              variant="ghost"
              size="1"
              color="gray"
              title="Edit recipe name"
            >
              <Pencil1Icon width={16} height={16} />
            </IconButton>
          )}
          {!recipe.hasExistingActiveRecipe && !recipe.menuItemAlreadyExistsInDb && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              variant="ghost"
              size="1"
              color="gray"
              title="Remove recipe"
            >
              <Cross2Icon width={16} height={16} />
            </IconButton>
          )}
        </Flex>
      </Flex>

      {isExpanded && (
        <Box style={{ padding: "1rem", backgroundColor: "var(--gray-a1)" }}>
          {recipe.menuItemAlreadyExistsInDb && (recipe.hasExistingVariants || recipe.hasExistingAddOnGroups) && (
            <Callout.Root color="blue" mb="3">
              <Callout.Text>
                This product already has {recipe.hasExistingVariants ? `${recipe.existingVariantCount} variant${recipe.existingVariantCount !== 1 ? 's' : ''}` : ''}{recipe.hasExistingVariants && recipe.hasExistingAddOnGroups ? ' and ' : ''}{recipe.hasExistingAddOnGroups ? `${recipe.existingAddOnGroupCount} add-on group${recipe.existingAddOnGroupCount !== 1 ? 's' : ''}` : ''} configured. The recipe import will attach a new recipe to this existing product without modifying its variants or add-ons.
              </Callout.Text>
            </Callout.Root>
          )}

          {/* Financial Summary */}
          <Box mb="4" style={{ padding: "1rem", background: "var(--accent-a2)", borderRadius: "6px" }}>
            <Flex direction="column" gap="2">
              <Flex justify="between" align="center">
                <Text size="2" color="gray">Selling Price</Text>
                <Text weight="bold">{formatCurrency(recipe.sellingPrice)}</Text>
              </Flex>
              <Flex justify="between" align="center">
                <Text size="2" color="gray">Est. Cost/Serving</Text>
                <Text weight="bold">{formatCurrency(recipe.estimatedCostPerServing)}</Text>
              </Flex>
              <Flex justify="between" align="center">
                <Text size="2" color="gray">Gross Profit</Text>
                <Text weight="bold" color={recipe.grossProfitPerServing > 0 ? "green" : "red"}>
                  {formatCurrency(recipe.grossProfitPerServing)}
                </Text>
              </Flex>
              <Flex justify="between" align="center">
                <Text size="2" color="gray">Food Cost %</Text>
                <Text weight="bold" color={
                  recipe.foodCostPercent < 30 ? "green" : recipe.foodCostPercent < 40 ? "amber" : "red"
                }>
                  {recipe.foodCostPercent.toFixed(1)}%
                </Text>
              </Flex>
            </Flex>
          </Box>

          <RecipeItemsTable items={recipe.items} onUpdateItem={onUpdateItem} />
          {recipe.warnings.length > 0 && (
            <Callout.Root color="orange" mt="3">
              <Callout.Text weight="medium" mb="2">Warnings</Callout.Text>
              {recipe.warnings.map((warning, i) => (
                <Callout.Text key={i}>• {warning}</Callout.Text>
              ))}
            </Callout.Root>
          )}
        </Box>
      )}

      {editingName && (
        <EditRecipeNameDialog
          originalName={recipe.menuItemName}
          open={editingName}
          onOpenChange={setEditingName}
          onSave={(name) => {
            onUpdateName(recipe.menuItemName, name);
            setEditingName(false);
            setNewName(recipe.menuItemName);
          }}
        />
      )}
    </Box>
  );
};

interface RecipeItemsTableProps {
  items: RecipeItemPreviewDto[];
  onUpdateItem: (itemIndex: number, patch: Partial<RecipeItemPreviewDto>) => void;
}

const EditRecipeNameDialog: React.FC<{
  originalName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (newName: string) => void;
}> = ({ originalName, open, onOpenChange, onSave }) => {
  const [name, setName] = React.useState(originalName);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Title>Edit Recipe Name</Dialog.Title>
        <Flex direction="column" gap="4">
          <Box>
            <Text as="div" mb="2" size="2" weight="medium">
              Menu Item Name
            </Text>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            <Button onClick={() => onSave(name.trim())}>Save</Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

interface EditRecipeItemDialogProps {
  item: RecipeItemPreviewDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patch: Partial<RecipeItemPreviewDto>) => void;
}

const EditRecipeItemDialog: React.FC<EditRecipeItemDialogProps> = ({ item, open, onOpenChange, onSave }) => {
  const [quantityRequired, setQuantityRequired] = React.useState(item.quantityRequired.toString());
  const [unitName, setUnitName] = React.useState(item.unitName);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Title>Edit Recipe Item</Dialog.Title>
        <Flex direction="column" gap="4">
          <Box>
            <Text as="div" mb="2" size="2" weight="medium">
              Ingredient Name
            </Text>
            <Text size="2" color="gray" as="p">
              {item.ingredientName}
            </Text>
          </Box>

          <Box>
            <Text as="div" mb="2" size="2" weight="medium">
              Quantity Required
            </Text>
            <input
              type="number"
              step="0.01"
              value={quantityRequired}
              onChange={(e) => setQuantityRequired(e.target.value)}
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
            <Button
              onClick={() => {
                onSave({
                  quantityRequired: parseFloat(quantityRequired) || 0,
                  unitName: unitName.trim(),
                });
                onOpenChange(false);
              }}
            >
              Save
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

const RecipeItemsTable: React.FC<RecipeItemsTableProps> = ({ items, onUpdateItem }) => {
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const getItemStatusBadge = (item: RecipeItemPreviewDto) => {
    if (!item.ingredientFoundInSheet) {
      return <Badge color="red">Not Found in Sheet</Badge>;
    }
    if (!item.ingredientExistsInDb) {
      return <Badge color="blue">Will Create with Recipe</Badge>;
    }
    if (!item.unitExistsInDb) {
      return <Badge color="orange">Missing Unit</Badge>;
    }
    return <Badge color="green">Ready</Badge>;
  };

  return (
    <>
      <Box style={{ overflowX: "auto" }}>
        <Table.Root size="1" layout="auto">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Ingredient</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell align="right">Qty</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Unit</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items.map((item, i) => (
              <Table.Row key={i}>
                <Table.Cell>
                  <Flex direction="column" gap="1">
                    <Text size="2">{item.ingredientName}</Text>
                    {item.warnings.length > 0 && (
                      <Flex direction="column" gap="1">
                        {item.warnings.map((warning, j) => (
                          <Text key={j} as="p" size="1" color="orange">
                            ⚠ {warning}
                          </Text>
                        ))}
                      </Flex>
                    )}
                  </Flex>
                </Table.Cell>
                <Table.Cell align="right">
                  <Text size="2">{item.quantityRequired.toFixed(2)}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="2">{item.unitName || "—"}</Text>
                </Table.Cell>
                <Table.Cell>{getItemStatusBadge(item)}</Table.Cell>
                <Table.Cell>
                  <IconButton
                    onClick={() => setEditingIndex(i)}
                    variant="ghost"
                    size="1"
                    color="gray"
                    title="Edit recipe item"
                  >
                    <Pencil1Icon width={16} height={16} />
                  </IconButton>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {editingIndex !== null && (
        <EditRecipeItemDialog
          item={items[editingIndex]}
          open={editingIndex !== null}
          onOpenChange={(open) => !open && setEditingIndex(null)}
          onSave={(patch) => {
            onUpdateItem(editingIndex, patch);
            setEditingIndex(null);
          }}
        />
      )}
    </>
  );
};
