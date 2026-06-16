import React, { useState, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Card,
  Grid,
  Heading,
  Badge,
  Callout,
  Separator,
  Table,
} from "@radix-ui/themes";
import {
  TableIcon,
  CheckCircledIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import { AdminConfirmDialog } from "core-lib/components/radix/security";
import { useApi } from "core-lib/core/hooks";
import { useRecipeImportContext } from "../../RecipeImportContext";
import { StepShell } from "./StepShell";
import { StepNavigation } from "./StepNavigation";
import { RecipeImportStepProps } from "../RecipeImportSteps";
import type { RecipePreviewItemDto, RecipeItemPreviewDto } from "core-lib/api/commons/types";

interface SummaryStepProps extends RecipeImportStepProps {
  onSubmit: (args: { password: string; mpin: string }) => Promise<void>;
}

export const SummaryStep: React.FC<SummaryStepProps> = ({ previous, onSubmit }) => {
  const { previewData, selectedRecipes, importLoading } = useRecipeImportContext();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedIngredients, setExpandedIngredients] = useState(false);

  const { result: menuCatResult } = useApi((api) => api.commons.productCategoryList(), []);
  const { result: ingCatResult } = useApi((api) => api.commons.ingredientCategoryList(), []);
  const { result: unitsResult } = useApi((api) => api.commons.unitList(), []);

  const menuCategories = menuCatResult?.data?.response ?? [];
  const ingCategories = ingCatResult?.data?.response ?? [];
  const units = unitsResult?.data?.response ?? [];

  const menuCatMap = useMemo(() =>
    new Map(menuCategories.map((c) => [c.productCategoryID, c.name])),
    [menuCategories]
  );
  const ingCatMap = useMemo(() =>
    new Map(ingCategories.map((c) => [c.ingredientCategoryID, c.name])),
    [ingCategories]
  );
  const unitMap = useMemo(() =>
    new Map(units.map((u) => [u.unitID, u.name])),
    [units]
  );

  if (!previewData) return null;

  const selectedArray = previewData.recipes.filter((r) =>
    selectedRecipes.has(r.menuItemName)
  );

  const variantGroupMap = useMemo(() => {
    const map = new Map<string, RecipePreviewItemDto[]>();
    for (const r of selectedArray) {
      if (r.variantGroup) {
        if (!map.has(r.variantGroup)) map.set(r.variantGroup, []);
        map.get(r.variantGroup)!.push(r);
      }
    }
    return map;
  }, [selectedArray]);

  const standaloneItems = selectedArray.filter((r) => !r.variantGroup);

  const allNewIngredients = useMemo(() => {
    const seen = new Set<string>();
    const result: RecipeItemPreviewDto[] = [];
    for (const r of selectedArray) {
      for (const item of r.items) {
        if (!item.ingredientExistsInDb && !seen.has(item.ingredientName.toLowerCase())) {
          seen.add(item.ingredientName.toLowerCase());
          result.push(item);
        }
      }
    }
    return result;
  }, [selectedArray]);

  const totalNewRecipes =
    variantGroupMap.size + standaloneItems.filter((r) => !r.hasExistingActiveRecipe).length;

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("fil-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(v);

  const formatCurrencyPrecise = (v: number) =>
    new Intl.NumberFormat("fil-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);

  const toggleGroup = (key: string) =>
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const handleConfirmImport = async ({ password, mpin }: { password: string; mpin: string }) => {
    await onSubmit({ password, mpin });
    setShowConfirmDialog(false);
  };

  return (
    <>
      <StepShell
        icon={<TableIcon width={24} height={24} />}
        title="Review & Confirm"
        subtitle="Review everything that will be created, then stage the import."
        actions={
          <StepNavigation
            onBack={previous}
            onContinue={() => setShowConfirmDialog(true)}
            continueText={`Stage ${totalNewRecipes} Recipe${totalNewRecipes !== 1 ? "s" : ""}`}
            continueDisabled={totalNewRecipes === 0}
            loading={importLoading}
          />
        }
      >
        <Flex direction="column" gap="5">
          {/* Info callout */}
          <Callout.Root color="blue" variant="surface">
            <Callout.Text size="2">
              <Flex align="center" gap="2">
                <CheckCircledIcon />
                Review what will be created when you sync this batch.{" "}
                <Text
                  weight="bold"
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                  onClick={previous}
                >
                  ← Edit Details
                </Text>{" "}
                to make changes.
              </Flex>
            </Callout.Text>
          </Callout.Root>

          {/* Stats */}
          <Grid columns={{ initial: "2", sm: "4" }} gap="3">
            <Card variant="surface" size="1">
              <Flex direction="column" align="center" gap="1">
                <Text size="1" color="gray">Variant Products</Text>
                <Text weight="bold" size="5" color="blue">{variantGroupMap.size}</Text>
                <Text size="1" color="gray">to create</Text>
              </Flex>
            </Card>
            <Card variant="surface" size="1">
              <Flex direction="column" align="center" gap="1">
                <Text size="1" color="gray">Standalone Items</Text>
                <Text weight="bold" size="5" color="green">
                  {standaloneItems.filter((r) => !r.hasExistingActiveRecipe).length}
                </Text>
                <Text size="1" color="gray">to create</Text>
              </Flex>
            </Card>
            <Card variant="surface" size="1">
              <Flex direction="column" align="center" gap="1">
                <Text size="1" color="gray">New Ingredients</Text>
                <Text weight="bold" size="5" color="violet">{allNewIngredients.length}</Text>
                <Text size="1" color="gray">will be created</Text>
              </Flex>
            </Card>
            <Card variant="surface" size="1">
              <Flex direction="column" align="center" gap="1">
                <Text size="1" color="gray">Total Recipes</Text>
                <Text weight="bold" size="5" color="amber">{totalNewRecipes}</Text>
                <Text size="1" color="gray">to stage</Text>
              </Flex>
            </Card>
          </Grid>

          {/* ── Variant Products ─────────────────────────────────── */}
          {variantGroupMap.size > 0 && (
            <Card variant="surface" size="2">
              <Heading size="3" mb="3">Variant Products</Heading>
              <Flex direction="column" gap="3">
                {Array.from(variantGroupMap.entries()).map(([groupName, variants]) => {
                  const isExpanded = expandedGroups.has(groupName);
                  const catName = menuCatMap.get(variants[0]?.categoryID ?? "") ?? "—";
                  const desc = variants[0]?.description;
                  const materialCost = variants[0]?.materialCost;

                  return (
                    <Box
                      key={groupName}
                      style={{
                        border: "1px solid var(--blue-a4)",
                        borderRadius: 6,
                        overflow: "hidden",
                      }}
                    >
                      {/* Group header */}
                      <Flex
                        align="center"
                        gap="2"
                        px="3"
                        py="2"
                        style={{ background: "var(--blue-a2)", cursor: "pointer" }}
                        onClick={() => toggleGroup(groupName)}
                      >
                        {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                        <Text weight="bold" size="2">{groupName}</Text>
                        <Badge color="blue" variant="soft" size="1">{variants.length} sizes</Badge>
                        <Badge color="gray" variant="soft" size="1">{catName}</Badge>
                        <Badge color="green" variant="soft" size="1">Variant Product</Badge>
                      </Flex>

                      {/* Description / material cost meta */}
                      {(desc || materialCost) && (
                        <Flex px="3" py="1" gap="4" style={{ background: "var(--blue-a1)", borderBottom: "1px solid var(--blue-a3)" }}>
                          {desc && <Text size="1" color="gray">Description: {desc}</Text>}
                          {materialCost && <Text size="1" color="gray">Material cost: {formatCurrency(materialCost)}</Text>}
                        </Flex>
                      )}

                      {/* Variants table */}
                      <Box px="3" py="2">
                        <Table.Root size="1">
                          <Table.Header>
                            <Table.Row>
                              <Table.ColumnHeaderCell>Size</Table.ColumnHeaderCell>
                              <Table.ColumnHeaderCell align="right">Selling Price</Table.ColumnHeaderCell>
                              <Table.ColumnHeaderCell align="right">Ingredients</Table.ColumnHeaderCell>
                              <Table.ColumnHeaderCell align="right">New Ingredients</Table.ColumnHeaderCell>
                            </Table.Row>
                          </Table.Header>
                          <Table.Body>
                            {variants.map((v) => (
                              <Table.Row key={v.menuItemName}>
                                <Table.Cell>
                                  <Badge variant="soft" size="1">{v.variantSize ?? v.menuItemName}</Badge>
                                </Table.Cell>
                                <Table.Cell align="right">
                                  <Text size="2">{formatCurrency(v.sellingPrice)}</Text>
                                </Table.Cell>
                                <Table.Cell align="right">
                                  <Text size="2" color="gray">{v.items.length}</Text>
                                </Table.Cell>
                                <Table.Cell align="right">
                                  <Text size="2" color={v.items.some(i => !i.ingredientExistsInDb) ? "violet" : "gray"}>
                                    {v.items.filter(i => !i.ingredientExistsInDb).length}
                                  </Text>
                                </Table.Cell>
                              </Table.Row>
                            ))}
                          </Table.Body>
                        </Table.Root>
                      </Box>

                      {/* Ingredient detail — expandable */}
                      {isExpanded && (
                        <Box px="3" pb="3" style={{ background: "var(--gray-a1)" }}>
                          {variants.map((v) => (
                            <Box key={v.menuItemName} mb="3">
                              <Text size="2" weight="medium" as="div" mb="1">
                                {v.variantSize ?? v.menuItemName} ingredients
                              </Text>
                              <Table.Root size="1">
                                <Table.Header>
                                  <Table.Row>
                                    <Table.ColumnHeaderCell>Ingredient</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell align="right">Qty</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Unit</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                                  </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                  {v.items.map((ing, idx) => (
                                    <Table.Row key={idx}>
                                      <Table.Cell><Text size="1">{ing.ingredientName}</Text></Table.Cell>
                                      <Table.Cell align="right"><Text size="1">{ing.quantityRequired}</Text></Table.Cell>
                                      <Table.Cell><Text size="1">{ing.unitName || "—"}</Text></Table.Cell>
                                      <Table.Cell>
                                        <Text size="1" color="gray">
                                          {ing.ingredientExistsInDb
                                            ? "Existing"
                                            : ingCatMap.get(ing.ingredientCategoryID ?? "") ?? "—"}
                                        </Text>
                                      </Table.Cell>
                                      <Table.Cell>
                                        {ing.ingredientExistsInDb
                                          ? <Badge color="gray" size="1">Exists</Badge>
                                          : <Badge color="blue" size="1">New</Badge>
                                        }
                                      </Table.Cell>
                                    </Table.Row>
                                  ))}
                                </Table.Body>
                              </Table.Root>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Flex>
            </Card>
          )}

          {/* ── Standalone Items ──────────────────────────────────── */}
          {standaloneItems.length > 0 && (
            <Card variant="surface" size="2">
              <Heading size="3" mb="3">Standalone Menu Items</Heading>
              <Flex direction="column" gap="3">
                {standaloneItems.map((r) => {
                  const isExpanded = expandedGroups.has(r.menuItemName);
                  const catName = menuCatMap.get(r.categoryID ?? "") ?? "—";
                  return (
                    <Box
                      key={r.menuItemName}
                      style={{ border: "1px solid var(--gray-a4)", borderRadius: 6, overflow: "hidden" }}
                    >
                      <Flex
                        align="center"
                        gap="2"
                        px="3"
                        py="2"
                        style={{ background: "var(--gray-a2)", cursor: "pointer" }}
                        onClick={() => toggleGroup(r.menuItemName)}
                      >
                        {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                        <Text weight="bold" size="2" style={{ flex: 1 }}>{r.menuItemName}</Text>
                        <Badge color="gray" variant="soft" size="1">{catName}</Badge>
                        <Text size="2" color="gray">{formatCurrency(r.sellingPrice)}</Text>
                        {r.menuItemAlreadyExistsInDb
                          ? <Badge color="amber" size="1">Existing</Badge>
                          : <Badge color="green" size="1">Will Create</Badge>
                        }
                      </Flex>
                      {(r.description || r.materialCost) && (
                        <Flex px="3" py="1" gap="4" style={{ background: "var(--gray-a1)", borderBottom: "1px solid var(--gray-a3)" }}>
                          {r.description && <Text size="1" color="gray">Description: {r.description}</Text>}
                          {r.materialCost && <Text size="1" color="gray">Material cost: {formatCurrency(r.materialCost)}</Text>}
                        </Flex>
                      )}
                      {isExpanded && (
                        <Box px="3" py="2" style={{ background: "var(--gray-a1)" }}>
                          <Table.Root size="1">
                            <Table.Header>
                              <Table.Row>
                                <Table.ColumnHeaderCell>Ingredient</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell align="right">Qty</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Unit</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                              </Table.Row>
                            </Table.Header>
                            <Table.Body>
                              {r.items.map((ing, idx) => (
                                <Table.Row key={idx}>
                                  <Table.Cell><Text size="1">{ing.ingredientName}</Text></Table.Cell>
                                  <Table.Cell align="right"><Text size="1">{ing.quantityRequired}</Text></Table.Cell>
                                  <Table.Cell><Text size="1">{ing.unitName || "—"}</Text></Table.Cell>
                                  <Table.Cell>
                                    <Text size="1" color="gray">
                                      {ing.ingredientExistsInDb
                                        ? "Existing"
                                        : ingCatMap.get(ing.ingredientCategoryID ?? "") ?? "—"}
                                    </Text>
                                  </Table.Cell>
                                  <Table.Cell>
                                    {ing.ingredientExistsInDb
                                      ? <Badge color="gray" size="1">Exists</Badge>
                                      : <Badge color="blue" size="1">New</Badge>
                                    }
                                  </Table.Cell>
                                </Table.Row>
                              ))}
                            </Table.Body>
                          </Table.Root>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Flex>
            </Card>
          )}

          {/* ── New Ingredients ───────────────────────────────────── */}
          {allNewIngredients.length > 0 && (
            <Card variant="surface" size="2">
              <Flex justify="between" align="center" mb="2">
                <Heading size="3">New Ingredients ({allNewIngredients.length})</Heading>
                <Text
                  size="2"
                  color="blue"
                  style={{ cursor: "pointer" }}
                  onClick={() => setExpandedIngredients((e) => !e)}
                >
                  {expandedIngredients ? "Hide details ▴" : "Show details ▾"}
                </Text>
              </Flex>
              <Text size="2" color="gray" as="p" mb="2">
                These ingredient products will be created inline during sync.
              </Text>
              {expandedIngredients && (
                <Table.Root size="1">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell align="right">Total Cost</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell align="right">Purchase Qty</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Purchase Unit</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Stock Unit</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {allNewIngredients.map((ing, i) => (
                      <Table.Row key={i}>
                        <Table.Cell><Text size="2">{ing.ingredientName}</Text></Table.Cell>
                        <Table.Cell>
                          <Text size="2" color="gray">
                            {ingCatMap.get(ing.ingredientCategoryID ?? "") ?? (
                              <Badge color="red" size="1">No category</Badge>
                            )}
                          </Text>
                        </Table.Cell>
                        <Table.Cell align="right">
                          <Text size="2" color="gray">{formatCurrencyPrecise(ing.packagePrice)}</Text>
                        </Table.Cell>
                        <Table.Cell align="right">
                          <Text size="2" color="gray">{ing.qtyPerPack}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="2" color="gray">
                            {unitMap.get(ing.purchaseUnitID ?? "") ?? ing.unitName ?? "—"}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="2" color="gray">
                            {unitMap.get(ing.stockUnitID ?? "") ?? unitMap.get(ing.purchaseUnitID ?? "") ?? "—"}
                          </Text>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              )}
            </Card>
          )}

          <Separator />

          {previewData.globalWarnings.length > 0 && (
            <Callout.Root color="orange">
              <Callout.Text>
                <Text weight="medium" as="div" mb="2">
                  {previewData.globalWarnings.length} Warning{previewData.globalWarnings.length !== 1 ? "s" : ""}
                </Text>
                {previewData.globalWarnings.map((w, i) => (
                  <Text key={i} as="div" size="2">• {w}</Text>
                ))}
              </Callout.Text>
            </Callout.Root>
          )}
        </Flex>
      </StepShell>

      <AdminConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Confirm Batch Staging"
        description={`Stage ${totalNewRecipes} recipe(s) with ${allNewIngredients.length} new ingredient(s). An admin can sync or revert this batch from Import History.`}
        confirmLabel="Stage Import"
        confirmColor="Primary"
        loading={importLoading}
        onConfirm={handleConfirmImport}
      />
    </>
  );
};
