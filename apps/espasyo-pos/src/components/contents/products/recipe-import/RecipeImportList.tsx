import React, { useState } from "react";
import {
  Badge,
  IconButton,
  Text,
  Flex,
  Box,
  Table,
  Dialog,
  Button,
  Callout,
  Heading,
  Separator,
  ScrollArea,
} from "@radix-ui/themes";
import {
  Cross2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  Pencil1Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import {
  RecipePreviewItemDto,
  RecipeItemPreviewDto,
} from "core-lib/api/commons/types";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  importRecipeEditSchema,
  ImportRecipeEditFormValues,
  importRecipeItemEditSchema,
  ImportRecipeItemEditFormValues,
} from "./validation";
import { TextField } from "core-lib/components/radix/form/TextField";
import { SelectField } from "core-lib/components/radix/form/SelectField";
import { useApi, useResolution } from "core-lib/core/hooks";
import { mobileDialogStyle, mobileContentStyle, mobileFooterStyle } from "core-lib/components/radix/dialog/mobileFullScreen";

interface RecipeImportListProps {
  items: RecipePreviewItemDto[];
  onRemove: (name: string) => void;
  onUpdateRecipe: (menuItemName: string, patch: Partial<RecipePreviewItemDto>) => void;
}

export const RecipeImportList: React.FC<RecipeImportListProps> = ({
  items,
  onRemove,
  onUpdateRecipe,
}) => {
  const [expandedRecipes, setExpandedRecipes] = useState<Set<string>>(new Set());

  const toggleExpanded = (name: string) => {
    const newExpanded = new Set(expandedRecipes);
    if (newExpanded.has(name)) newExpanded.delete(name);
    else newExpanded.add(name);
    setExpandedRecipes(newExpanded);
  };

  const getStatusBadge = (item: RecipePreviewItemDto) => {
    if (item.hasExistingActiveRecipe) return <Badge color="amber">Already Has Recipe</Badge>;
    if (item.menuItemAlreadyExistsInDb && !item.hasExistingActiveRecipe)
      return <Badge color="blue">Menu Item Exists</Badge>;
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
    <Flex direction="column" gap="2">
      {items.map((recipe) => (
        <RecipeAccordionItem
          key={recipe.menuItemName}
          recipe={recipe}
          isExpanded={expandedRecipes.has(recipe.menuItemName)}
          onToggleExpand={() => toggleExpanded(recipe.menuItemName)}
          onRemove={() => onRemove(recipe.menuItemName)}
          onUpdateRecipe={(patch) => onUpdateRecipe(recipe.menuItemName, patch)}
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
  onUpdateRecipe: (patch: Partial<RecipePreviewItemDto>) => void;
  getStatusBadge: (item: RecipePreviewItemDto) => React.ReactNode;
  formatCurrency: (value: number) => string;
}

const RecipeAccordionItem: React.FC<RecipeAccordionItemProps> = ({
  recipe,
  isExpanded,
  onToggleExpand,
  onRemove,
  onUpdateRecipe,
  getStatusBadge,
  formatCurrency,
}) => {
  const [editOpen, setEditOpen] = useState(false);

  const newIngredientCount = recipe.items.filter((i) => !i.ingredientExistsInDb).length;
  const missingIngredientCategories = recipe.items.filter(
    (i) => !i.ingredientExistsInDb && !i.ingredientCategoryID
  ).length;

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
                {recipe.items.length} ingredient{recipe.items.length !== 1 ? "s" : ""}
              </Text>
              {newIngredientCount > 0 && (
                <Text size="2" color="blue">
                  · {newIngredientCount} will be created
                </Text>
              )}
            </Flex>
          </Flex>
          <Flex gap="2" align="center" wrap="wrap">
            {!recipe.menuItemAlreadyExistsInDb && !recipe.categoryID && (
              <Badge color="red">No category</Badge>
            )}
            {missingIngredientCategories > 0 && (
              <Badge color="orange">{missingIngredientCategories} ingredient{missingIngredientCategories !== 1 ? "s" : ""} need category</Badge>
            )}
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
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setEditOpen(true);
            }}
            variant="ghost"
            size="1"
            color="gray"
            title="Edit recipe"
          >
            <Pencil1Icon width={16} height={16} />
          </IconButton>
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
          {recipe.menuItemAlreadyExistsInDb &&
            (recipe.hasExistingVariants || recipe.hasExistingAddOnGroups) && (
              <Callout.Root color="blue" mb="3">
                <Callout.Text>
                  This product already has{" "}
                  {recipe.hasExistingVariants
                    ? `${recipe.existingVariantCount} variant${recipe.existingVariantCount !== 1 ? "s" : ""}`
                    : ""}
                  {recipe.hasExistingVariants && recipe.hasExistingAddOnGroups ? " and " : ""}
                  {recipe.hasExistingAddOnGroups
                    ? `${recipe.existingAddOnGroupCount} add-on group${recipe.existingAddOnGroupCount !== 1 ? "s" : ""}`
                    : ""}{" "}
                  configured. The recipe import will attach a new recipe without modifying
                  its variants or add-ons.
                </Callout.Text>
              </Callout.Root>
            )}

          <IngredientSummaryTable items={recipe.items} formatCurrency={formatCurrency} />

          {recipe.warnings.length > 0 && (
            <Callout.Root color="orange" mt="3">
              <Callout.Text weight="medium" mb="2">
                Warnings
              </Callout.Text>
              {recipe.warnings.map((warning, i) => (
                <Callout.Text key={i}>• {warning}</Callout.Text>
              ))}
            </Callout.Root>
          )}
        </Box>
      )}

      <ImportRecipeEditDialog
        recipe={recipe}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={(patch) => {
          onUpdateRecipe(patch);
          setEditOpen(false);
        }}
      />
    </Box>
  );
};

// Read-only summary table shown in the accordion body
const IngredientSummaryTable: React.FC<{
  items: RecipeItemPreviewDto[];
  formatCurrency: (v: number) => string;
}> = ({ items, formatCurrency }) => (
  <Box style={{ overflowX: "auto" }}>
    <Table.Root size="1" layout="auto">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Ingredient</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell align="right">Qty</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Unit</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {items.map((item, i) => (
          <Table.Row key={i}>
            <Table.Cell>
              <Flex direction="column" gap="1">
                <Text size="2">{item.ingredientName}</Text>
                {item.warnings.map((w, j) => (
                  <Text key={j} as="p" size="1" color="orange">
                    ⚠ {w}
                  </Text>
                ))}
              </Flex>
            </Table.Cell>
            <Table.Cell align="right">
              <Text size="2">{item.quantityRequired.toFixed(3)}</Text>
            </Table.Cell>
            <Table.Cell>
              <Text size="2">{item.unitName || "—"}</Text>
            </Table.Cell>
            <Table.Cell>
              {item.ingredientExistsInDb ? (
                <Badge color="gray">Already Exists</Badge>
              ) : item.ingredientCategoryID ? (
                <Badge color="green">Will Create</Badge>
              ) : (
                <Badge color="red">Needs Category</Badge>
              )}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  </Box>
);

// Combined edit dialog — menu item fields + all ingredient rows
const ImportRecipeEditDialog: React.FC<{
  recipe: RecipePreviewItemDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patch: Partial<RecipePreviewItemDto>) => void;
}> = ({ recipe, open, onOpenChange, onSave }) => {
  const { isSmallMobile } = useResolution();
  // Fetch all lookups locally so SelectFields show correct loading state
  const { result: menuCatResult, loading: menuCatLoading } = useApi(
    (api) => api.commons.productCategoryList(),
    []
  );
  const { result: ingCatResult, loading: ingCatLoading } = useApi(
    (api) => api.commons.ingredientCategoryList(),
    []
  );
  const { result: unitResult, loading: unitLoading } = useApi(
    (api) => api.commons.unitList(),
    []
  );

  const menuItemCategories = menuCatResult?.data?.response ?? [];
  const ingredientCategories = ingCatResult?.data?.response ?? [];
  const unitOptions = (unitResult?.data?.response ?? []).map((u) => ({
    value: u.name,
    label: u.name,
  }));
  const knownUnits = new Set(
    (unitResult?.data?.response ?? []).map((u) => u.name.toLowerCase())
  );

  const { control, handleSubmit } = useForm<ImportRecipeEditFormValues>({
    resolver: yupResolver(importRecipeEditSchema),
    defaultValues: {
      menuItemName: recipe.menuItemName,
      categoryID: recipe.categoryID ?? "",
      sellingPrice: recipe.sellingPrice,
      items: recipe.items.map((item) => ({
        ingredientName: item.ingredientName,
        quantityRequired: item.quantityRequired,
        unitName: item.unitName,
        ingredientExistsInDb: item.ingredientExistsInDb,
        ingredientCategoryID: item.ingredientCategoryID ?? "",
        packagePrice: item.packagePrice ?? 0,
        qtyPerPack: item.qtyPerPack ?? 1,
      })),
    },
  });

  const { fields, remove, append } = useFieldArray({ control, name: "items" });

  // --- Add-ingredient sub-form ---
  const [showAddPanel, setShowAddPanel] = useState(false);

  const addForm = useForm<ImportRecipeItemEditFormValues>({
    resolver: yupResolver(importRecipeItemEditSchema),
    defaultValues: {
      ingredientName: "",
      quantityRequired: 0,
      unitName: "",
      ingredientExistsInDb: false,
      ingredientCategoryID: "",
      packagePrice: 0,
      qtyPerPack: 1,
    },
  });

  const handleAddIngredient = addForm.handleSubmit((vals) => {
    append({
      ingredientName: vals.ingredientName,
      quantityRequired: vals.quantityRequired,
      unitName: vals.unitName,
      ingredientExistsInDb: false,
      ingredientCategoryID: vals.ingredientCategoryID ?? "",
      packagePrice: vals.packagePrice ?? 0,
      qtyPerPack: vals.qtyPerPack ?? 1,
    });
    addForm.reset({
      ingredientName: "",
      quantityRequired: 0,
      unitName: "",
      ingredientExistsInDb: false,
      ingredientCategoryID: "",
      packagePrice: 0,
      qtyPerPack: 1,
    });
    setShowAddPanel(false);
  });

  const onSubmit = (values: ImportRecipeEditFormValues) => {
    const originalByName = new Map(
      recipe.items.map((item) => [item.ingredientName, item])
    );

    const updatedItems: RecipeItemPreviewDto[] = values.items!.map((v) => {
      const original = originalByName.get(v.ingredientName);
      return {
        ingredientName: v.ingredientName,
        quantityRequired: v.quantityRequired,
        unitName: v.unitName,
        ingredientExistsInDb: v.ingredientExistsInDb,
        unitExistsInDb:
          original?.unitExistsInDb ?? knownUnits.has(v.unitName.toLowerCase()),
        ingredientCategoryID: v.ingredientExistsInDb
          ? undefined
          : v.ingredientCategoryID || undefined,
        packagePrice: v.ingredientExistsInDb ? 0 : (v.packagePrice ?? 0),
        qtyPerPack: v.ingredientExistsInDb ? 1 : (v.qtyPerPack ?? 1),
        warnings: original?.warnings ?? [],
      };
    });

    onSave({
      menuItemName: values.menuItemName,
      categoryID: values.categoryID,
      sellingPrice: values.sellingPrice,
      items: updatedItems,
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={isSmallMobile ? mobileDialogStyle : { maxWidth: 760, maxHeight: "85vh" }}>
        <Dialog.Title>Edit Recipe — {recipe.menuItemName}</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          Set the menu item details and ingredient information before importing.
        </Dialog.Description>

        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea style={isSmallMobile ? mobileContentStyle : { maxHeight: "calc(85vh - 180px)" }}>
            <Flex direction="column" gap="5" pr="2">
              {/* Section 1: Menu Item */}
              <Box>
                <Heading size="3" mb="3">
                  Menu Item
                </Heading>
                <Flex direction="column" gap="3">
                  <TextField
                    name="menuItemName"
                    control={control}
                    label="Name"
                    disabled={recipe.menuItemAlreadyExistsInDb}
                    size="3"
                  />
                  {!recipe.menuItemAlreadyExistsInDb && (
                    <SelectField
                      name="categoryID"
                      control={control}
                      label="Category"
                      size="3"
                      isLoading={menuCatLoading}
                      options={menuItemCategories.map((c) => ({
                        value: c.productCategoryID,
                        label: c.name,
                      }))}
                      placeholder="Select menu item category…"
                    />
                  )}
                  <TextField
                    name="sellingPrice"
                    control={control}
                    label="Selling Price (₱)"
                    type="number"
                    size="3"
                  />
                </Flex>
              </Box>

              <Separator />

              {/* Section 2: Ingredients */}
              <Box>
                <Flex justify="between" align="center" mb="1">
                  <Heading size="3">Ingredients</Heading>
                  <Badge color="gray" variant="soft">
                    {fields.length} item{fields.length !== 1 ? "s" : ""}
                  </Badge>
                </Flex>
                <Text size="2" color="gray" as="p" mb="3">
                  New ingredients need a category, purchase cost, and purchase
                  quantity. Existing ingredients only need qty and unit.
                </Text>

                <Flex direction="column" gap="4">
                  {fields.map((field, idx) => {
                    const isNew = !field.ingredientExistsInDb;

                    return (
                      <Box
                        key={field.id}
                        style={{
                          padding: "1rem",
                          border: `1px solid ${isNew ? "var(--blue-a6)" : "var(--gray-a5)"}`,
                          borderRadius: "6px",
                          background: isNew
                            ? "var(--blue-a2)"
                            : "var(--gray-a1)",
                        }}
                      >
                        <Flex justify="between" align="center" mb="3">
                          <Flex align="center" gap="2">
                            <Text weight="medium" size="2">
                              {field.ingredientName}
                            </Text>
                            {isNew ? (
                              <Badge color="blue" size="1">New</Badge>
                            ) : (
                              <Badge color="gray" size="1">Exists</Badge>
                            )}
                          </Flex>
                          <IconButton
                            type="button"
                            size="1"
                            variant="ghost"
                            color="red"
                            title="Remove ingredient"
                            onClick={() => remove(idx)}
                          >
                            <TrashIcon width={14} height={14} />
                          </IconButton>
                        </Flex>

                        {isNew ? (
                          /* New ingredient — mirrors ProductForm ingredient fields */
                          <Flex direction="column" gap="3">
                            <Flex gap="3" wrap="wrap">
                              <Box style={{ flex: "1 1 140px" }}>
                                <TextField
                                  name={`items.${idx}.packagePrice`}
                                  control={control}
                                  label="Total Purchase Cost (₱)"
                                  type="number"
                                  size="2"
                                />
                              </Box>
                              <Box style={{ flex: "1 1 120px" }}>
                                <TextField
                                  name={`items.${idx}.qtyPerPack`}
                                  control={control}
                                  label="Purchase Quantity"
                                  type="number"
                                  size="2"
                                />
                              </Box>
                              <Box style={{ flex: "1 1 160px" }}>
                                <SelectField
                                  name={`items.${idx}.unitName`}
                                  control={control}
                                  label="Unit"
                                  size="2"
                                  isLoading={unitLoading}
                                  options={unitOptions}
                                  placeholder="Select unit…"
                                />
                              </Box>
                            </Flex>
                            <Flex gap="3" wrap="wrap">
                              <Box style={{ flex: "2 1 200px" }}>
                                <SelectField
                                  name={`items.${idx}.ingredientCategoryID`}
                                  control={control}
                                  label="Ingredient Category"
                                  size="2"
                                  isLoading={ingCatLoading}
                                  options={ingredientCategories.map((c) => ({
                                    value: c.ingredientCategoryID,
                                    label: c.name,
                                  }))}
                                  placeholder="Select category…"
                                />
                              </Box>
                              <Box style={{ flex: "1 1 120px" }}>
                                <TextField
                                  name={`items.${idx}.quantityRequired`}
                                  control={control}
                                  label="Qty Required in Recipe"
                                  type="number"
                                  size="2"
                                />
                              </Box>
                            </Flex>
                          </Flex>
                        ) : (
                          /* Existing ingredient — qty + unit only */
                          <Flex gap="3" wrap="wrap">
                            <Box style={{ flex: "1 1 120px" }}>
                              <TextField
                                name={`items.${idx}.quantityRequired`}
                                control={control}
                                label="Qty Required"
                                type="number"
                                size="2"
                              />
                            </Box>
                            <Box style={{ flex: "1 1 120px" }}>
                              <TextField
                                name={`items.${idx}.unitName`}
                                control={control}
                                label="Unit"
                                size="2"
                              />
                            </Box>
                          </Flex>
                        )}
                      </Box>
                    );
                  })}

                  {/* Add Ingredient panel */}
                  {!showAddPanel ? (
                    <Box>
                      <Button
                        type="button"
                        variant="outline"
                        color="blue"
                        size="2"
                        onClick={() => setShowAddPanel(true)}
                      >
                        + Add Ingredient
                      </Button>
                    </Box>
                  ) : (
                    <Box
                      style={{
                        padding: "1rem",
                        border: "1px solid var(--blue-a7)",
                        borderRadius: "6px",
                        background: "var(--blue-a3)",
                      }}
                    >
                      <Flex justify="between" align="center" mb="3">
                        <Flex direction="column" gap="1">
                          <Text weight="medium" size="2">New Ingredient</Text>
                          <Text size="1" color="gray">
                            Unit must already exist in the system (Settings → Units).
                          </Text>
                        </Flex>
                        <IconButton
                          type="button"
                          variant="ghost"
                          size="1"
                          color="gray"
                          onClick={() => {
                            setShowAddPanel(false);
                            addForm.reset();
                          }}
                        >
                          <Cross2Icon width={14} height={14} />
                        </IconButton>
                      </Flex>

                      <Flex direction="column" gap="3">
                        {/* Row 1: Name + Category */}
                        <Flex gap="3" wrap="wrap">
                          <Box style={{ flex: "2 1 200px" }}>
                            <TextField
                              name="ingredientName"
                              control={addForm.control}
                              label="Ingredient Name"
                              size="2"
                            />
                          </Box>
                          <Box style={{ flex: "2 1 200px" }}>
                            <SelectField
                              name="ingredientCategoryID"
                              control={addForm.control}
                              label="Ingredient Category"
                              size="2"
                              isLoading={ingCatLoading}
                              options={ingredientCategories.map((c) => ({
                                value: c.ingredientCategoryID,
                                label: c.name,
                              }))}
                              placeholder="Select category…"
                            />
                          </Box>
                        </Flex>

                        {/* Row 2: Purchase Cost + Purchase Qty + Unit */}
                        <Flex gap="3" wrap="wrap">
                          <Box style={{ flex: "1 1 140px" }}>
                            <TextField
                              name="packagePrice"
                              control={addForm.control}
                              label="Total Purchase Cost (₱)"
                              type="number"
                              size="2"
                            />
                          </Box>
                          <Box style={{ flex: "1 1 120px" }}>
                            <TextField
                              name="qtyPerPack"
                              control={addForm.control}
                              label="Purchase Quantity"
                              type="number"
                              size="2"
                            />
                          </Box>
                          <Box style={{ flex: "1 1 160px" }}>
                            <SelectField
                              name="unitName"
                              control={addForm.control}
                              label="Unit"
                              size="2"
                              isLoading={unitLoading}
                              options={unitOptions}
                              placeholder="Select unit…"
                            />
                          </Box>
                        </Flex>

                        {/* Row 3: Qty in recipe */}
                        <Flex gap="3" wrap="wrap">
                          <Box style={{ flex: "1 1 140px" }}>
                            <TextField
                              name="quantityRequired"
                              control={addForm.control}
                              label="Qty Required in Recipe"
                              type="number"
                              size="2"
                            />
                          </Box>
                        </Flex>

                        <Flex justify="end" gap="2">
                          <Button
                            type="button"
                            variant="outline"
                            size="2"
                            onClick={() => {
                              setShowAddPanel(false);
                              addForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="2"
                            onClick={handleAddIngredient}
                          >
                            Add to List
                          </Button>
                        </Flex>
                      </Flex>
                    </Box>
                  )}
                </Flex>
              </Box>
            </Flex>
          </ScrollArea>

          <Flex gap="2" justify="end" mt="4" style={isSmallMobile ? mobileFooterStyle : undefined}>
            <Dialog.Close>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="submit">Save Changes</Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
};
