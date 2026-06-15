import React, { useMemo, useEffect } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Callout,
  Flex,
  Grid,
  Heading,
  Separator,
  Text,
} from "@radix-ui/themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  RestaurantMenuOutlined,
  KitchenOutlined,
  InventoryOutlined,
  WarningAmberOutlined,
  ProductionQuantityLimitsOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import {
  RecipeResponse,
  RecipeItemResponse,
  ProductionCapacity,
  ProductionConstraint,
} from "../../../../api/commons/types";
import { StatsCard } from "../../../StatsCard";
import { MetricBadge } from "../../../radix/metric/MetricBadge";
import { CostDistributionBar } from "../../../radix/CostDistributionBar";
import { ConstraintRow } from "../../../table/ConstraintRow";
import { IDChip } from "../../../radix/IDChip";
import { formatCurrency } from "../../../../business";
import {
  getAverageCostPerIngredient,
  getProductionCostPerUnit,
  getProductionMaxUnits,
  getProductionTotalCostAtMax,
  getRecipeIngredientCount,
  getRecipeTotalCost,
  getIngredientCostStats,
} from "../../../../business/recipe";
import { PesoIcon } from "../../../icons/PesoIcon";
import { useApiCallback } from "../../../../core/hooks";
import { RecipeVariantAddonViewContent } from "./RecipeVariantAddonViewContent";

interface Props {
  recipe: RecipeResponse;
  productionCapacity?: ProductionCapacity;
  onNavigateToInventory?: () => void;
  variantRecipeCount?: number;
  addOnRecipeCount?: number;
}

type RadixColor = "green" | "amber" | "red" | "gray";

const statusColorMap: Record<string, RadixColor> = {
  InStock: "green",
  LowStock: "amber",
  OutOfStock: "red",
};

const getStatusColor = (status: string | undefined): RadixColor => {
  return statusColorMap[status || ""] || "gray";
};

interface RecipeViewIngredientCardProps {
  ingredient: RecipeItemResponse;
  constraint?: ProductionConstraint;
  recipeTotalCost: number;
  bottleneckIngredients?: string[];
}

const RecipeViewIngredientCard: React.FC<RecipeViewIngredientCardProps> = ({
  ingredient,
  constraint,
  recipeTotalCost,
  bottleneckIngredients,
}) => {
  const displayCost = ingredient.calculatedCost || ingredient.cost;
  const costPercentage = recipeTotalCost > 0 ? (displayCost / recipeTotalCost) * 100 : 0;
  const isBottleneck = bottleneckIngredients?.includes(ingredient.ingredientName) || false;
  const hasUnitConversion =
    !!ingredient.purchaseUnitName &&
    !!ingredient.stockUnitName &&
    ingredient.purchaseUnitName !== ingredient.stockUnitName;

  return (
    <motion.div
      initial={{ x: -8, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <Card variant="surface" style={{ padding: "var(--space-3)" }}>
        <Flex direction="column" gap="2">
          {/* Row 1: Name + badges */}
          <Flex justify="between" align="start" wrap="wrap" gap="2">
            <Flex align="center" gap="3">
              <Avatar
                size="2"
                radius="full"
                color="indigo"
                variant="soft"
                fallback={ingredient.ingredientName.charAt(0).toUpperCase()}
              />
              <Box style={{ minWidth: 0 }}>
                <Flex align="center" gap="2" wrap="wrap">
                  <Text size="2" weight="bold">
                    {ingredient.ingredientName}
                  </Text>
                  {hasUnitConversion && (
                    <Badge color="blue" variant="soft" radius="full" size="1">
                      {ingredient.purchaseUnitName} → {ingredient.stockUnitName}
                    </Badge>
                  )}
                  {isBottleneck && (
                    <Badge color="red" variant="solid" radius="full" size="1">
                      Bottleneck
                    </Badge>
                  )}
                </Flex>
                <IDChip id={ingredient.ingredientProductID} label="ID" />
              </Box>
            </Flex>
            {constraint?.status && (
              <Badge color={getStatusColor(constraint.status)} variant="soft" size="2">
                {constraint.status}
              </Badge>
            )}
          </Flex>

          {/* Row 2: Quantity | Cost | Cost % bar */}
          <Grid columns="3" gap="3" mt="1">
            {/* Quantity */}
            <Box>
              <Text size="1" color="gray">
                Quantity
              </Text>
              <Text size="2" weight="medium" mt="1">
                {ingredient.quantityRequired} {ingredient.unitName}
              </Text>
            </Box>

            {/* Cost */}
            <Box>
              <Text size="1" color="gray">
                Cost
              </Text><br />
              <Text size="2" weight="bold" style={{ color: "var(--green-11)" }} mt="1">
                {formatCurrency(displayCost)}
              </Text><br />
              {ingredient.ingredientCost !== ingredient.calculatedCost && (
                <Text size="1" color="gray" style={{ fontStyle: "italic" }} mt="1">
                  Batch calculated
                </Text>
              )}
            </Box>

            {/* Cost % with mini progress bar */}
            <Box>
              <Text size="1" color="gray">
                {costPercentage.toFixed(1)}% of recipe
              </Text>
              <Box
                mt="1"
                style={{
                  height: 4,
                  borderRadius: "var(--radius-2)",
                  background: "var(--gray-a4)",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(costPercentage, 100)}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    background: "var(--accent-9)",
                  }}
                />
              </Box>
              <Text size="1" color="gray" mt="1">
                {formatCurrency(displayCost / ingredient.quantityRequired)}/{ingredient.unitName}
              </Text>
            </Box>
          </Grid>

          {/* Footer: Purchase details */}
          {(ingredient.purchaseQuantity || hasUnitConversion) && (
            <Box
              pt="2"
              style={{ borderTop: "1px solid var(--gray-a3)" }}
            >
              <Flex gap="3" align="center" wrap="wrap">
                {ingredient.purchaseQuantity && ingredient.purchaseUnitName && (
                  <Text size="1" color="gray">
                    Purchased: {ingredient.purchaseQuantity} {ingredient.purchaseUnitName} @{" "}
                    {formatCurrency(ingredient.ingredientCost)} total
                  </Text>
                )}
                {ingredient.costPerStockUnit && ingredient.stockUnitName && (
                  <Text size="1" color="gray">
                    {formatCurrency(ingredient.costPerStockUnit)}/{ingredient.stockUnitName}
                  </Text>
                )}
                {hasUnitConversion && (
                  <Badge color="blue" variant="soft" size="1">
                    {ingredient.purchaseUnitName} → {ingredient.stockUnitName}
                  </Badge>
                )}
              </Flex>
            </Box>
          )}
        </Flex>
      </Card>
    </motion.div>
  );
};

export const RecipeViewDialogContent: React.FC<Props> = ({
  recipe,
  onNavigateToInventory,
  variantRecipeCount,
  addOnRecipeCount,
}) => {
  const isVariantOnly = !recipe.recipeItems?.length &&
    ((variantRecipeCount ?? 0) > 0 || (addOnRecipeCount ?? 0) > 0);

  const capacityCb = useApiCallback(
    async (api, productId: string) => await api.commons.calculateMaxProduction(productId)
  );

  useEffect(() => {
    if (!isVariantOnly && recipe.menuItemProductID) {
      capacityCb.execute(recipe.menuItemProductID);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe.menuItemProductID, isVariantOnly]);

  const productionCapacity = capacityCb.result?.data?.response;
  const isCapacityLoading = capacityCb.loading;

  const totalCost = getRecipeTotalCost(recipe);
  const ingredientCount = getRecipeIngredientCount(recipe);
  const avgCostPerIngredient = getAverageCostPerIngredient(recipe);
  const maxUnits = getProductionMaxUnits(productionCapacity);
  const costPerUnit = getProductionCostPerUnit(productionCapacity, recipe);
  const totalCostAtMax = getProductionTotalCostAtMax(productionCapacity, recipe);
  const stats = useMemo(() => getIngredientCostStats(recipe), [recipe]);

  const statusColor = getStatusColor(productionCapacity?.overallStatus);

  if (isVariantOnly) {
    return (
      <RecipeVariantAddonViewContent
        recipe={recipe}
        onNavigateToInventory={onNavigateToInventory}
        variantRecipeCount={variantRecipeCount}
        addOnRecipeCount={addOnRecipeCount}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Flex direction="column" gap="4">
        {/* Hero Header */}
        <Box
          p="4"
          style={{
            background: "var(--accent-a3)",
            border: "1px solid var(--accent-a5)",
            borderRadius: "var(--radius-3)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
          }}
        >
          <Box
            style={{
              width: 48,
              height: 48,
              background: "var(--accent-a4)",
              borderRadius: "var(--radius-3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-11)",
            }}
          >
            <RestaurantMenuOutlined sx={{ fontSize: 28 }} />
          </Box>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Heading size="5" weight="bold" style={{ wordBreak: "break-word" }}>
              {recipe?.menuItemName || "Unknown Recipe"}
            </Heading>
            <Flex gap="2" mt="1" wrap="wrap">
              <Badge color="gray" variant="soft" size="1">
                Menu: {recipe?.menuItemProductID?.substring(0, 8)}...
              </Badge>
              {recipe?.recipeID && (
                <Badge color="gray" variant="soft" size="1">
                  Recipe: {recipe?.recipeID?.substring(0, 8)}...
                </Badge>
              )}
              {(variantRecipeCount ?? 0) > 0 && (
                <Badge color="violet" variant="soft" size="1">
                  {variantRecipeCount} variant recipe{variantRecipeCount !== 1 ? "s" : ""}
                </Badge>
              )}
              {(addOnRecipeCount ?? 0) > 0 && (
                <Badge color="orange" variant="soft" size="1">
                  {addOnRecipeCount} add-on recipe{addOnRecipeCount !== 1 ? "s" : ""}
                </Badge>
              )}
            </Flex>
          </Box>
          {productionCapacity?.overallStatus && (
            <Badge
              color={statusColor}
              variant="soft"
              size="2"
              style={{ flexShrink: 0 }}
            >
              {productionCapacity.overallStatus}
            </Badge>
          )}
        </Box>

        {/* Overview Metrics */}
        <Grid columns="3" gap="3">
          <Card variant="surface" style={{ background: "var(--indigo-a2)", padding: "var(--space-3)" }}>
            <Flex direction="column" gap="2">
              <Text size="1" color="gray">
                Total Cost
              </Text>
              <Heading size="5" style={{ color: "var(--indigo-11)" }}>
                {formatCurrency(totalCost)}
              </Heading>
            </Flex>
          </Card>
          <Card variant="surface" style={{ background: "var(--green-a2)", padding: "var(--space-3)" }}>
            <Flex direction="column" gap="2">
              <Text size="1" color="gray">
                Ingredients
              </Text>
              <Heading size="5" style={{ color: "var(--green-11)" }}>
                {ingredientCount}
              </Heading>
            </Flex>
          </Card>
          <Card variant="surface" style={{ background: "var(--blue-a2)", padding: "var(--space-3)" }}>
            <Flex direction="column" gap="2">
              <Text size="1" color="gray">
                Avg/Ingredient
              </Text>
              <Heading size="5" style={{ color: "var(--blue-11)" }}>
                {formatCurrency(avgCostPerIngredient)}
              </Heading>
            </Flex>
          </Card>
        </Grid>

        {/* Production Capacity */}
        {(isCapacityLoading || productionCapacity) && (
          <>
            <Separator size="4" />
            <Flex align="center" gap="2">
              <ProductionQuantityLimitsOutlined style={{ color: "var(--accent-11)" }} />
              <Heading size="3">Production Capacity</Heading>
              {isCapacityLoading && (
                <Badge color="gray" variant="soft" size="1">Calculating...</Badge>
              )}
              {!isCapacityLoading && productionCapacity?.overallStatus && (
                <Badge color={statusColor} variant="soft" size="1">
                  {productionCapacity.overallStatus}
                </Badge>
              )}
            </Flex>

            {isCapacityLoading ? (
              <Box
                style={{
                  height: 76,
                  background: "var(--gray-a3)",
                  borderRadius: "var(--radius-3)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ) : (
              <Grid columns="3" gap="2">
                <StatsCard
                  label="Maximum Units"
                  value={maxUnits}
                  color="info"
                  variant="compact"
                />
                <StatsCard
                  label="Cost Per Serving"
                  value={formatCurrency(costPerUnit)}
                  color="success"
                  variant="compact"
                  icon={<PesoIcon />}
                />
                <StatsCard
                  label="Total at Max"
                  value={formatCurrency(totalCostAtMax)}
                  color="warning"
                  variant="compact"
                  icon={<PesoIcon />}
                />
              </Grid>
            )}

            {!isCapacityLoading && productionCapacity && (
              productionCapacity.maxUnitsCanProduce === 0 ||
              (productionCapacity.bottleneckIngredients?.length ?? 0) > 0
            ) && (
              <Callout.Root color="red" variant="soft">
                <Callout.Icon>
                  <WarningAmberOutlined />
                </Callout.Icon>
                <Callout.Text>
                  <Flex justify="between" align="center" gap="3" wrap="wrap">
                    <Text>
                      {productionCapacity.maxUnitsCanProduce === 0
                        ? `Cannot produce ${recipe?.menuItemName} — insufficient inventory.`
                        : `${productionCapacity.bottleneckIngredients?.length} ingredient(s) are limiting production.`}
                      {" "}This view is connected to live inventory data.
                    </Text>
                    {onNavigateToInventory && (
                      <Button size="1" variant="soft" color="red" onClick={onNavigateToInventory}>
                        Go to Inventory →
                      </Button>
                    )}
                  </Flex>
                </Callout.Text>
              </Callout.Root>
            )}
          </>
        )}

        {/* Inventory Constraints */}
        {productionCapacity?.constraints && productionCapacity.constraints.length > 0 && (
          <>
            <Separator size="4" />
            <Flex align="center" gap="2">
              <KitchenOutlined style={{ color: "var(--accent-11)" }} />
              <Heading size="3">Inventory Constraints</Heading>
              {productionCapacity.bottleneckIngredients?.length ? (
                <Badge color="amber" variant="soft" size="1">
                  {productionCapacity.bottleneckIngredients.length} bottleneck
                  {productionCapacity.bottleneckIngredients.length !== 1 ? "s" : ""}
                </Badge>
              ) : null}
            </Flex>
            <AnimatePresence>
              <Flex direction="column" gap="2">
                {productionCapacity.constraints.map((constraint, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -8, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.25, delay: index * 0.04 }}
                  >
                    <ConstraintRow constraint={constraint} />
                  </motion.div>
                ))}
              </Flex>
            </AnimatePresence>
          </>
        )}

        {/* Ingredients */}
        <Separator size="4" />
        {isVariantOnly ? (
          <Callout.Root color="blue" variant="soft">
            <Callout.Icon>
              <InfoOutlined />
            </Callout.Icon>
            <Callout.Text>
              This product has no base recipe — it uses variant and/or add-on recipes only.
              Use the expand button in the Recipe List to view each variant or add-on&apos;s ingredients.
            </Callout.Text>
          </Callout.Root>
        ) : (
          <>
        <Flex justify="between" align="center" wrap="wrap" gap="2">
          <Flex align="center" gap="2">
            <InventoryOutlined style={{ color: "var(--accent-11)" }} />
            <Heading size="3">Ingredients</Heading>
            <Badge color="indigo" variant="soft">
              {ingredientCount} item{ingredientCount !== 1 ? "s" : ""}
            </Badge>
          </Flex>
          <Flex gap="2">
            <MetricBadge
              label="Min"
              value={formatCurrency(stats.min)}
              color="green"
            />
            <MetricBadge
              label="Avg"
              value={formatCurrency(stats.avg)}
              color="blue"
            />
            <MetricBadge
              label="Max"
              value={formatCurrency(stats.max)}
              color="amber"
            />
          </Flex>
        </Flex>

        <CostDistributionBar stats={stats} total={totalCost} />

        <AnimatePresence>
          <Flex direction="column" gap="2">
            {recipe?.recipeItems?.map((item, index) => {
              const constraint = productionCapacity?.constraints?.find(
                (c) => c.ingredientName === item.ingredientName,
              );
              return (
                <motion.div
                  key={item.recipeItemID}
                  initial={{ x: -8, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                >
                  <RecipeViewIngredientCard
                    ingredient={item}
                    constraint={constraint}
                    recipeTotalCost={totalCost}
                    bottleneckIngredients={productionCapacity?.bottleneckIngredients}
                  />
                </motion.div>
              );
            })}
          </Flex>
        </AnimatePresence>
          </>
        )}
      </Flex>
    </motion.div>
  );
};
