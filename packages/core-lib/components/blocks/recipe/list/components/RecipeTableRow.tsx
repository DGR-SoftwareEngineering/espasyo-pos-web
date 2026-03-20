import React, { useMemo, useState } from "react";
import {
  TableRow,
  TableCell,
  Stack,
  Avatar,
  Typography,
  Box,
  alpha,
  useTheme,
  Collapse,
  Grid,
  Tooltip,
} from "@mui/material";
import {
  VisibilityOutlined,
  EditOutlined,
  DeleteOutlined,
  RestaurantMenuOutlined,
  KitchenOutlined,
  LocalDiningOutlined,
  ExpandMore,
  ExpandLess,
  NotesOutlined,
} from "@mui/icons-material";
import { RecipeResponse } from "../../../../../api/commons/types";
import { calculateIngredientStats } from "../../../../../business/number";
import { IDChip } from "../../../../IDChip";
import { MetricDisplay } from "../../../../metric/MetricDisplay";
import { formatCurrency } from "../../../../../business/strings";
import { ActionButton } from "../../../../buttons/ActionButton";
import { MetricBadge } from "../../../../metric/MetricBadge";
import { CostDistributionBar } from "../../../../CostDistributionBar";
import { IngredientDetail } from "../../components/IngredientDetail";

interface Props {
  row: RecipeResponse & { ingredientCount: number; totalCost: number };
  onView: (recipe: RecipeResponse) => void;
  onEdit: (recipe: RecipeResponse) => void;
  onDelete: (recipe: RecipeResponse) => void;
}

export const RecipeTableRow: React.FC<Props> = ({
  row,
  onView,
  onEdit,
  onDelete,
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

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleAction =
    (handler: (recipe: RecipeResponse) => void) => (e: React.MouseEvent) => {
      e.stopPropagation();
      handler(row);
    };

  const hasNotes = row.recipeItems.some((item) => item.notes);

  return (
    <>
      <TableRow
        hover
        onClick={() => setExpanded(!expanded)}
        sx={{
          "&:last-child td, &:last-child th": { border: 0 },
          transition: "all 0.2s",
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
          },
          cursor: "pointer",
        }}
      >
        <TableCell>
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
        </TableCell>

        <TableCell>
          <MetricDisplay
            label="Ingredients"
            value={row.ingredientCount.toString()}
            icon={<KitchenOutlined />}
            iconColor={theme.palette.success.main}
          />
        </TableCell>

        <TableCell>
          <Tooltip
            title={
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
            arrow
            placement="top"
          >
            <div>
              <MetricDisplay
                label="Total Cost"
                value={formatCurrency(row.totalCost)}
                valueColor="success.main"
                tooltip
              />
            </div>
          </Tooltip>
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ mt: 0.5 }}
          >
            <LocalDiningOutlined
              sx={{ fontSize: 12, color: theme.palette.text.secondary }}
            />
            <Typography variant="caption" color="text.secondary">
              {row.recipeItems.length} item
              {row.recipeItems.length !== 1 ? "s" : ""}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell align="right">
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <ActionButton
              tooltip="View Recipe Details"
              icon={<VisibilityOutlined fontSize="small" />}
              color={theme.palette.info.main}
              onClick={handleAction(onView)}
            />
            <ActionButton
              tooltip="Edit Recipe"
              icon={<EditOutlined fontSize="small" />}
              color={theme.palette.primary.main}
              onClick={handleAction(onEdit)}
            />
            <ActionButton
              tooltip="Delete Recipe"
              icon={<DeleteOutlined fontSize="small" />}
              color={theme.palette.error.main}
              onClick={handleAction(onDelete)}
            />
            <ActionButton
              tooltip={expanded ? "Hide ingredients" : "Show ingredients"}
              icon={
                expanded ? (
                  <ExpandLess fontSize="small" />
                ) : (
                  <ExpandMore fontSize="small" />
                )
              }
              color={theme.palette.grey[600]}
              onClick={handleToggleExpand}
            />
          </Stack>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ py: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
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
