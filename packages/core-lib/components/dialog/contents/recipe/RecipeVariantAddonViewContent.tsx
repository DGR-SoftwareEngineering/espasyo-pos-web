import React, { useMemo, useEffect } from "react";
import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Grid,
  Heading,
  Separator,
  Tabs,
  Text,
} from "@radix-ui/themes";
import { motion } from "framer-motion";
import {
  RestaurantMenuOutlined,
  InventoryOutlined,
  InfoOutlined,
  LocalDiningOutlined,
  ProductionQuantityLimitsOutlined,
} from "@mui/icons-material";
import {
  RecipeResponse,
  VariantRecipeResponse,
  AddOnItemRecipeResponse,
  VariantRecipeItemResponse,
  AddOnItemRecipeItemResponse,
} from "../../../../api/commons/types";
import { formatCurrency } from "../../../../business";
import { useApi, useApiCallback, useResolution } from "../../../../core/hooks";

interface Props {
  recipe: RecipeResponse;
  onNavigateToInventory?: () => void;
  variantRecipeCount?: number;
  addOnRecipeCount?: number;
}

interface IngredientRowProps {
  name: string;
  quantity: number;
  unitName: string;
  cost: number;
  totalCost: number;
}

const IngredientRow: React.FC<IngredientRowProps> = ({
  name,
  quantity,
  unitName,
  cost,
  totalCost,
}) => {
  const { isSmallMobile } = useResolution();
  const pct = totalCost > 0 ? (cost / totalCost) * 100 : 0;

  if (isSmallMobile) {
    return (
      <Box py="2" style={{ borderBottom: "1px solid var(--gray-a3)" }}>
        <Text size="2" weight="medium" style={{ wordBreak: "break-word" }}>
          {name}
        </Text>
        <Flex gap="3" mt="1" wrap="wrap">
          <Text size="2" color="gray">
            {quantity} {unitName}
          </Text>
          <Text size="2" weight="bold" style={{ color: "var(--green-11)" }}>
            {formatCurrency(cost)}
          </Text>
        </Flex>
        <Flex align="center" gap="2" mt="1">
          <Text size="1" color="gray">
            {pct.toFixed(1)}%
          </Text>
          <Box
            style={{
              flex: 1,
              height: 4,
              borderRadius: "var(--radius-2)",
              background: "var(--gray-a4)",
              overflow: "hidden",
            }}
          >
            <Box
              style={{
                height: "100%",
                width: `${Math.min(pct, 100)}%`,
                background: "var(--accent-9)",
                borderRadius: "var(--radius-2)",
              }}
            />
          </Box>
        </Flex>
      </Box>
    );
  }

  return (
    <Flex align="center" gap="3" py="2" style={{ borderBottom: "1px solid var(--gray-a3)" }}>
      <Box style={{ flex: "1 1 35%", minWidth: 0 }}>
        <Text size="2" weight="medium" style={{ wordBreak: "break-word" }}>
          {name}
        </Text>
      </Box>
      <Box style={{ flex: "0 0 120px", textAlign: "right" }}>
        <Text size="2" color="gray">
          {quantity} {unitName}
        </Text>
      </Box>
      <Box style={{ flex: "0 0 90px", textAlign: "right" }}>
        <Text size="2" weight="bold" style={{ color: "var(--green-11)" }}>
          {formatCurrency(cost)}
        </Text>
      </Box>
      <Box style={{ flex: "0 0 80px" }}>
        <Text size="1" color="gray" mb="1">
          {pct.toFixed(1)}%
        </Text>
        <Box
          style={{
            height: 4,
            borderRadius: "var(--radius-2)",
            background: "var(--gray-a4)",
            overflow: "hidden",
          }}
        >
          <Box
            style={{
              height: "100%",
              width: `${Math.min(pct, 100)}%`,
              background: "var(--accent-9)",
              borderRadius: "var(--radius-2)",
            }}
          />
        </Box>
      </Box>
    </Flex>
  );
};

type RadixColor = "green" | "amber" | "red" | "gray";

const statusColorMap: Record<string, RadixColor> = {
  InStock: "green",
  LowStock: "amber",
  OutOfStock: "red",
  Critical: "red",
};

interface RecipeCardProps {
  name: string;
  totalCost: number;
  items: (VariantRecipeItemResponse | AddOnItemRecipeItemResponse)[];
  accentColor?: string;
  badgeColor?: "violet" | "orange";
  isAddOn?: boolean;
  recipeId: string;
  recipeType: "variant" | "addon";
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  name,
  totalCost,
  items,
  badgeColor = "violet",
  isAddOn = false,
  recipeId,
  recipeType,
}) => {
  const { isSmallMobile } = useResolution();
  const capacityCb = useApiCallback(
    async (api, { id, type }: { id: string; type: "variant" | "addon" }) =>
      type === "variant"
        ? api.commons.calculateVariantMaxProduction(id)
        : api.commons.calculateAddOnMaxProduction(id)
  );

  useEffect(() => {
    capacityCb.execute({ id: recipeId, type: recipeType });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId, recipeType]);

  const capacity = capacityCb.result?.data?.response;
  const isCapacityLoading = capacityCb.loading;
  const statusColor: RadixColor = statusColorMap[capacity?.overallStatus ?? ""] ?? "gray";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card variant="surface" style={{ padding: "var(--space-3)" }}>
        <Flex justify="between" align="center" mb="3" wrap="wrap" gap="2">
          <Flex align="center" gap="2">
            <Badge color={badgeColor} variant="soft" size="2">
              {isAddOn ? "Add-On" : "Variant"}
            </Badge>
            <Heading size="3">{name}</Heading>
          </Flex>
          <Flex align="center" gap="3">
            <Text size="1" color="gray">
              {items.length} ingredient{items.length !== 1 ? "s" : ""}
            </Text>
            <Text size="3" weight="bold" style={{ color: "var(--indigo-11)" }}>
              {formatCurrency(totalCost)}
            </Text>
          </Flex>
        </Flex>

        {/* Production Capacity row */}
        <Flex align="center" gap="2" py="2" mb="2" style={{ borderBottom: "1px solid var(--gray-a4)" }}>
          <ProductionQuantityLimitsOutlined style={{ fontSize: 16, color: "var(--accent-11)" }} />
          <Text size="1" color="gray">Production Capacity:</Text>
          {isCapacityLoading ? (
            <Badge color="gray" variant="soft" size="1">Calculating...</Badge>
          ) : capacity ? (
            <>
              <Badge color={statusColor} variant="soft" size="1">{capacity.overallStatus}</Badge>
              <Text size="2" weight="medium">
                Max: {capacity.maxUnitsCanProduce} unit{capacity.maxUnitsCanProduce !== 1 ? "s" : ""}
              </Text>
              {(capacity.bottleneckIngredients?.length ?? 0) > 0 && (
                <Badge color="red" variant="soft" size="1">
                  Bottleneck: {capacity.bottleneckIngredients.slice(0, 2).join(", ")}
                  {capacity.bottleneckIngredients.length > 2 ? ` +${capacity.bottleneckIngredients.length - 2}` : ""}
                </Badge>
              )}
            </>
          ) : null}
        </Flex>

        {isAddOn && (
          <Box mb="2">
            <Callout.Root color="blue" variant="soft" size="1">
              <Callout.Icon><InfoOutlined sx={{ fontSize: 14 }} /></Callout.Icon>
              <Callout.Text>
                <Text size="1">These ingredients are added on top of the base recipe quantities when the add-on is selected.</Text>
              </Callout.Text>
            </Callout.Root>
          </Box>
        )}

        {items.length === 0 ? (
          <Text size="2" color="gray">No ingredients defined.</Text>
        ) : (
          <Box>
            {!isSmallMobile && (
            <Flex align="center" gap="3" pb="1" style={{ borderBottom: "2px solid var(--gray-a4)" }}>
              <Text size="1" color="gray" style={{ flex: "1 1 35%" }}>Ingredient</Text>
              <Text size="1" color="gray" style={{ flex: "0 0 120px", textAlign: "right" }}>Quantity</Text>
              <Text size="1" color="gray" style={{ flex: "0 0 90px", textAlign: "right" }}>Cost</Text>
              <Text size="1" color="gray" style={{ flex: "0 0 80px" }}>Share</Text>
            </Flex>
            )}
            {items.map((item, idx) => {
              const cost = item.calculatedCost ?? item.ingredientCost ?? 0;
              return (
                <IngredientRow
                  key={idx}
                  name={item.ingredientName}
                  quantity={item.quantityRequired}
                  unitName={item.unitName}
                  cost={cost}
                  totalCost={totalCost}
                />
              );
            })}
          </Box>
        )}
      </Card>
    </motion.div>
  );
};

const SkeletonCard: React.FC = () => (
  <Box
    style={{
      height: 120,
      background: "var(--gray-a3)",
      borderRadius: "var(--radius-3)",
      animation: "pulse 1.5s ease-in-out infinite",
    }}
  />
);

export const RecipeVariantAddonViewContent: React.FC<Props> = ({
  recipe,
  onNavigateToInventory,
  variantRecipeCount,
  addOnRecipeCount,
}) => {
  const variantData = useApi(
    (api) => api.commons.getVariantRecipesByProduct(recipe.menuItemProductID)
  );
  const addOnData = useApi(
    (api) => api.commons.getAddOnItemRecipesByProduct(recipe.menuItemProductID)
  );

  const variantRecipes: VariantRecipeResponse[] = variantData.result?.data?.response ?? [];
  const addOnRecipes: AddOnItemRecipeResponse[] = addOnData.result?.data?.response ?? [];
  const isLoading = variantData.loading || addOnData.loading;

  const summary = useMemo(() => {
    const allIngredients = [
      ...variantRecipes.flatMap((r) => r.recipeItems),
      ...addOnRecipes.flatMap((r) => r.recipeItems),
    ];
    const totalCost =
      variantRecipes.reduce((s, r) => s + r.totalCost, 0) +
      addOnRecipes.reduce((s, r) => s + r.totalCost, 0);
    return { totalIngredients: allIngredients.length, totalCost };
  }, [variantRecipes, addOnRecipes]);

  const showTabs = variantRecipes.length > 0 && addOnRecipes.length > 0;

  const variantSection = (
    <Flex direction="column" gap="3">
      {isLoading
        ? [0, 1].map((i) => <SkeletonCard key={i} />)
        : variantRecipes.length === 0
        ? (
          <Callout.Root color="gray" variant="soft">
            <Callout.Icon><InfoOutlined /></Callout.Icon>
            <Callout.Text>No variant recipes found for this product.</Callout.Text>
          </Callout.Root>
        )
        : variantRecipes.map((vr) => (
            <RecipeCard
              key={vr.variantRecipeID}
              name={vr.variantName}
              totalCost={vr.totalCost}
              items={vr.recipeItems}
              badgeColor="violet"
              isAddOn={false}
              recipeId={vr.variantRecipeID}
              recipeType="variant"
            />
          ))}
    </Flex>
  );

  const addOnSection = (
    <Flex direction="column" gap="3">
      {isLoading
        ? [0, 1].map((i) => <SkeletonCard key={i} />)
        : addOnRecipes.length === 0
        ? (
          <Callout.Root color="gray" variant="soft">
            <Callout.Icon><InfoOutlined /></Callout.Icon>
            <Callout.Text>No add-on recipes found for this product.</Callout.Text>
          </Callout.Root>
        )
        : addOnRecipes.map((ar) => (
            <RecipeCard
              key={ar.addOnItemRecipeID}
              name={ar.itemName}
              totalCost={ar.totalCost}
              items={ar.recipeItems}
              badgeColor="orange"
              isAddOn={true}
              recipeId={ar.addOnItemRecipeID}
              recipeType="addon"
            />
          ))}
    </Flex>
  );

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
            <LocalDiningOutlined sx={{ fontSize: 28 }} />
          </Box>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Heading size="5" weight="bold" style={{ wordBreak: "break-word" }}>
              {recipe?.menuItemName || "Unknown Product"}
            </Heading>
            <Flex gap="2" mt="1" wrap="wrap">
              <Badge color="gray" variant="soft" size="1">
                ID: {recipe?.menuItemProductID?.substring(0, 8)}...
              </Badge>
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
        </Box>

        {/* Summary Bar */}
        {!isLoading && (
          <Grid columns={{ initial: "1", sm: "3" }} gap="3">
            <Card variant="surface" style={{ background: "var(--indigo-a2)", padding: "var(--space-3)" }}>
              <Flex direction="column" gap="1">
                <Text size="1" color="gray">Total Ingredients</Text>
                <Heading size="5" style={{ color: "var(--indigo-11)" }}>
                  {summary.totalIngredients}
                </Heading>
              </Flex>
            </Card>
            <Card variant="surface" style={{ background: "var(--green-a2)", padding: "var(--space-3)" }}>
              <Flex direction="column" gap="1">
                <Text size="1" color="gray">Total Cost (all recipes)</Text>
                <Heading size="5" style={{ color: "var(--green-11)" }}>
                  {formatCurrency(summary.totalCost)}
                </Heading>
              </Flex>
            </Card>
            <Card variant="surface" style={{ background: "var(--violet-a2)", padding: "var(--space-3)" }}>
              <Flex direction="column" gap="1">
                <Text size="1" color="gray">Recipe Types</Text>
                <Flex align="center" gap="1" mt="1" wrap="wrap">
                  {(variantRecipeCount ?? 0) > 0 && (
                    <Badge color="violet" variant="soft" size="1">{variantRecipeCount} variant</Badge>
                  )}
                  {(addOnRecipeCount ?? 0) > 0 && (
                    <Badge color="orange" variant="soft" size="1">{addOnRecipeCount} add-on</Badge>
                  )}
                </Flex>
              </Flex>
            </Card>
          </Grid>
        )}

        {/* Inventory Callout */}
        <Callout.Root color="blue" variant="soft">
          <Callout.Icon>
            <InventoryOutlined />
          </Callout.Icon>
          <Callout.Text>
            <Flex justify="between" align="center" gap="3" wrap="wrap">
              <Text size="2">
                Production capacity for this product depends on inventory levels per variant.
                Manage ingredient stock levels in the Inventory module.
              </Text>
              {onNavigateToInventory && (
                <Button size="1" variant="soft" color="blue" onClick={onNavigateToInventory}>
                  Go to Inventory →
                </Button>
              )}
            </Flex>
          </Callout.Text>
        </Callout.Root>

        <Separator size="4" />

        {/* Recipe sections */}
        {showTabs ? (
          <Tabs.Root defaultValue="variants">
            <Tabs.List>
              <Tabs.Trigger value="variants">
                <Flex align="center" gap="2">
                  Variant Recipes
                  {!isLoading && variantRecipes.length > 0 && (
                    <Badge color="violet" variant="soft" size="1">{variantRecipes.length}</Badge>
                  )}
                </Flex>
              </Tabs.Trigger>
              <Tabs.Trigger value="addons">
                <Flex align="center" gap="2">
                  Add-On Recipes
                  {!isLoading && addOnRecipes.length > 0 && (
                    <Badge color="orange" variant="soft" size="1">{addOnRecipes.length}</Badge>
                  )}
                </Flex>
              </Tabs.Trigger>
            </Tabs.List>
            <Box pt="4">
              <Tabs.Content value="variants">{variantSection}</Tabs.Content>
              <Tabs.Content value="addons">{addOnSection}</Tabs.Content>
            </Box>
          </Tabs.Root>
        ) : (
          <>
            {(variantRecipeCount ?? 0) > 0 && (
              <>
                <Flex align="center" gap="2">
                  <LocalDiningOutlined style={{ color: "var(--violet-11)" }} />
                  <Heading size="3">Variant Recipes</Heading>
                </Flex>
                {variantSection}
              </>
            )}
            {(addOnRecipeCount ?? 0) > 0 && (
              <>
                <Flex align="center" gap="2">
                  <LocalDiningOutlined style={{ color: "var(--orange-11)" }} />
                  <Heading size="3">Add-On Recipes</Heading>
                </Flex>
                {addOnSection}
              </>
            )}
          </>
        )}
      </Flex>
    </motion.div>
  );
};
