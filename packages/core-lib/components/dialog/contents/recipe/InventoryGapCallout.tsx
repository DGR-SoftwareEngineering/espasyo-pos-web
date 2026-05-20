import React, { useEffect, useState } from "react";
import { Box, Callout, Flex, Heading, Table, Text } from "@radix-ui/themes";
import { WarningAmberOutlined } from "@mui/icons-material";
import { Button } from "../../../radix/buttons/Button";
import type { UntrackedSalesGapDto } from "../../../../api/commons/types";

interface InventoryGapCalloutProps {
  menuItemName: string;
  gaps: UntrackedSalesGapDto[];
  onDismiss: () => void;
}

export const InventoryGapCallout: React.FC<InventoryGapCalloutProps> = ({
  menuItemName,
  gaps,
  onDismiss,
}) => {
  const [autoDismissCountdown, setAutoDismissCountdown] = useState<number | null>(
    null,
  );

  useEffect(() => {
    // Optional: uncomment for 5-second auto-dismiss with countdown
    // setAutoDismissCountdown(5);
  }, []);

  useEffect(() => {
    if (autoDismissCountdown === null) return;
    if (autoDismissCountdown === 0) {
      onDismiss();
      return;
    }
    const timer = setTimeout(() => {
      setAutoDismissCountdown((prev) => (prev === null ? null : prev - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [autoDismissCountdown, onDismiss]);

  if (!gaps || gaps.length === 0) return null;

  const untrackedSaleCount = gaps[0]?.untrackedSaleCount ?? 0;

  const formatQuantity = (qty: number): string => {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(qty);
  };

  return (
    <Callout.Root color="amber" variant="surface" size="2" mb="4">
      <Flex gap="2">
        <Box style={{ flexShrink: 0, marginTop: 2 }}>
          <WarningAmberOutlined style={{ fontSize: 20, color: "var(--amber-11)" }} />
        </Box>
        <Box style={{ flex: 1 }}>
          <Heading size="3" weight="bold" mb="2" style={{ color: "var(--amber-11)" }}>
            ⚠️ Inventory gap detected
          </Heading>

          <Text size="2" as="div" mb="3" color="gray">
            <strong>{menuItemName}</strong> was sold <strong>{untrackedSaleCount}</strong>{" "}
            time{untrackedSaleCount === 1 ? "" : "s"} before this recipe existed. Based on
            the recipe you just configured, an estimated amount of ingredients was consumed
            without being tracked:
          </Text>

          {/* Table */}
          <Box
            mb="3"
            style={{
              borderRadius: "var(--radius-2)",
              overflow: "hidden",
              border: "1px solid var(--gray-a6)",
            }}
          >
            <Table.Root>
              <Table.Header>
                <Table.Row style={{ background: "var(--gray-a3)" }}>
                  <Table.ColumnHeaderCell>Ingredient</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell style={{ textAlign: "right" }}>
                    Estimated unaccounted
                  </Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {gaps.map((gap) => (
                  <Table.Row key={gap.ingredientProductId}>
                    <Table.Cell>
                      <Text size="2">{gap.ingredientName}</Text>
                    </Table.Cell>
                    <Table.Cell style={{ textAlign: "right" }}>
                      <Text size="2" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {formatQuantity(gap.estimatedUnaccountedQuantity)} {gap.unitName}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>

          <Text size="1" color="gray" as="div" mb="3">
            We recommend doing a <strong>physical stock count</strong> for these ingredients
            and adjusting inventory manually to reflect actual quantities on hand.
          </Text>

          <Flex gap="2">
            <Button type="Primary" onClick={onDismiss}>
              Got it
              {autoDismissCountdown !== null && autoDismissCountdown > 0
                ? ` (${autoDismissCountdown}s)`
                : ""}
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Callout.Root>
  );
};
