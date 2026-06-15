import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Callout,
  Flex,
  Grid,
  Heading,
  Separator,
  Spinner,
  Table,
  Text,
} from "@radix-ui/themes";
import {
  RestaurantMenuOutlined,
  KitchenOutlined,
  LocalDiningOutlined,
  NotesOutlined,
  LayersOutlined,
  ExtensionOutlined,
  AddCircleOutlineOutlined,
  EditOutlined,
} from "@mui/icons-material";
import type {
  AddOnItemRecipeResponse,
  ProductAddOnGroupDto,
  ProductRecipeSummaryResponse,
  ProductVariantDto,
  RecipeResponse,
  VariantRecipeResponse,
} from "core-lib/api/commons/types";
import { BaseTableRow } from "core-lib/components/radix/table/BaseTableRow";
import { ActionButtons } from "core-lib/components/radix/buttons/ActionButtons";
import { IDChip } from "core-lib/components/radix/IDChip";
import { MetricBadge } from "core-lib/components/radix/metric/MetricBadge";
import { MetricDisplay } from "core-lib/components/radix/metric/MetricDisplay";
import { CostDistributionBar } from "core-lib/components/radix/CostDistributionBar";
import { formatCurrency } from "core-lib/business/strings";
import { getIngredientCostStats } from "core-lib/business/recipe";
import { IngredientDetail } from "../../../../components/IngredientDetail";
import { useApiCallback } from "core-lib/core/hooks";
import { VariantRecipeDialog } from "../../products/recipe/VariantRecipeDialog";
import { AddOnItemRecipeDialog } from "../../products/recipe/AddOnItemRecipeDialog";

interface Props {
  row: ProductRecipeSummaryResponse & { ingredientCount: number };
  onView: (recipe: ProductRecipeSummaryResponse) => void;
  onEdit: (recipe: ProductRecipeSummaryResponse) => void;
  onDelete: (recipe: ProductRecipeSummaryResponse) => void;
  isSelectable?: boolean;
  selectedRowKey?: string | number;
  onSelect?: (rowKey: string | number) => void;
}

interface SubData {
  variants: ProductVariantDto[];
  variantRecipeMap: Map<string, VariantRecipeResponse>;
  addOnGroups: ProductAddOnGroupDto[];
  addOnRecipeMap: Map<string, AddOnItemRecipeResponse>;
}

export const RecipeTableRow: React.FC<Props> = ({
  row,
  onView,
  onEdit,
  onDelete,
  isSelectable,
  selectedRowKey,
  onSelect,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [subData, setSubData] = useState<SubData | null>(null);
  const [subLoading, setSubLoading] = useState(false);
  const [loadKey, setLoadKey] = useState(0);

  // Dialogs
  const [variantDialog, setVariantDialog] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [addOnDialog, setAddOnDialog] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const stats = useMemo(
    () => getIngredientCostStats(row as unknown as RecipeResponse),
    [row],
  );

  const variantsCb = useApiCallback((api, id: string) =>
    api.commons.productVariantsByProduct(id),
  );
  const addOnGroupsCb = useApiCallback((api, id: string) =>
    api.commons.productAddOnGroupsByProduct(id),
  );
  const variantRecipesCb = useApiCallback((api, id: string) =>
    api.commons.getVariantRecipesByProduct(id),
  );
  const addOnItemRecipesCb = useApiCallback((api, id: string) =>
    api.commons.getAddOnItemRecipesByProduct(id),
  );

  useEffect(() => {
    if (!expanded) {
      setSubData(null);
      return;
    }
    setSubLoading(true);
    Promise.all([
      variantsCb.execute(row.menuItemProductID),
      addOnGroupsCb.execute(row.menuItemProductID),
      variantRecipesCb.execute(row.menuItemProductID),
      addOnItemRecipesCb.execute(row.menuItemProductID),
    ])
      .then(([varRes, addRes, vrRes, adrRes]) => {
        const vMap = new Map<string, VariantRecipeResponse>();
        (vrRes.data.response ?? []).forEach((r) =>
          vMap.set(r.productVariantID, r),
        );
        const aMap = new Map<string, AddOnItemRecipeResponse>();
        (adrRes.data.response ?? []).forEach((r) =>
          aMap.set(r.productAddOnItemID, r),
        );
        setSubData({
          variants: varRes.data.response ?? [],
          variantRecipeMap: vMap,
          addOnGroups: addRes.data.response ?? [],
          addOnRecipeMap: aMap,
        });
      })
      .catch(() => {
        setSubData({
          variants: [],
          variantRecipeMap: new Map(),
          addOnGroups: [],
          addOnRecipeMap: new Map(),
        });
      })
      .finally(() => setSubLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, loadKey]);

  const handleToggleExpand = () => setExpanded((prev) => !prev);
  const handleRowClick = () => setExpanded((prev) => !prev);

  const hasNotes = (row.recipeItems ?? []).some((item) => item.notes);

  const totalColumns = useMemo(() => {
    let count = 4;
    if (isSelectable) count += 1;
    return count;
  }, [isSelectable]);

  const handleDialogSaved = () => {
    setVariantDialog(null);
    setAddOnDialog(null);
    setSubData(null);
    setLoadKey((k) => k + 1);
  };

  const columns = [
    {
      id: "recipe",
      width: "35%",
      render: () => (
        <Flex align="center" gap="3">
          <Avatar
            size="3"
            radius="medium"
            color="indigo"
            variant="soft"
            fallback={<RestaurantMenuOutlined />}
          />
          <Box style={{ minWidth: 0 }}>
            <Text size="2" weight="bold" as="div" style={{ lineHeight: 1.3 }}>
              {row.menuItemName}
            </Text>
            <Flex gap="2" mt="1" wrap="wrap">
              <IDChip id={row.menuItemProductID} label="Menu" />
              {row.recipeID && (
                <IDChip id={row.recipeID} label="Recipe" color="blue" />
              )}
              {row.variantRecipeCount > 0 && (
                <Badge color="indigo" variant="soft" size="1">
                  {row.variantRecipeCount} variant{row.variantRecipeCount !== 1 ? "s" : ""}
                </Badge>
              )}
              {row.addOnRecipeCount > 0 && (
                <Badge color="purple" variant="soft" size="1">
                  {row.addOnRecipeCount} add-on{row.addOnRecipeCount !== 1 ? "s" : ""}
                </Badge>
              )}
            </Flex>
          </Box>
        </Flex>
      ),
    },
    {
      id: "ingredients",
      align: "center" as const,
      width: "15%",
      render: () => (
        <MetricDisplay
          label="Ingredients"
          value={row.ingredientCount.toString()}
          icon={<KitchenOutlined />}
          iconColor="var(--green-11)"
        />
      ),
    },
    {
      id: "cost",
      align: "center" as const,
      width: "20%",
      render: () => (
        <Flex direction="column" gap="1">
          <MetricDisplay
            label="Total Cost"
            value={formatCurrency(row.totalCost)}
            valueColor="var(--green-11)"
            tooltip={
              <Box>
                <Text as="div" size="2">
                  <strong>Total Cost:</strong> {formatCurrency(row.totalCost)}
                </Text>
                <Text as="div" size="2">
                  <strong>Number of Ingredients:</strong> {row.ingredientCount}
                </Text>
                <Text as="div" size="2">
                  <strong>Average per Ingredient:</strong>{" "}
                  {formatCurrency(stats.avg)}
                </Text>
                <Text as="div" size="2">
                  <strong>Range:</strong> {formatCurrency(stats.min)} -{" "}
                  {formatCurrency(stats.max)}
                </Text>
              </Box>
            }
            showTooltip
          />
          <Flex align="center" gap="1">
            <LocalDiningOutlined
              style={{ fontSize: 12, color: "var(--gray-11)" }}
            />
            <Text size="1" color="gray">
              {(row.recipeItems ?? []).length} item
              {(row.recipeItems ?? []).length !== 1 ? "s" : ""}
            </Text>
          </Flex>
        </Flex>
      ),
    },
    {
      id: "actions",
      align: "right" as const,
      width: "30%",
      render: () => (
        <ActionButtons
          onView={() => onView(row)}
          onEdit={() => onEdit(row)}
          onDelete={() => onDelete(row)}
          onExpand={handleToggleExpand}
          viewTooltip="View Recipe Details"
          editTooltip="Edit Base Recipe"
          deleteTooltip="Delete Base Recipe"
          expandTooltip={expanded ? "Hide details" : "Show details"}
          showView={!!row.recipeID || row.variantRecipeCount > 0 || row.addOnRecipeCount > 0}
          showEdit={!!row.recipeID}
          showDelete={!!row.recipeID || row.variantRecipeCount > 0 || row.addOnRecipeCount > 0}
          showExpand
          isExpanded={expanded}
        />
      ),
    },
  ];

  return (
    <>
      <BaseTableRow
        data={row}
        rowKey={row.recipeID ?? row.menuItemProductID}
        columns={columns}
        isSelectable={isSelectable}
        selectedRowKey={selectedRowKey}
        onSelect={onSelect}
        onRowClick={handleRowClick}
      />

      {expanded && (
        <Table.Row>
          <Table.Cell
            colSpan={totalColumns}
            style={{ padding: 0, background: "var(--gray-2)" }}
          >
            <Box py="4" px="3">
              {/* ── Base Recipe ───────────────────────────────────────────────── */}
              {row.recipeID ? (
                <>
                  <Flex
                    justify="between"
                    align="center"
                    mb="3"
                    wrap="wrap"
                    gap="2"
                  >
                    <Flex align="center" gap="2">
                      <KitchenOutlined style={{ color: "var(--accent-11)" }} />
                      <Heading size="3" weight="bold">
                        Base Recipe ({row.ingredientCount})
                      </Heading>
                    </Flex>

                    <Flex gap="2">
                      <MetricBadge
                        label="Min"
                        value={formatCurrency(stats.min)}
                        color="green"
                        tooltip={`Cheapest ingredient: ${formatCurrency(stats.min)}`}
                      />
                      <MetricBadge
                        label="Avg"
                        value={formatCurrency(stats.avg)}
                        color="blue"
                        tooltip={`Average ingredient cost: ${formatCurrency(stats.avg)}`}
                      />
                      <MetricBadge
                        label="Max"
                        value={formatCurrency(stats.max)}
                        color="amber"
                        tooltip={`Most expensive ingredient: ${formatCurrency(stats.max)}`}
                      />
                    </Flex>
                  </Flex>

                  <CostDistributionBar stats={stats} total={row.totalCost} />

                  <Grid columns="1" gap="2">
                    {(row.recipeItems ?? [])
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((ingredient) => (
                        <IngredientDetail
                          key={ingredient.recipeItemID}
                          ingredient={ingredient}
                        />
                      ))}
                  </Grid>

                  {hasNotes && (
                    <Box mt="3">
                      <Callout.Root color="amber" variant="soft">
                        <Callout.Icon>
                          <NotesOutlined style={{ fontSize: 16 }} />
                        </Callout.Icon>
                        <Callout.Text>
                          Some ingredients have notes — look for the{" "}
                          <strong>yellow "Has notes"</strong> chips above.
                        </Callout.Text>
                      </Callout.Root>
                    </Box>
                  )}
                </>
              ) : (
                <Callout.Root color="gray" variant="soft" mb="3">
                  <Callout.Icon>
                    <KitchenOutlined style={{ fontSize: 16 }} />
                  </Callout.Icon>
                  <Callout.Text>
                    No base recipe configured — ingredients are defined per-variant or per-add-on below.
                  </Callout.Text>
                </Callout.Root>
              )}

              {/* ── Variant & Add-On Recipes ────────────────────────────────── */}
              {subLoading && (
                <Flex justify="center" py="4" mt="3">
                  <Spinner size="2" />
                  <Text size="2" color="gray" ml="2">
                    Loading variant and add-on recipes…
                  </Text>
                </Flex>
              )}

              {!subLoading && subData && (
                <>
                  {/* Variants */}
                  {subData.variants.length > 0 && (
                    <Box mt="4">
                      <Separator size="4" mb="3" />
                      <Flex align="center" gap="2" mb="3">
                        <LayersOutlined
                          style={{ color: "var(--indigo-11)" }}
                        />
                        <Heading size="3" weight="bold">
                          Variant Recipes
                        </Heading>
                        <Badge color="indigo" variant="soft" size="1">
                          {subData.variantRecipeMap.size} /{" "}
                          {subData.variants.filter((v) => v.isActive).length}
                        </Badge>
                      </Flex>
                      <Flex direction="column" gap="2">
                        {subData.variants
                          .filter((v) => v.isActive)
                          .sort((a, b) => a.displayOrder - b.displayOrder)
                          .map((v) => {
                            const recipe = subData.variantRecipeMap.get(
                              v.productVariantID,
                            );
                            return (
                              <Flex
                                key={v.productVariantID}
                                align="center"
                                justify="between"
                                px="3"
                                py="2"
                                gap="3"
                                style={{
                                  border: "1px solid var(--indigo-a4)",
                                  borderRadius: "var(--radius-2)",
                                  background: "var(--indigo-a2)",
                                }}
                              >
                                <Flex align="center" gap="2">
                                  <LayersOutlined
                                    style={{
                                      fontSize: 16,
                                      color: "var(--indigo-10)",
                                    }}
                                  />
                                  <Box>
                                    <Text size="2" weight="medium" as="div">
                                      {v.name}
                                    </Text>
                                    {recipe ? (
                                      <Text size="1" color="gray" as="div">
                                        {recipe.recipeItems.length} ingredient
                                        {recipe.recipeItems.length !== 1
                                          ? "s"
                                          : ""}{" "}
                                        · {formatCurrency(recipe.totalCost)}
                                      </Text>
                                    ) : (
                                      <Text size="1" color="gray" as="div">
                                        Uses base recipe
                                      </Text>
                                    )}
                                  </Box>
                                </Flex>
                                <Flex align="center" gap="2">
                                  {recipe ? (
                                    <Badge
                                      color="green"
                                      variant="soft"
                                      size="1"
                                    >
                                      Has Recipe
                                    </Badge>
                                  ) : (
                                    <Badge
                                      color="gray"
                                      variant="soft"
                                      size="1"
                                    >
                                      No Override
                                    </Badge>
                                  )}
                                  <Button
                                    size="1"
                                    variant="soft"
                                    color="indigo"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setVariantDialog({
                                        id: v.productVariantID,
                                        name: v.name,
                                      });
                                    }}
                                  >
                                    {recipe ? (
                                      <>
                                        <EditOutlined
                                          style={{ fontSize: 13 }}
                                        />
                                        Edit
                                      </>
                                    ) : (
                                      <>
                                        <AddCircleOutlineOutlined
                                          style={{ fontSize: 13 }}
                                        />
                                        Add Recipe
                                      </>
                                    )}
                                  </Button>
                                </Flex>
                              </Flex>
                            );
                          })}
                      </Flex>
                    </Box>
                  )}

                  {/* Add-on items */}
                  {subData.addOnGroups.length > 0 && (
                    <Box mt="4">
                      <Separator size="4" mb="3" />
                      <Flex align="center" gap="2" mb="3">
                        <ExtensionOutlined
                          style={{ color: "var(--purple-11)" }}
                        />
                        <Heading size="3" weight="bold">
                          Add-On Recipes
                        </Heading>
                        <Badge color="purple" variant="soft" size="1">
                          {subData.addOnRecipeMap.size} item
                          {subData.addOnRecipeMap.size !== 1 ? "s" : ""} with
                          recipes
                        </Badge>
                      </Flex>
                      <Flex direction="column" gap="3">
                        {subData.addOnGroups.map((group) => (
                          <Box key={group.productAddOnGroupID}>
                            <Text
                              size="1"
                              weight="bold"
                              color="gray"
                              mb="2"
                              as="div"
                            >
                              {group.name}
                            </Text>
                            <Flex direction="column" gap="2">
                              {(group.items ?? [])
                                .filter((item) => item.isActive)
                                .sort(
                                  (a, b) => a.displayOrder - b.displayOrder,
                                )
                                .map((item) => {
                                  const recipe = subData.addOnRecipeMap.get(
                                    item.productAddOnItemID,
                                  );
                                  return (
                                    <Flex
                                      key={item.productAddOnItemID}
                                      align="center"
                                      justify="between"
                                      px="3"
                                      py="2"
                                      gap="3"
                                      style={{
                                        border: "1px solid var(--purple-a4)",
                                        borderRadius: "var(--radius-2)",
                                        background: "var(--purple-a2)",
                                      }}
                                    >
                                      <Flex align="center" gap="2">
                                        <ExtensionOutlined
                                          style={{
                                            fontSize: 16,
                                            color: "var(--purple-10)",
                                          }}
                                        />
                                        <Box>
                                          <Text
                                            size="2"
                                            weight="medium"
                                            as="div"
                                          >
                                            {item.name}
                                          </Text>
                                          {recipe ? (
                                            <Text
                                              size="1"
                                              color="gray"
                                              as="div"
                                            >
                                              {recipe.recipeItems.length}{" "}
                                              ingredient
                                              {recipe.recipeItems.length !== 1
                                                ? "s"
                                                : ""}{" "}
                                              · {formatCurrency(recipe.totalCost)}
                                            </Text>
                                          ) : (
                                            <Text
                                              size="1"
                                              color="gray"
                                              as="div"
                                            >
                                              No recipe yet
                                            </Text>
                                          )}
                                        </Box>
                                      </Flex>
                                      <Flex align="center" gap="2">
                                        {recipe ? (
                                          <Badge
                                            color="green"
                                            variant="soft"
                                            size="1"
                                          >
                                            Has Recipe
                                          </Badge>
                                        ) : (
                                          <Badge
                                            color="gray"
                                            variant="soft"
                                            size="1"
                                          >
                                            No Recipe
                                          </Badge>
                                        )}
                                        <Button
                                          size="1"
                                          variant="soft"
                                          color="purple"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setAddOnDialog({
                                              id: item.productAddOnItemID,
                                              name: item.name,
                                            });
                                          }}
                                        >
                                          {recipe ? (
                                            <>
                                              <EditOutlined
                                                style={{ fontSize: 13 }}
                                              />
                                              Edit
                                            </>
                                          ) : (
                                            <>
                                              <AddCircleOutlineOutlined
                                                style={{ fontSize: 13 }}
                                              />
                                              Add Recipe
                                            </>
                                          )}
                                        </Button>
                                      </Flex>
                                    </Flex>
                                  );
                                })}
                            </Flex>
                          </Box>
                        ))}
                      </Flex>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Table.Cell>
        </Table.Row>
      )}

      {/* ── Dialogs ─────────────────────────────────────────────────────────── */}
      {variantDialog && (
        <VariantRecipeDialog
          variantId={variantDialog.id}
          variantName={variantDialog.name}
          open={true}
          onClose={() => setVariantDialog(null)}
          onSaved={handleDialogSaved}
        />
      )}
      {addOnDialog && (
        <AddOnItemRecipeDialog
          addOnItemId={addOnDialog.id}
          addOnItemName={addOnDialog.name}
          open={true}
          onClose={() => setAddOnDialog(null)}
          onSaved={handleDialogSaved}
        />
      )}
    </>
  );
};
