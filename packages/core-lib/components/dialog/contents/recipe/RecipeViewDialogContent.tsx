import React from "react";
import {
  Box,
  Typography,
  Stack,
  useTheme,
  alpha,
  Chip,
  Avatar,
  Grid,
  IconButton,
} from "@mui/material";
import {
  RestaurantMenuOutlined,
  KitchenOutlined,
  InventoryOutlined,
  Close,
  WarningAmberOutlined,
  ProductionQuantityLimitsOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import {
  RecipeResponse,
  ProductionCapacity,
} from "../../../../api/commons/types";
import { Card } from "../../../Card";
import { StatsCard } from "../../../StatsCard";
import { SectionHeader } from "../../../header";
import { StatusChip } from "../../../StatusChip";
import { ConstraintRow } from "../../../table/ConstraintRow";
import { RecipeIngredientRow } from "../../../table/RecipeIngredientRow";
import { formatCurrency } from "../../../../business";
import {
  getAverageCostPerIngredient,
  getProductionCostPerUnit,
  getProductionMaxUnits,
  getProductionTotalCostAtMax,
  getRecipeIngredientCount,
  getRecipeTotalCost,
} from "../../../../business/recipe";

interface Props {
  recipe: RecipeResponse;
  productionCapacity?: ProductionCapacity;
}

export const RecipeViewDialogContent: React.FC<Props> = ({
  recipe,
  productionCapacity,
}) => {
  const theme = useTheme();

  const totalCost = getRecipeTotalCost(recipe);
  const ingredientCount = getRecipeIngredientCount(recipe);
  const avgCostPerIngredient = getAverageCostPerIngredient(recipe);
  const maxUnits = getProductionMaxUnits(productionCapacity);
  const costPerUnit = getProductionCostPerUnit(productionCapacity, recipe);
  const totalCostAtMax = getProductionTotalCostAtMax(productionCapacity, recipe);

  const getStatusColor = (status: string | undefined): string => {
    if (!status) return theme.palette.text.secondary;
    const colorMap: Record<string, string> = {
      InStock: theme.palette.success.main,
      LowStock: theme.palette.warning.main,
      OutOfStock: theme.palette.error.main,
    };
    return colorMap[status] || theme.palette.text.secondary;
  };

  return (
    <Box sx={{ p: 0, maxHeight: "80vh", overflow: "auto" }}>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
            }}
          >
            <RestaurantMenuOutlined sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {recipe?.menuItemName || "Unknown Recipe"}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Chip
                label={`Recipe ID: ${recipe?.recipeID?.substring(0, 8) || "N/A"}...`}
                size="small"
              />
              <Chip
                label={`Menu ID: ${recipe?.menuItemProductID?.substring(0, 8) || "N/A"}...`}
                size="small"
              />
            </Stack>
          </Box>
        </Stack>
        <IconButton onClick={() => {}} size="small">
          <Close />
        </IconButton>
      </Box>

      <Box sx={{ p: 3 }}>
        <Stack spacing={4}>
          <Box>
            <SectionHeader icon={<InfoOutlined />} title="Recipe Overview" />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatsCard
                  label="Total Recipe Cost"
                  value={formatCurrency(totalCost)}
                  color="success"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatsCard
                  label="Ingredients"
                  value={ingredientCount}
                  color="info"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatsCard
                  label="Avg Cost/Ingredient"
                  value={formatCurrency(avgCostPerIngredient)}
                  color="warning"
                />
              </Grid>
            </Grid>
          </Box>

          {productionCapacity && (
            <Box>
              <SectionHeader
                icon={<ProductionQuantityLimitsOutlined />}
                title="Production Capacity"
              />
              <Card
                elevation={0}
                hoverEffect={false}
                sx={{
                  bgcolor: alpha(
                    getStatusColor(productionCapacity.overallStatus),
                    0.03,
                  ),
                  borderRadius: 2,
                  border: `1px solid ${alpha(
                    getStatusColor(productionCapacity.overallStatus),
                    0.15,
                  )}`,
                }}
              >
                <Stack spacing={3} sx={{ p: 2 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="text.secondary">
                      Current Status
                    </Typography>
                    <StatusChip status={productionCapacity.overallStatus} />
                  </Stack>

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <StatsCard
                        label="Maximum Units"
                        value={maxUnits}
                        color="info"
                        variant="compact"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <StatsCard
                        label="Cost Per Serving"
                        value={formatCurrency(costPerUnit)}
                        color="success"
                        variant="compact"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <StatsCard
                        label="Total Cost at Max Production"
                        value={formatCurrency(totalCostAtMax)}
                        color="warning"
                        variant="compact"
                      />
                    </Grid>
                  </Grid>

                  {productionCapacity.maxUnitsCanProduce === 0 && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.error.main, 0.05),
                        border: `1px solid ${alpha(
                          theme.palette.error.main,
                          0.1,
                        )}`,
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="error.main"
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <WarningAmberOutlined sx={{ fontSize: 20 }} />
                        Cannot produce {recipe?.menuItemName} due to
                        insufficient ingredients
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Card>
            </Box>
          )}

          {productionCapacity?.constraints &&
            productionCapacity.constraints.length > 0 && (
              <Box>
                <SectionHeader
                  icon={<KitchenOutlined />}
                  title="Inventory Constraints"
                  badge={
                    productionCapacity.bottleneckIngredients?.length > 0
                      ? `${productionCapacity.bottleneckIngredients.length} Bottleneck${
                          productionCapacity.bottleneckIngredients.length !== 1
                            ? "s"
                            : ""
                        }`
                      : undefined
                  }
                />
                <Stack spacing={2}>
                  {productionCapacity.constraints.map((constraint, index) => (
                    <ConstraintRow key={index} constraint={constraint} />
                  ))}
                </Stack>
              </Box>
            )}

          <Box>
            <SectionHeader
              icon={<InventoryOutlined />}
              title="Ingredients"
              badge={`${ingredientCount} item${
                ingredientCount !== 1 ? "s" : ""
              }`}
            />
            <Stack spacing={2}>
              {recipe?.recipeItems?.map((item) => {
                const constraint = productionCapacity?.constraints?.find(
                  (c) => c.ingredientName === item.ingredientName,
                );
                return (
                  <RecipeIngredientRow
                    key={item.recipeItemID}
                    ingredient={item}
                    constraint={constraint}
                  />
                );
              })}
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};
