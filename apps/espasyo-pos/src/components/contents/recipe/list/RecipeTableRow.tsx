import React, { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Callout,
  Flex,
  Grid,
  Heading,
  Table,
  Text,
} from "@radix-ui/themes";
import {
  RestaurantMenuOutlined,
  KitchenOutlined,
  LocalDiningOutlined,
  NotesOutlined,
} from "@mui/icons-material";
import { RecipeResponse } from "core-lib/api/commons/types";
import { BaseTableRow } from "core-lib/components/radix/table/BaseTableRow";
import { ActionButtons } from "core-lib/components/radix/buttons/ActionButtons";
import { IDChip } from "core-lib/components/radix/IDChip";
import { MetricBadge } from "core-lib/components/radix/metric/MetricBadge";
import { MetricDisplay } from "core-lib/components/radix/metric/MetricDisplay";
import { CostDistributionBar } from "core-lib/components/radix/CostDistributionBar";
import { formatCurrency } from "core-lib/business/strings";
import { getIngredientCostStats } from "core-lib/business/recipe";
import { IngredientDetail } from "../../../../components/IngredientDetail";

interface Props {
  row: RecipeResponse & { ingredientCount: number; totalCost: number };
  onView: (recipe: RecipeResponse) => void;
  onEdit: (recipe: RecipeResponse) => void;
  onDelete: (recipe: RecipeResponse) => void;
  isSelectable?: boolean;
  selectedRowKey?: string | number;
  onSelect?: (rowKey: string | number) => void;
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

  const stats = useMemo(() => getIngredientCostStats(row), [row]);

  const handleToggleExpand = () => setExpanded((prev) => !prev);
  const handleRowClick = () => setExpanded((prev) => !prev);

  const hasNotes = row.recipeItems.some((item) => item.notes);

  const totalColumns = useMemo(() => {
    let count = 4;
    if (isSelectable) count += 1;
    return count;
  }, [isSelectable]);

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
            <Flex gap="2" mt="1">
              <IDChip id={row.menuItemProductID} label="Menu" />
              <IDChip id={row.recipeID} label="Recipe" color="blue" />
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
            <LocalDiningOutlined style={{ fontSize: 12, color: "var(--gray-11)" }} />
            <Text size="1" color="gray">
              {row.recipeItems.length} item
              {row.recipeItems.length !== 1 ? "s" : ""}
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
          editTooltip="Edit Recipe"
          deleteTooltip="Delete Recipe"
          expandTooltip={expanded ? "Hide ingredients" : "Show ingredients"}
          showView
          showEdit
          showDelete
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
        rowKey={row.recipeID}
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
                    Ingredient List ({row.ingredientCount})
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
                {row.recipeItems
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
            </Box>
          </Table.Cell>
        </Table.Row>
      )}
    </>
  );
};
