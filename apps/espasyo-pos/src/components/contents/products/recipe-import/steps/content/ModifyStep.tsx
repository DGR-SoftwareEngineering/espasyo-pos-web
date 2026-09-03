import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  Badge,
  Separator,
  IconButton,
} from "core-lib/components/radix/proxies";
import {
  Card,
  Button,
  Tabs,
  Callout,
  ScrollArea,
} from "@radix-ui/themes";;
import {
  CheckCircledIcon,
  ExclamationTriangleIcon,
  CrossCircledIcon,
  TrashIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useApi } from "core-lib/core/hooks";
import { TextField } from "core-lib/components/radix/form/TextField";
import { SelectField } from "core-lib/components/radix/form/SelectField";
import { useRecipeImportContext } from "../../RecipeImportContext";
import { StepShell } from "./StepShell";
import { StepNavigation } from "./StepNavigation";
import { RecipeImportStepProps } from "../RecipeImportSteps";
import {
  modifyStandaloneSchema,
  modifyVariantGroupSchema,
  ModifyStandaloneFormValues,
  ModifyVariantGroupFormValues,
  ModifyIngredientFormValues,
} from "../../validation";
import type { RecipePreviewItemDto, RecipeItemPreviewDto } from "core-lib/api/commons/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type SidebarItem =
  | { type: "standalone"; recipe: RecipePreviewItemDto }
  | { type: "variantGroup"; groupKey: string; displayName: string; variants: RecipePreviewItemDto[] };

function toGroupKey(name: string) {
  return name.toLowerCase().trim();
}

// ─── Completion helpers (reflect updated required fields) ─────────────────────

function isIngredientRowComplete(item: RecipeItemPreviewDto): boolean {
  if (!item.ingredientExistsInDb) {
    return !!(item.ingredientCategoryID && item.purchaseUnitID && item.stockUnitID);
  }
  return true;
}

function isStandaloneComplete(recipe: RecipePreviewItemDto): boolean {
  if (!recipe.menuItemAlreadyExistsInDb && !recipe.categoryID) return false;
  return !recipe.items.some((i) => !isIngredientRowComplete(i));
}

function isVariantGroupComplete(variants: RecipePreviewItemDto[]): boolean {
  const first = variants[0];
  if (!first) return false;
  if (!first.menuItemAlreadyExistsInDb && !first.categoryID) return false;
  return !variants.some((v) => v.items.some((i) => !isIngredientRowComplete(i)));
}

function variantSavedCount(variants: RecipePreviewItemDto[]): number {
  return variants.filter((v) => !!v.categoryID).length;
}

function getStatusIcon(complete: boolean, partial: boolean) {
  if (complete) return <CheckCircledIcon color="var(--green-9)" />;
  if (partial) return <ExclamationTriangleIcon color="var(--amber-9)" />;
  return <CrossCircledIcon color="var(--red-9)" />;
}

// ─── Row completion (live, from watched form values) ─────────────────────────

function computeRowComplete(data: any, isNew: boolean): boolean {
  if (!data) return false;
  const qty = Number(data.quantityRequired);
  if (!qty || qty <= 0) return false;
  if (isNew) {
    if (!data.ingredientCategoryID) return false;
    if (!data.purchaseUnitID) return false;
    if (!data.stockUnitID) return false;
  }
  return true;
}

// ─── Merge helper ─────────────────────────────────────────────────────────────

function mergeIngredientBack(
  original: RecipeItemPreviewDto | undefined,
  form: ModifyIngredientFormValues
): RecipeItemPreviewDto {
  return {
    ingredientName: form.ingredientName,
    quantityRequired: form.quantityRequired,
    unitName: form.unitName ?? original?.unitName ?? "",
    ingredientExistsInDb: form.ingredientExistsInDb,
    unitExistsInDb: original?.unitExistsInDb ?? true,
    warnings: original?.warnings ?? [],
    ingredientCategoryID: form.ingredientCategoryID ?? original?.ingredientCategoryID,
    packagePrice: form.packagePrice ?? original?.packagePrice ?? 0,
    qtyPerPack: form.qtyPerPack ?? original?.qtyPerPack ?? 1,
    ingredientDescription: form.ingredientDescription ?? undefined,
    purchaseUnitID: form.purchaseUnitID ?? undefined,
    stockUnitID: form.stockUnitID ?? form.purchaseUnitID ?? undefined,
  };
}

const FieldHint: React.FC<{ text: string }> = ({ text }) => (
  <Text as="p" size="1" color="gray" mt="1" style={{ lineHeight: 1.5 }}>
    {text}
  </Text>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const ModifyStep: React.FC<RecipeImportStepProps> = ({ next, previous }) => {
  const { previewData, selectedRecipes, updateRecipe } = useRecipeImportContext();

  const { result: menuCatResult, loading: menuCatLoading } = useApi(
    (api) => api.commons.productCategoryList(), []
  );
  const { result: ingCatResult, loading: ingCatLoading } = useApi(
    (api) => api.commons.ingredientCategoryList(), []
  );
  const { result: unitsResult, loading: unitsLoading } = useApi(
    (api) => api.commons.unitList(), []
  );

  const menuCategories = menuCatResult?.data?.response ?? [];
  const ingredientCategories = ingCatResult?.data?.response ?? [];
  const units = unitsResult?.data?.response ?? [];

  const menuCatOptions = useMemo(
    () => menuCategories.map((c) => ({ value: c.productCategoryID, label: c.name })),
    [menuCategories]
  );
  const ingCatOptions = useMemo(
    () => ingredientCategories.map((c) => ({ value: c.ingredientCategoryID, label: c.name })),
    [ingredientCategories]
  );
  const unitOptions = useMemo(
    () => units.map((u) => ({ value: u.unitID, label: u.name })),
    [units]
  );

  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const selectedRecipesArray = useMemo(
    () => previewData?.recipes.filter((r) => selectedRecipes.has(r.menuItemName)) ?? [],
    [previewData, selectedRecipes]
  );

  const variantGroupMap = useMemo(() => {
    const map = new Map<string, { displayName: string; variants: RecipePreviewItemDto[] }>();
    for (const r of selectedRecipesArray) {
      if (r.variantGroup) {
        const key = toGroupKey(r.variantGroup);
        if (!map.has(key)) map.set(key, { displayName: r.variantGroup, variants: [] });
        map.get(key)!.variants.push(r);
      }
    }
    return map;
  }, [selectedRecipesArray]);

  const sidebarItems = useMemo<SidebarItem[]>(() => {
    const items: SidebarItem[] = [];
    variantGroupMap.forEach(({ displayName, variants }, key) => {
      items.push({ type: "variantGroup", groupKey: key, displayName, variants });
    });
    selectedRecipesArray
      .filter((r) => !r.variantGroup)
      .forEach((r) => items.push({ type: "standalone", recipe: r }));
    return items;
  }, [variantGroupMap, selectedRecipesArray]);

  const completedCount = sidebarItems.filter((item) =>
    item.type === "standalone"
      ? isStandaloneComplete(item.recipe)
      : isVariantGroupComplete(item.variants)
  ).length;

  const canContinue = completedCount === sidebarItems.length && sidebarItems.length > 0;

  const effectiveKey = selectedKey ?? (
    sidebarItems[0]?.type === "standalone"
      ? sidebarItems[0].recipe.menuItemName
      : sidebarItems[0]?.type === "variantGroup"
      ? sidebarItems[0].groupKey
      : ""
  );

  const selectedItem =
    sidebarItems.find((item) =>
      item.type === "standalone"
        ? item.recipe.menuItemName === effectiveKey
        : item.groupKey === effectiveKey
    ) ?? sidebarItems[0] ?? null;

  if (!previewData || sidebarItems.length === 0) return null;

  return (
    <StepShell
      icon={<Pencil1Icon width={24} height={24} />}
      title="Edit Product Details"
      subtitle="Fill in prices, categories, and ingredient details for each item"
      actions={
        <StepNavigation
          onBack={previous}
          onContinue={next}
          continueText={
            canContinue ? "Continue to Summary →" : `${completedCount} of ${sidebarItems.length} ready`
          }
          continueDisabled={!canContinue}
        />
      }
    >
      <Flex
        gap="0"
        style={{
          minHeight: 620,
          border: "1px solid var(--gray-a4)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {/* ── Left Sidebar ───────────────────────────────────────── */}
        <Box
          style={{
            width: 240,
            flexShrink: 0,
            borderRight: "1px solid var(--gray-a4)",
            background: "var(--gray-a1)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box px="3" py="3" style={{ borderBottom: "1px solid var(--gray-a4)" }}>
            <Flex justify="between" align="center">
              <Text size="2" weight="medium">Products</Text>
              <Badge color={canContinue ? "green" : "amber"} size="1">
                {completedCount}/{sidebarItems.length} ready
              </Badge>
            </Flex>
          </Box>

          <Box style={{ overflowY: "auto", flex: 1 }}>
            {sidebarItems.map((item) => {
              const key =
                item.type === "standalone" ? item.recipe.menuItemName : item.groupKey;
              const isActive = effectiveKey === key;
              const complete =
                item.type === "standalone"
                  ? isStandaloneComplete(item.recipe)
                  : isVariantGroupComplete(item.variants);
              const hasAnyFill =
                item.type === "standalone"
                  ? !!item.recipe.categoryID
                  : !!item.variants[0]?.categoryID;
              const savedCount =
                item.type === "variantGroup" ? variantSavedCount(item.variants) : null;

              return (
                <Box
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  px="3"
                  py="2"
                  style={{
                    cursor: "pointer",
                    borderBottom: "1px solid var(--gray-a3)",
                    background: isActive ? "var(--accent-a3)" : "transparent",
                    borderLeft: isActive ? "3px solid var(--accent-9)" : "3px solid transparent",
                  }}
                >
                  <Flex align="start" gap="2">
                    <Box style={{ flexShrink: 0, marginTop: 2 }}>
                      {getStatusIcon(complete, hasAnyFill && !complete)}
                    </Box>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        size="2"
                        weight={isActive ? "bold" : "medium"}
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "block",
                        }}
                      >
                        {item.type === "standalone" ? item.recipe.menuItemName : item.displayName}
                      </Text>
                      <Text size="1" color={complete ? "green" : "gray"}>
                        {item.type === "variantGroup"
                          ? savedCount !== null && savedCount > 0
                            ? `${savedCount}/${item.variants.length} sizes saved`
                            : `${item.variants.length} sizes`
                          : `${item.recipe.items.length} ingredient${item.recipe.items.length !== 1 ? "s" : ""}`}
                      </Text>
                    </Box>
                    {item.type === "variantGroup" && (
                      <Badge color="blue" variant="soft" size="1">Variants</Badge>
                    )}
                  </Flex>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ── Right Panel ────────────────────────────────────────── */}
        <Box
          style={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {selectedItem?.type === "standalone" && (
            <StandaloneForm
              key={selectedItem.recipe.menuItemName}
              recipe={selectedItem.recipe}
              menuCatOptions={menuCatOptions}
              ingCatOptions={ingCatOptions}
              unitOptions={unitOptions}
              menuCatLoading={menuCatLoading}
              ingCatLoading={ingCatLoading}
              unitsLoading={unitsLoading}
              units={units}
              onSave={(values) => {
                updateRecipe(selectedItem.recipe.menuItemName, {
                  menuItemName: values.menuItemName,
                  description: values.description ?? undefined,
                  categoryID: values.categoryID,
                  sellingPrice: values.sellingPrice,
                  materialCost: values.materialCost ?? undefined,
                  items: (values.items ?? []).map((v, i) =>
                    mergeIngredientBack(selectedItem.recipe.items[i], v)
                  ),
                });
              }}
            />
          )}
          {selectedItem?.type === "variantGroup" && (
            <VariantGroupForm
              key={selectedItem.groupKey}
              displayName={selectedItem.displayName}
              variants={selectedItem.variants}
              menuCatOptions={menuCatOptions}
              ingCatOptions={ingCatOptions}
              unitOptions={unitOptions}
              menuCatLoading={menuCatLoading}
              ingCatLoading={ingCatLoading}
              unitsLoading={unitsLoading}
              units={units}
              onSave={(values) => {
                values.variants.forEach((vf) => {
                  const original = selectedItem.variants.find(
                    (v) => v.menuItemName === vf.menuItemName
                  );
                  if (!original) return;
                  updateRecipe(vf.menuItemName, {
                    description: values.description ?? undefined,
                    categoryID: values.categoryID,
                    materialCost: values.materialCost ?? undefined,
                    sellingPrice: vf.sellingPrice,
                    items: (vf.items ?? []).map((iv, i) =>
                      mergeIngredientBack(original.items[i], iv)
                    ),
                  });
                });
              }}
            />
          )}
          {!selectedItem && (
            <Flex align="center" justify="center" style={{ height: 400 }}>
              <Text color="gray" size="2">Select a product from the left to begin editing</Text>
            </Flex>
          )}
        </Box>
      </Flex>
    </StepShell>
  );
};

// ─── defaultValues helper ─────────────────────────────────────────────────────

function toIngredientDefault(item: RecipeItemPreviewDto, units: any[]): ModifyIngredientFormValues {
  const matchedUnit = units.find(
    (u) => u.name.toLowerCase() === item.unitName?.toLowerCase()
  );
  return {
    ingredientName: item.ingredientName,
    ingredientDescription: item.ingredientDescription ?? "",
    quantityRequired: item.quantityRequired,
    ingredientExistsInDb: item.ingredientExistsInDb,
    ingredientCategoryID: item.ingredientCategoryID ?? "",
    packagePrice: item.packagePrice ?? 0,
    qtyPerPack: item.qtyPerPack ?? 1,
    purchaseUnitID: item.purchaseUnitID ?? matchedUnit?.unitID ?? "",
    stockUnitID: item.stockUnitID ?? matchedUnit?.unitID ?? "",
    unitName: item.unitName ?? "",
  };
}

// ─── Ingredient Row ───────────────────────────────────────────────────────────

interface IngredientRowProps {
  index: number;
  fieldPrefix: string;
  control: any;
  errors: any;
  isNew: boolean;
  ingredientName: string;
  quantityRequired: number;
  unitName: string;
  ingCatOptions: { value: string; label: string }[];
  unitOptions: { value: string; label: string }[];
  ingCatLoading: boolean;
  unitsLoading: boolean;
  onRemove: () => void;
}

const IngredientRow: React.FC<IngredientRowProps> = ({
  index,
  fieldPrefix,
  control,
  errors,
  isNew,
  ingredientName,
  quantityRequired,
  unitName,
  ingCatOptions,
  unitOptions,
  ingCatLoading,
  unitsLoading,
  onRemove,
}) => {
  const [expanded, setExpanded] = useState(true);

  // Narrow watch: only this row's data, not the entire array
  const rowData = useWatch({ control, name: `${fieldPrefix}.${index}` as any });
  const isRowComplete = computeRowComplete(rowData, isNew);

  const rowErrors = errors?.[index] ?? {};
  const hasError = Object.keys(rowErrors).length > 0;

  const borderColor = isRowComplete
    ? "var(--green-a6)"
    : hasError
    ? "var(--red-a6)"
    : isNew
    ? "var(--blue-a5)"
    : "var(--gray-a4)";

  const headerBg = isRowComplete
    ? "var(--green-a2)"
    : hasError
    ? "var(--red-a2)"
    : isNew
    ? "var(--blue-a2)"
    : "var(--gray-a2)";

  const badgeColor: "green" | "red" | "blue" | "gray" = isRowComplete
    ? "green"
    : hasError
    ? "red"
    : isNew
    ? "blue"
    : "gray";

  const badgeLabel = isRowComplete
    ? "Complete ✓"
    : hasError
    ? "Needs attention"
    : isNew
    ? "New"
    : "Existing";

  return (
    <Box
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: 6,
        overflow: "hidden",
        marginBottom: "0.5rem",
        transition: "border-color 0.2s",
      }}
    >
      <Flex
        align="center"
        gap="2"
        px="3"
        py="2"
        style={{
          background: headerBg,
          cursor: "pointer",
          userSelect: "none",
          transition: "background 0.2s",
        }}
        onClick={() => setExpanded((e) => !e)}
      >
        {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
        <Text size="2" weight="medium" style={{ flex: 1 }}>{ingredientName}</Text>
        {!expanded && (
          <>
            <Text size="1" color="gray" style={{ flexShrink: 0 }}>
              {quantityRequired} {unitName || "—"}
            </Text>
            {isRowComplete ? (
              <CheckCircledIcon color="var(--green-9)" width={14} />
            ) : hasError ? (
              <ExclamationTriangleIcon color="var(--red-9)" width={14} />
            ) : null}
          </>
        )}
        <Badge color={badgeColor} variant="soft" size="1">{badgeLabel}</Badge>
        <IconButton
          type="button"
          variant="ghost"
          size="1"
          color="red"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          title="Remove ingredient"
        >
          <TrashIcon width={14} />
        </IconButton>
      </Flex>

      {expanded && (
        <Box px="3" py="3" style={{ background: "var(--gray-a1)" }}>
          <Flex direction="column" gap="3">
            <Box>
              <TextField
                name={`${fieldPrefix}.${index}.ingredientName`}
                control={control}
                label="Ingredient Name"
                size="2"
                disabled={!isNew}
              />
              {isNew && <FieldHint text="You can rename this ingredient before it is created." />}
            </Box>

            <Box>
              <TextField
                name={`${fieldPrefix}.${index}.quantityRequired`}
                control={control}
                label="Qty Required in Recipe"
                type="number"
                size="2"
              />
              <FieldHint text="Auto-filled from Excel. How much goes into one serving." />
            </Box>

            {!isNew && (
              <Box>
                <SelectField
                  name={`${fieldPrefix}.${index}.purchaseUnitID`}
                  control={control}
                  label="Recipe Unit"
                  size="2"
                  isLoading={unitsLoading}
                  options={unitOptions}
                  placeholder="Select unit…"
                />
                <FieldHint text="Unit used in the recipe. Auto-matched from Excel if unit exists." />
              </Box>
            )}

            {isNew && (
              <>
                <Box>
                  <TextField
                    name={`${fieldPrefix}.${index}.ingredientDescription`}
                    control={control}
                    label="Description (optional)"
                    multiline
                    rows={2}
                    size="2"
                  />
                </Box>

                <Box>
                  <SelectField
                    name={`${fieldPrefix}.${index}.ingredientCategoryID`}
                    control={control}
                    label="Ingredient Category"
                    size="2"
                    isLoading={ingCatLoading}
                    options={ingCatOptions}
                    placeholder="Select category…"
                  />
                  <FieldHint text="Required. e.g. Dairy, Produce, Dry Goods. Used for stock reporting." />
                </Box>

                <Flex gap="3" wrap="wrap">
                  <Box style={{ flex: "1 1 150px" }}>
                    <TextField
                      name={`${fieldPrefix}.${index}.packagePrice`}
                      control={control}
                      label="Total Purchase Cost (₱)"
                      type="number"
                      size="2"
                    />
                    <FieldHint text="Auto-filled from Excel. Total cost of the whole package." />
                  </Box>
                  <Box style={{ flex: "1 1 130px" }}>
                    <TextField
                      name={`${fieldPrefix}.${index}.qtyPerPack`}
                      control={control}
                      label="Purchase Quantity"
                      type="number"
                      size="2"
                    />
                    <FieldHint text="Auto-filled. Units in one package (e.g. 1000 for 1 kg bag)." />
                  </Box>
                </Flex>

                <Flex gap="3" wrap="wrap">
                  <Box style={{ flex: "1 1 170px" }}>
                    <SelectField
                      name={`${fieldPrefix}.${index}.purchaseUnitID`}
                      control={control}
                      label="Purchase Unit"
                      size="2"
                      isLoading={unitsLoading}
                      options={unitOptions}
                      placeholder="Select purchase unit…"
                    />
                    <FieldHint text="Required. The unit you buy in (e.g. kg, L, bag)." />
                  </Box>
                  <Box style={{ flex: "1 1 170px" }}>
                    <SelectField
                      name={`${fieldPrefix}.${index}.stockUnitID`}
                      control={control}
                      label="Stock Unit"
                      size="2"
                      isLoading={unitsLoading}
                      options={unitOptions}
                      placeholder="Select stock unit…"
                    />
                    <FieldHint text="Required. The unit used in inventory tracking." />
                  </Box>
                </Flex>
              </>
            )}
          </Flex>
        </Box>
      )}
    </Box>
  );
};

// ─── Standalone Form ──────────────────────────────────────────────────────────

interface StandaloneFormProps {
  recipe: RecipePreviewItemDto;
  menuCatOptions: { value: string; label: string }[];
  ingCatOptions: { value: string; label: string }[];
  unitOptions: { value: string; label: string }[];
  menuCatLoading: boolean;
  ingCatLoading: boolean;
  unitsLoading: boolean;
  units: any[];
  onSave: (values: ModifyStandaloneFormValues) => void;
}

const StandaloneForm: React.FC<StandaloneFormProps> = ({
  recipe,
  menuCatOptions,
  ingCatOptions,
  unitOptions,
  menuCatLoading,
  ingCatLoading,
  unitsLoading,
  units,
  onSave,
}) => {
  // Persist saved state across sidebar navigation: start as "saved" if already complete in context
  const [saveState, setSaveState] = useState<"idle" | "saved">(
    isStandaloneComplete(recipe) ? "saved" : "idle"
  );

  const {
    control,
    handleSubmit,
    trigger,
    formState: { isValid, errors, isDirty },
  } = useForm<ModifyStandaloneFormValues>({
    resolver: yupResolver(modifyStandaloneSchema),
    mode: "all",
    defaultValues: {
      menuItemName: recipe.menuItemName,
      description: recipe.description ?? "",
      categoryID: recipe.categoryID ?? "",
      sellingPrice: recipe.sellingPrice ?? 0,
      materialCost: recipe.materialCost ?? undefined,
      items: recipe.items.map((item) => toIngredientDefault(item, units)),
    },
  });

  const { fields, remove, append } = useFieldArray({ control, name: "items" });
  const itemErrors = (errors.items ?? []) as any[];

  // Trigger validation on mount so red indicators appear immediately
  useEffect(() => { trigger(); }, []);

  // Reset saved state when user edits anything after saving
  useEffect(() => {
    if (saveState === "saved" && isDirty) setSaveState("idle");
  }, [isDirty, saveState]);

  return (
    <Box style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <ScrollArea style={{ flex: 1 }}>
        <Box px="4" py="3">
          <Card variant="surface" size="2" mb="4">
            <Heading size="3" mb="1">Menu Item Details</Heading>
            <Text size="2" color="gray" as="p" mb="3">
              Product image can be added after sync from the Product List.
            </Text>
            <Flex direction="column" gap="3">
              <TextField
                name="menuItemName"
                control={control}
                label="Product Name"
                size="3"
                disabled={recipe.menuItemAlreadyExistsInDb}
              />
              <TextField
                name="description"
                control={control}
                label="Description (optional)"
                multiline
                rows={2}
                size="2"
              />
              {!recipe.menuItemAlreadyExistsInDb && (
                <Box>
                  <SelectField
                    name="categoryID"
                    control={control}
                    label="Product Category"
                    size="3"
                    isLoading={menuCatLoading}
                    options={menuCatOptions}
                    placeholder="Select product category…"
                  />
                  <FieldHint text="Required. The category this menu item belongs to (e.g. Beverages, Food)." />
                </Box>
              )}
              <Box>
                <TextField
                  name="sellingPrice"
                  control={control}
                  label="Selling Price (₱)"
                  type="number"
                  size="3"
                />
                <FieldHint text="Price customers pay at the POS. Auto-filled from Excel." />
              </Box>
              <Box>
                <TextField
                  name="materialCost"
                  control={control}
                  label="Material Cost (₱) — optional"
                  type="number"
                  size="2"
                />
                <FieldHint text="Your cost to make one serving. Used for profit tracking only." />
              </Box>
            </Flex>
          </Card>

          <Card variant="surface" size="2">
            <Flex justify="between" align="center" mb="2">
              <Heading size="3">Recipe Ingredients</Heading>
              <Badge color="gray" variant="soft">
                {fields.length} item{fields.length !== 1 ? "s" : ""}
              </Badge>
            </Flex>
            <Callout.Root color="blue" variant="surface" size="1" mb="3">
              <Callout.Text size="1">
                <strong>Auto-filled from Excel:</strong> Qty, cost, and purchase quantity are pre-populated.
                For <strong>new ingredients</strong> (blue), fill Category, Purchase Unit, and Stock Unit.
                Each row turns green when complete.
              </Callout.Text>
            </Callout.Root>

            {fields.map((field, index) => (
              <IngredientRow
                key={field.id}
                index={index}
                fieldPrefix="items"
                control={control}
                errors={itemErrors}
                isNew={!field.ingredientExistsInDb}
                ingredientName={field.ingredientName}
                quantityRequired={(field as any).quantityRequired ?? 0}
                unitName={(field as any).unitName ?? ""}
                ingCatOptions={ingCatOptions}
                unitOptions={unitOptions}
                ingCatLoading={ingCatLoading}
                unitsLoading={unitsLoading}
                onRemove={() => remove(index)}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="2"
              mt="2"
              onClick={() =>
                append({
                  ingredientName: "",
                  ingredientDescription: "",
                  quantityRequired: 0,
                  ingredientExistsInDb: false,
                  ingredientCategoryID: "",
                  packagePrice: 0,
                  qtyPerPack: 1,
                  purchaseUnitID: "",
                  stockUnitID: "",
                  unitName: "",
                })
              }
            >
              + Add Ingredient
            </Button>
          </Card>
        </Box>
      </ScrollArea>

      <Box
        px="4"
        py="3"
        style={{
          borderTop: "1px solid var(--gray-a4)",
          background: "var(--color-background)",
          flexShrink: 0,
        }}
      >
        <Button
          type="button"
          size="2"
          color={saveState === "saved" ? "green" : isValid ? "green" : "gray"}
          variant={saveState === "saved" ? "outline" : isValid ? "solid" : "outline"}
          disabled={saveState !== "saved" && !isValid}
          style={{ width: "100%" }}
          onClick={saveState === "saved" ? undefined : handleSubmit((values) => {
            onSave(values);
            setSaveState("saved");
          })}
        >
          {saveState === "saved"
            ? "✓ Saved — edit a field to change"
            : isValid
            ? "✓ Save Product Details"
            : "Fill required fields to save"}
        </Button>
      </Box>
    </Box>
  );
};

// ─── Variant Group Form ───────────────────────────────────────────────────────

interface VariantGroupFormProps {
  displayName: string;
  variants: RecipePreviewItemDto[];
  menuCatOptions: { value: string; label: string }[];
  ingCatOptions: { value: string; label: string }[];
  unitOptions: { value: string; label: string }[];
  menuCatLoading: boolean;
  ingCatLoading: boolean;
  unitsLoading: boolean;
  units: any[];
  onSave: (values: ModifyVariantGroupFormValues) => void;
}

function isVariantTabComplete(variantValues: any): boolean {
  if (!variantValues) return false;
  const price = Number(variantValues.sellingPrice);
  if (isNaN(price) || price < 0) return false;
  const items: any[] = variantValues.items ?? [];
  return !items.some(
    (item) =>
      !item.ingredientExistsInDb &&
      (!item.ingredientCategoryID || !item.purchaseUnitID || !item.stockUnitID)
  );
}

const VariantGroupForm: React.FC<VariantGroupFormProps> = ({
  displayName,
  variants,
  menuCatOptions,
  ingCatOptions,
  unitOptions,
  menuCatLoading,
  ingCatLoading,
  unitsLoading,
  units,
  onSave,
}) => {
  const firstVariant = variants[0];
  // Persist saved state across sidebar navigation
  const [saveState, setSaveState] = useState<"idle" | "saved">(
    isVariantGroupComplete(variants) ? "saved" : "idle"
  );

  const {
    control,
    handleSubmit,
    trigger,
    formState: { isValid, errors, isDirty },
  } = useForm<ModifyVariantGroupFormValues>({
    resolver: yupResolver(modifyVariantGroupSchema),
    mode: "all",
    defaultValues: {
      productName: displayName,
      description: firstVariant?.description ?? "",
      categoryID: firstVariant?.categoryID ?? "",
      materialCost: firstVariant?.materialCost ?? undefined,
      variants: variants.map((v) => ({
        menuItemName: v.menuItemName,
        variantSize: v.variantSize ?? v.menuItemName,
        sellingPrice: v.sellingPrice ?? 0,
        items: v.items.map((item) => toIngredientDefault(item, units)),
      })),
    },
  });

  // Trigger validation on mount so red indicators appear immediately on all fields
  useEffect(() => { trigger(); }, []);

  // Reset saved state when user edits anything after saving
  useEffect(() => {
    if (saveState === "saved" && isDirty) setSaveState("idle");
  }, [isDirty, saveState]);

  // Watch all variant values for real-time tab completion badges
  const watchedVariants = useWatch({ control, name: "variants" });

  // Track which tab is visible (CSS show/hide — all tabs stay mounted)
  const [activeTabKey, setActiveTabKey] = useState(
    variants[0]?.variantSize ?? variants[0]?.menuItemName ?? ""
  );

  return (
    <Box style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <ScrollArea style={{ flex: 1 }}>
        <Box px="4" py="3">
          {/* Shared product details */}
          <Card variant="surface" size="2" mb="4">
            <Heading size="3" mb="1">Product Details — Shared Across All Sizes</Heading>
            <Text size="2" color="gray" as="p" mb="3">
              Name, category, and description apply to all variants. Selling price is set per size below.
            </Text>
            <Flex direction="column" gap="3">
              <TextField
                name="productName"
                control={control}
                label="Product Name"
                size="3"
                disabled={firstVariant?.menuItemAlreadyExistsInDb}
              />
              <TextField
                name="description"
                control={control}
                label="Description (optional)"
                multiline
                rows={2}
                size="2"
              />
              {!firstVariant?.menuItemAlreadyExistsInDb && (
                <Box>
                  <SelectField
                    name="categoryID"
                    control={control}
                    label="Product Category"
                    size="3"
                    isLoading={menuCatLoading}
                    options={menuCatOptions}
                    placeholder="Select product category…"
                  />
                  <FieldHint text="Required. Applies to all size variants automatically." />
                </Box>
              )}
              <Box>
                <TextField
                  name="materialCost"
                  control={control}
                  label="Material Cost (₱) — optional"
                  type="number"
                  size="2"
                />
                <FieldHint text="Average cost to make one serving. Used for profit tracking." />
              </Box>
            </Flex>
          </Card>

          {/* Per-variant tabs — CSS show/hide keeps ALL fields mounted */}
          <Card variant="surface" size="2">
            <Heading size="3" mb="1">Size Variants</Heading>
            <Text size="2" color="gray" as="p" mb="3">
              Set selling price and ingredient details for each size.
              A green check appears when a tab is complete.
            </Text>

            {/* Tab triggers — using Radix for visual styling */}
            <Tabs.Root value={activeTabKey} onValueChange={setActiveTabKey}>
              <Tabs.List>
                {variants.map((v, variantIndex) => {
                  const tabComplete = isVariantTabComplete(watchedVariants?.[variantIndex]);
                  const tabKey = v.variantSize ?? v.menuItemName;
                  return (
                    <Tabs.Trigger key={v.menuItemName} value={tabKey}>
                      <Flex align="center" gap="1">
                        {tabKey}
                        {tabComplete ? (
                          <CheckCircledIcon color="var(--green-9)" width={13} />
                        ) : (
                          <ExclamationTriangleIcon color="var(--amber-9)" width={13} />
                        )}
                      </Flex>
                    </Tabs.Trigger>
                  );
                })}
              </Tabs.List>
            </Tabs.Root>

            {/* Tab content — CSS display toggle keeps all mounted, fields always registered */}
            {variants.map((v, variantIndex) => {
              const tabKey = v.variantSize ?? v.menuItemName;
              const variantItemErrors =
                ((errors.variants as any)?.[variantIndex]?.items ?? []) as any[];

              return (
                <Box
                  key={v.menuItemName}
                  style={{ display: activeTabKey === tabKey ? "block" : "none" }}
                >
                  <Box pt="3">
                    <Box mb="3" style={{ maxWidth: 220 }}>
                      <TextField
                        name={`variants.${variantIndex}.sellingPrice`}
                        control={control}
                        label="Selling Price (₱)"
                        type="number"
                        size="3"
                      />
                      <FieldHint text="Price customers pay for this size at the POS." />
                    </Box>

                    <Separator mb="3" />

                    <Text size="2" weight="medium" as="div" mb="1">Recipe Ingredients</Text>
                    <Callout.Root color="blue" variant="surface" size="1" mb="3">
                      <Callout.Text size="1">
                        <strong>Auto-filled from Excel.</strong> For{" "}
                        <strong>new ingredients</strong>, fill Category, Purchase Unit, and Stock Unit.
                        Rows turn green when complete.
                      </Callout.Text>
                    </Callout.Root>

                    <VariantIngredientList
                      variantIndex={variantIndex}
                      control={control}
                      errors={variantItemErrors}
                      ingCatOptions={ingCatOptions}
                      unitOptions={unitOptions}
                      ingCatLoading={ingCatLoading}
                      unitsLoading={unitsLoading}
                    />
                  </Box>
                </Box>
              );
            })}
          </Card>
        </Box>
      </ScrollArea>

      <Box
        px="4"
        py="3"
        style={{
          borderTop: "1px solid var(--gray-a4)",
          background: "var(--color-background)",
          flexShrink: 0,
        }}
      >
        <Button
          type="button"
          size="2"
          color={saveState === "saved" ? "green" : isValid ? "green" : "gray"}
          variant={saveState === "saved" ? "outline" : isValid ? "solid" : "outline"}
          disabled={saveState !== "saved" && !isValid}
          style={{ width: "100%" }}
          onClick={saveState === "saved" ? undefined : handleSubmit((values) => {
            onSave(values);
            setSaveState("saved");
          })}
        >
          {saveState === "saved"
            ? "✓ Saved — edit a field to change"
            : isValid
            ? "✓ Save All Variant Details"
            : "Fill required fields to save"}
        </Button>
      </Box>
    </Box>
  );
};

// ─── Variant Ingredient List ──────────────────────────────────────────────────

interface VariantIngredientListProps {
  variantIndex: number;
  control: any;
  errors: any[];
  ingCatOptions: { value: string; label: string }[];
  unitOptions: { value: string; label: string }[];
  ingCatLoading: boolean;
  unitsLoading: boolean;
}

const VariantIngredientList: React.FC<VariantIngredientListProps> = ({
  variantIndex,
  control,
  errors,
  ingCatOptions,
  unitOptions,
  ingCatLoading,
  unitsLoading,
}) => {
  const { fields, remove, append } = useFieldArray({
    control,
    name: `variants.${variantIndex}.items`,
  });

  return (
    <Box>
      {fields.map((field: any, index: number) => (
        <IngredientRow
          key={field.id}
          index={index}
          fieldPrefix={`variants.${variantIndex}.items`}
          control={control}
          errors={errors}
          isNew={!field.ingredientExistsInDb}
          ingredientName={field.ingredientName}
          quantityRequired={field.quantityRequired ?? 0}
          unitName={field.unitName ?? ""}
          ingCatOptions={ingCatOptions}
          unitOptions={unitOptions}
          ingCatLoading={ingCatLoading}
          unitsLoading={unitsLoading}
          onRemove={() => remove(index)}
        />
      ))}
      <Button
        type="button"
        variant="outline"
        size="2"
        mt="2"
        onClick={() =>
          append({
            ingredientName: "",
            ingredientDescription: "",
            quantityRequired: 0,
            ingredientExistsInDb: false,
            ingredientCategoryID: "",
            packagePrice: 0,
            qtyPerPack: 1,
            purchaseUnitID: "",
            stockUnitID: "",
            unitName: "",
          })
        }
      >
        + Add Ingredient
      </Button>
    </Box>
  );
};
