import React, { useMemo, useState } from "react";
import {
  Stack,
  Avatar,
  Typography,
  Box,
  alpha,
  useTheme,
  Collapse,
  Grid,
  TableRow,
  TableCell,
} from "@mui/material";
import {
  RestaurantMenuOutlined,
  KitchenOutlined,
  LocalDiningOutlined,
  NotesOutlined,
} from "@mui/icons-material";
import { RecipeResponse } from "core-lib/api/commons/types";
import {
  BaseTableRow,
  ActionButtons,
  IDChip,
  MetricBadge,
  MetricDisplay,
  CostDistributionBar,
} from "core-lib";
import { formatCurrency } from "core-lib/business/strings";
import { calculateIngredientStats } from "core-lib/business/number";
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
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const stats = useMemo(
    () =>
      calculateIngredientStats(
        row.recipeItems,
        row.totalCost,
        row.ingredientCount,
      ),
    [row],
  );

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleRowClick = () => {
    setExpanded(!expanded);
  };

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
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
              borderRadius: 2,
            }}
          >
            <RestaurantMenuOutlined />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} lineHeight={1.3}>
              {row.menuItemName}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <IDChip id={row.menuItemProductID} label="Menu" />
              <IDChip
                id={row.recipeID}
                label="Recipe"
                color={theme.palette.info.main}
              />
            </Stack>
          </Box>
        </Stack>
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
          iconColor={theme.palette.success.main}
        />
      ),
    },
    {
      id: "cost",
      align: "center" as const,
      width: "20%",
      render: () => (
        <Stack spacing={0.5}>
          <MetricDisplay
            label="Total Cost"
            value={formatCurrency(row.totalCost)}
            valueColor="success.main"
            tooltip={
              <Box>
                <Typography variant="body2">
                  <strong>Total Cost:</strong> {formatCurrency(row.totalCost)}
                </Typography>
                <Typography variant="body2">
                  <strong>Number of Ingredients:</strong> {row.ingredientCount}
                </Typography>
                <Typography variant="body2">
                  <strong>Average per Ingredient:</strong>{" "}
                  {formatCurrency(stats.avg)}
                </Typography>
                <Typography variant="body2">
                  <strong>Range:</strong> {formatCurrency(stats.min)} -{" "}
                  {formatCurrency(stats.max)}
                </Typography>
              </Box>
            }
            showTooltip={true}
          />
          <Stack direction="row" spacing={0.5} alignItems="center">
            <LocalDiningOutlined
              sx={{ fontSize: 12, color: theme.palette.text.secondary }}
            />
            <Typography variant="caption" color="text.secondary">
              {row.recipeItems.length} item
              {row.recipeItems.length !== 1 ? "s" : ""}
            </Typography>
          </Stack>
        </Stack>
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
          showView={true}
          showEdit={true}
          showDelete={true}
          showExpand={true}
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

      <TableRow>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={totalColumns}
        >
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ py: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <KitchenOutlined sx={{ color: theme.palette.primary.main }} />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Ingredient List ({row.ingredientCount})
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1}>
                  <MetricBadge
                    label="Min"
                    value={formatCurrency(stats.min)}
                    color={theme.palette.success.main}
                    tooltip={`Cheapest ingredient: ${formatCurrency(stats.min)}`}
                  />
                  <MetricBadge
                    label="Avg"
                    value={formatCurrency(stats.avg)}
                    color={theme.palette.info.main}
                    tooltip={`Average ingredient cost: ${formatCurrency(stats.avg)}`}
                  />
                  <MetricBadge
                    label="Max"
                    value={formatCurrency(stats.max)}
                    color={theme.palette.warning.main}
                    tooltip={`Most expensive ingredient: ${formatCurrency(stats.max)}`}
                  />
                </Stack>
              </Stack>

              <CostDistributionBar stats={stats} total={row.totalCost} />

              <Grid container spacing={2}>
                {row.recipeItems
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((ingredient) => (
                    <Grid size={{ xs: 12 }} key={ingredient.recipeItemID}>
                      <IngredientDetail ingredient={ingredient} />
                    </Grid>
                  ))}
              </Grid>

              {hasNotes && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: alpha(theme.palette.warning.main, 0.05),
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <NotesOutlined
                      sx={{ fontSize: 16, color: theme.palette.warning.main }}
                    />
                    <span>
                      Some ingredients have notes - look for the{" "}
                      <strong>yellow "Has notes"</strong> chips above
                    </span>
                  </Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
