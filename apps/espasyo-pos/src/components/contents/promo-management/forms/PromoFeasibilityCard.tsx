import React from "react";
import {
  Badge,
  Box,
  Flex,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Button,
  Callout,
  Card,
  Skeleton,
  Table,
} from "@radix-ui/themes";;
import {
  CheckCircleOutlined,
  ErrorOutlined,
  OpenInNewOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import {
  PromoFeasibilityItemResultDto,
  PromoFeasibilityResultDto,
} from "core-lib/api/commons/types";

interface PromoFeasibilityCardProps {
  result: PromoFeasibilityResultDto | null;
  loading: boolean;
  promoType: number;
  onCreatePO: (items: PromoFeasibilityItemResultDto[]) => void;
}

const StockStatusBadge: React.FC<{ item: PromoFeasibilityItemResultDto }> = ({ item }) => {
  if (item.willGoOutOfStock)
    return <Badge color="red" variant="solid" size="1">Stockout</Badge>;
  if (item.willHitReorder)
    return <Badge color="amber" variant="solid" size="1">Reorder</Badge>;
  if (item.willHitLowStock)
    return <Badge color="orange" variant="soft" size="1">Low Stock</Badge>;
  return <Badge color="green" variant="soft" size="1">In Stock</Badge>;
};

export const PromoFeasibilityCard: React.FC<PromoFeasibilityCardProps> = ({
  result,
  loading,
  promoType,
  onCreatePO,
}) => {
  if (loading) {
    return (
      <Card variant="surface" style={{ border: "1px solid var(--indigo-a5)" }}>
        <Flex direction="column" gap="2">
          <Skeleton height="20px" width="60%" />
          <Skeleton height="16px" />
          <Skeleton height="16px" />
          <Skeleton height="16px" />
        </Flex>
      </Card>
    );
  }

  if (!result) return null;

  const reorderItems = result.items.filter(
    (i) => i.willHitReorder || i.willGoOutOfStock,
  );
  const showCustomerCapacity = (promoType === 3 || promoType === 4) && result.customerCapacity != null;

  return (
    <Card variant="surface" style={{ border: "1px solid var(--indigo-a5)", background: "var(--color-background)" }}>
      {/* Header */}
      <Flex align="center" gap="2" mb="3">
        {result.stockIsAdequate ? (
          <CheckCircleOutlined style={{ fontSize: 18, color: "var(--green-11)" }} />
        ) : (
          <WarningAmberOutlined style={{ fontSize: 18, color: "var(--amber-11)" }} />
        )}
        <Text size="3" weight="bold">Stock Feasibility</Text>
        <Badge
          color={result.stockIsAdequate ? "green" : "amber"}
          variant="solid"
          size="1"
          ml="auto"
        >
          {result.stockIsAdequate ? "Adequate" : "At Risk"}
        </Badge>
      </Flex>

      {/* Context label */}
      <Text size="1" color="gray" style={{ display: "block", marginBottom: 8, fontStyle: "italic" }}>
        {promoType === 3
          ? "Based on current stock — buy items and free items both need enough inventory."
          : promoType === 4
          ? "All bundle items need stock. Max customers = how many complete bundles are possible."
          : "Based on current stock for the selected product(s)."}
      </Text>

      {/* Capacity chips */}
      <Flex gap="2" wrap="wrap" mb="3">
        <Card variant="surface" style={{ background: "var(--violet-a2)", border: "1px solid var(--violet-a5)", padding: "6px 12px" }}>
          <Flex direction="column" align="center" gap="1">
            <Text size="1" color="gray">Can Fulfill</Text>
            <Text size="4" weight="bold" style={{ color: "var(--violet-11)" }}>
              {result.canFulfillCount}
            </Text>
            <Text size="1" color="gray">promo uses</Text>
          </Flex>
        </Card>
        {showCustomerCapacity && (
          <Card variant="surface" style={{ background: "var(--green-a2)", border: "1px solid var(--green-a5)", padding: "6px 12px" }}>
            <Flex direction="column" align="center" gap="1">
              <Text size="1" color="gray">Max Customers</Text>
              <Text size="4" weight="bold" style={{ color: "var(--green-11)" }}>
                {result.customerCapacity}
              </Text>
              <Text size="1" color="gray">can use this promo</Text>
            </Flex>
          </Card>
        )}
        {result.scheduledDays != null && (
          <Card variant="surface" style={{ background: "var(--blue-a2)", border: "1px solid var(--blue-a5)", padding: "6px 12px" }}>
            <Flex direction="column" align="center" gap="1">
              <Text size="1" color="gray">Schedule</Text>
              <Text size="4" weight="bold" style={{ color: "var(--blue-11)" }}>
                {result.scheduledDays}
              </Text>
              <Text size="1" color="gray">days</Text>
            </Flex>
          </Card>
        )}
      </Flex>

      {/* Per-item table */}
      <Box mb="3" style={{ overflowX: "auto" }}>
        <Table.Root size="1" variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Product</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Stock</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Daily Use</Table.ColumnHeaderCell>
              {result.scheduledDays != null && (
                <Table.ColumnHeaderCell>Projected</Table.ColumnHeaderCell>
              )}
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {result.items.map((item) => (
              <Table.Row key={item.productID}>
                <Table.Cell>
                  <Text size="2">{item.productName}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="2">{item.currentStock.toFixed(2)}</Text>
                  {item.reorderLevel > 0 && (
                    <Text size="1" color="gray" style={{ display: "block" }}>
                      reorder @ {item.reorderLevel}
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Text size="2">
                    {item.averageDailyUsage != null
                      ? item.averageDailyUsage.toFixed(2)
                      : "—"}
                  </Text>
                </Table.Cell>
                {result.scheduledDays != null && (
                  <Table.Cell>
                    <Text size="2">
                      {item.projectedStockAfterPeriod != null
                        ? item.projectedStockAfterPeriod.toFixed(2)
                        : "—"}
                    </Text>
                    {item.shortfall != null && item.shortfall > 0 && (
                      <Text size="1" color="red" style={{ display: "block" }}>
                        -{item.shortfall.toFixed(2)} shortfall
                      </Text>
                    )}
                  </Table.Cell>
                )}
                <Table.Cell>
                  <StockStatusBadge item={item} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Warning callout */}
      {!result.stockIsAdequate && (
        <Callout.Root
          color={reorderItems.some((i) => i.willGoOutOfStock) ? "red" : "amber"}
          variant="soft"
          size="1"
          mb="3"
        >
          <Callout.Icon>
            <ErrorOutlined fontSize="small" />
          </Callout.Icon>
          <Callout.Text>
            {reorderItems.some((i) => i.willGoOutOfStock)
              ? "Some products will run out of stock during this promo period."
              : "Some products will hit their reorder threshold during this promo period."}{" "}
            Consider purchasing more stock before activating.
          </Callout.Text>
        </Callout.Root>
      )}

      {/* PO CTA */}
      {reorderItems.length > 0 && (
        <Button
          type="button"
          variant="solid"
          color="amber"
          size="2"
          onClick={() => onCreatePO(reorderItems)}
        >
          <OpenInNewOutlined fontSize="small" />
          Create Purchase Order for {reorderItems.length} product{reorderItems.length > 1 ? "s" : ""}
        </Button>
      )}
    </Card>
  );
};
