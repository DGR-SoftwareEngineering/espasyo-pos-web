import React from "react";
import { Avatar, Badge, Box, Flex, Text, Tooltip } from "@radix-ui/themes";
import { RecipeItemResponse } from "core-lib/api/commons/types";
import {
  InventoryOutlined,
  NotesOutlined,
  ScaleOutlined,
  SwapHorizOutlined,
  AttachMoneyOutlined,
} from "@mui/icons-material";
import { IDChip } from "core-lib/components/radix/IDChip";
import { MetricDisplay } from "core-lib/components/radix/metric/MetricDisplay";
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

  const tooltipContent = (
    <Box>
      <Text size="1" as="div">
        <strong>Calculated Cost:</strong> {formatCurrency(displayCost)}
      </Text>
      {hasBatchPurchase && (
        <Text size="1" as="div">
          <strong>Original Cost:</strong>{" "}
          {formatCurrency(ingredient.ingredientCost)} total
        </Text>
      )}
      {ingredient.purchaseQuantity && ingredient.purchaseUnitName && (
        <Text size="1" as="div">
          <strong>Purchase:</strong> {ingredient.purchaseQuantity}{" "}
          {ingredient.purchaseUnitName} @{" "}
          {formatCurrency(ingredient.ingredientCost)} total
        </Text>
      )}
      {ingredient.costPerStockUnit && (
        <Text size="1" as="div">
          <strong>Cost per {ingredient.stockUnitName}:</strong>{" "}
          {formatCurrency(ingredient.costPerStockUnit)}
        </Text>
      )}
    </Box>
  );

  return (
    <Box
      p="3"
      style={{
        background: "var(--gray-a2)",
        border: "1px solid var(--gray-a4)",
        borderRadius: "var(--radius-3)",
        transition: "all 0.2s",
      }}
    >
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)",
          gap: "var(--space-3)",
          alignItems: "center",
        }}
      >
        <Box>
          <Flex align="center" gap="3">
            <Avatar
              size="2"
              radius="medium"
              color="blue"
              fallback={<InventoryOutlined />}
            />
            <Box>
              <Flex align="center" gap="2" wrap="wrap">
                <Text size="2" weight="bold">
                  {ingredient.ingredientName}
                </Text>
                {hasUnitConversion && (
                  <Badge color="blue" variant="soft" radius="full" size="1">
                    <SwapHorizOutlined style={{ fontSize: 14 }} />
                    {ingredient.purchaseUnitName} → {ingredient.stockUnitName}
                  </Badge>
                )}
              </Flex>
              <IDChip id={ingredient.ingredientProductID} label="ID" />
            </Box>
          </Flex>
        </Box>

        <Box>
          <MetricDisplay
            label="Quantity"
            value={`${ingredient.quantityRequired} ${ingredient.unitName}`}
            icon={<ScaleOutlined />}
            iconColor="var(--accent-11)"
          />
          {hasUnitConversion &&
            ingredient.quantityRequired &&
            ingredient.costPerStockUnit && (
              <Text size="1" color="gray" as="div" mt="1">
                ≈ {formatCurrency(ingredient.costPerStockUnit)} per{" "}
                {ingredient.stockUnitName}
              </Text>
            )}
        </Box>

        <Box>
          <Tooltip content={tooltipContent as unknown as string}>
            <Box>
              <MetricDisplay
                label="Cost"
                value={formatCurrency(displayCost)}
                valueColor="var(--green-11)"
                icon={<AttachMoneyOutlined />}
                showTooltip
              />
            </Box>
          </Tooltip>
          {hasBatchPurchase && (
            <Text size="1" color="gray" as="div" mt="1">
              <em>Calculated from batch purchase</em>
            </Text>
          )}
        </Box>

        <Box>
          <MetricDisplay
            label="Unit Cost"
            value={`${formatCurrency(displayCost / ingredient.quantityRequired)}/${ingredient.unitName}`}
            valueColor="var(--gray-11)"
          />
        </Box>

        <Box>
          {ingredient.notes ? (
            <Tooltip content={ingredient.notes}>
              <Badge
                color="amber"
                variant="soft"
                radius="medium"
                style={{ cursor: "help" }}
              >
                <NotesOutlined style={{ fontSize: 14 }} />
                Has notes
              </Badge>
            </Tooltip>
          ) : (
            <Text size="1" color="gray">
              No notes
            </Text>
          )}
        </Box>
      </Box>

      {(ingredient.purchaseQuantity || hasUnitConversion) && (
        <Box
          mt="3"
          pt="3"
          style={{ borderTop: "1px solid var(--gray-a4)" }}
        >
          <Flex gap="3" align="center" wrap="wrap">
            {ingredient.purchaseQuantity && ingredient.purchaseUnitName && (
              <Text size="1" color="gray">
                Purchased: {ingredient.purchaseQuantity}{" "}
                {ingredient.purchaseUnitName} at{" "}
                {formatCurrency(ingredient.ingredientCost)} total
              </Text>
            )}
            {ingredient.costPerStockUnit && ingredient.stockUnitName && (
              <Text size="1" color="gray">
                Cost per {ingredient.stockUnitName}:{" "}
                {formatCurrency(ingredient.costPerStockUnit)}
              </Text>
            )}
            {hasUnitConversion && (
              <Text size="1" color="gray">
                Unit conversion applied: {ingredient.purchaseUnitName} →{" "}
                {ingredient.stockUnitName}
              </Text>
            )}
          </Flex>
        </Box>
      )}
    </Box>
  );
};
