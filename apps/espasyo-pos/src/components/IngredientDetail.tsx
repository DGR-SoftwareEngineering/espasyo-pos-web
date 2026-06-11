import React from "react";
import { Avatar, Badge, Box, Flex, Grid, Text, Tooltip } from "@radix-ui/themes";
import { RecipeItemResponse } from "core-lib/api/commons/types";
import {
  NotesOutlined,
  ScaleOutlined,
  SwapHorizOutlined,
} from "@mui/icons-material";
import { IDChip } from "core-lib/components/radix/IDChip";
import { formatCurrency } from "core-lib/business/strings";

export const IngredientDetail: React.FC<{ ingredient: RecipeItemResponse }> = ({
  ingredient,
}) => {
  const hasUnitConversion =
    !!ingredient.purchaseUnitName &&
    !!ingredient.stockUnitName &&
    ingredient.purchaseUnitName !== ingredient.stockUnitName;

  const hasBatchPurchase =
    ingredient.ingredientCost !== ingredient.calculatedCost;
  const displayCost = ingredient.calculatedCost || ingredient.cost;
  const unitCost = displayCost / ingredient.quantityRequired;

  return (
    <Box
      p="3"
      style={{
        background: "var(--gray-a2)",
        border: "1px solid var(--gray-a4)",
        borderRadius: "var(--radius-3)",
      }}
    >
      <Flex direction="column" gap="2">
        {/* Header: Name + conversion badge + notes badge */}
        <Flex justify="between" align="start">
          <Flex align="center" gap="3">
            <Avatar
              size="2"
              radius="full"
              color="blue"
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
                    <SwapHorizOutlined style={{ fontSize: 12 }} />
                    {ingredient.purchaseUnitName} → {ingredient.stockUnitName}
                  </Badge>
                )}
              </Flex>
              <IDChip id={ingredient.ingredientProductID} label="ID" />
            </Box>
          </Flex>
          {ingredient.notes && (
            <Tooltip content={ingredient.notes}>
              <Badge
                color="amber"
                variant="soft"
                size="1"
                style={{ cursor: "help", flexShrink: 0 }}
              >
                <NotesOutlined style={{ fontSize: 12 }} />
                Note
              </Badge>
            </Tooltip>
          )}
        </Flex>

        {/* 3-column metric grid: Quantity | Cost | Unit Cost */}
        <Grid columns="3" gap="3" mt="1">
          {/* Quantity */}
          <Box
            p="2"
            style={{
              background: "var(--gray-a2)",
              border: "1px solid var(--gray-a3)",
              borderRadius: "var(--radius-2)",
            }}
          >
            <Text size="1" color="gray">
              Quantity
            </Text>
            <Flex align="center" gap="1" mt="1">
              <ScaleOutlined style={{ fontSize: 12, color: "var(--accent-11)" }} />
              <Text size="2" weight="medium">
                {ingredient.quantityRequired} {ingredient.unitName}
              </Text>
            </Flex>
            {hasUnitConversion && ingredient.costPerStockUnit && (
              <Text size="1" color="gray" mt="1">
                ≈ {formatCurrency(ingredient.costPerStockUnit)}/{ingredient.stockUnitName}
              </Text>
            )}
          </Box>

          {/* Cost (green highlighted) */}
          <Box
            p="2"
            style={{
              background: "var(--green-a2)",
              border: "1px solid var(--green-a3)",
              borderRadius: "var(--radius-2)",
            }}
          >
            <Text size="1" color="gray">
              Cost
            </Text><br />
            <Text size="3" weight="bold" style={{ color: "var(--green-11)" }} mt="1">
              {formatCurrency(displayCost)}
            </Text> <br />
            {hasBatchPurchase && (
              <Text size="1" color="gray" style={{ fontStyle: "italic" }} mt="1">
                Batch purchase
              </Text>
            )}
          </Box>

          {/* Unit Cost */}
          <Box
            p="2"
            style={{
              background: "var(--gray-a2)",
              border: "1px solid var(--gray-a3)",
              borderRadius: "var(--radius-2)",
            }}
          >
            <Text size="1" color="gray">
              Unit Cost
            </Text><br />
            <Text size="2" weight="medium" color="gray" mt="1">
              {formatCurrency(unitCost)}/{ingredient.unitName}
            </Text>
          </Box>
        </Grid>

        {/* Footer: Purchase details (if applicable) */}
        {(ingredient.purchaseQuantity || hasUnitConversion) && (
          <Box
            pt="2"
            style={{ borderTop: "1px dashed var(--gray-a4)" }}
          >
            <Flex gap="3" align="center" wrap="wrap">
              {ingredient.purchaseQuantity && ingredient.purchaseUnitName && (
                <Text size="1" color="gray">
                  📦 {ingredient.purchaseQuantity} {ingredient.purchaseUnitName} @{" "}
                  {formatCurrency(ingredient.ingredientCost)} total
                </Text>
              )}
              {ingredient.costPerStockUnit && ingredient.stockUnitName && (
                <Text size="1" color="gray">
                  = {formatCurrency(ingredient.costPerStockUnit)}/{ingredient.stockUnitName}
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
    </Box>
  );
};
