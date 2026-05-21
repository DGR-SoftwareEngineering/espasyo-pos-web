import React from "react";
import { Box, Card, Flex, Heading, Table, Text } from "@radix-ui/themes";
import { formatCurrency } from "../contents/procurement/format";

interface FinancialData {
  currencyCode: string;
  grossSales: number | null;
  cogs: number | null;
  grossProfit: number | null;
  operationalExpenses: number | null;
  businessSupplyExpenses: number | null;
  totalExpenses: number | null;
  netProfit: number | null;
  totalTransactions: number | null;
  inventoryValue: number | null;
  lowStockCount: number | null;
}

interface FinancialSummaryTableProps {
  data: FinancialData;
}

export const FinancialSummaryTable: React.FC<FinancialSummaryTableProps> = ({
  data,
}) => {
  const rows = [
    {
      category: "Revenue",
      label: "Gross Sales",
      value: data.grossSales,
      color: "green",
    },
    {
      category: "Cost of Goods",
      label: "COGS (Cost of Goods Sold)",
      value: data.cogs,
      color: "amber",
    },
    {
      category: "Profitability",
      label: "Gross Profit",
      value: data.grossProfit,
      color: "blue",
      isBold: true,
    },
    {
      category: "Expenses",
      label: "Operational Expenses",
      value: data.operationalExpenses,
      color: "red",
      indent: true,
    },
    {
      category: "Expenses",
      label: "Business Supply Expenses",
      value: data.businessSupplyExpenses,
      color: "red",
      indent: true,
    },
    {
      category: "Expenses",
      label: "Total Expenses",
      value: data.totalExpenses,
      color: "crimson",
      isBold: true,
    },
    {
      category: "Bottom Line",
      label: "Net Profit",
      value: data.netProfit,
      color: "jade",
      isBold: true,
    },
  ];

  return (
    <Card variant="surface" size="3">
      <Flex direction="column" gap="4">
        <Flex direction="column" gap="1">
          <Heading size="4" weight="bold">
            Financial Summary
          </Heading>
          <Text size="2" color="gray">
            Key financial metrics for the selected period
          </Text>
        </Flex>

        <Box style={{ overflowX: "auto" }}>
          <Table.Root>
            <Table.Header>
              <Table.Row style={{ background: "var(--accent-a2)" }}>
                <Table.ColumnHeaderCell style={{ textAlign: "left" }}>
                  Metric
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell style={{ textAlign: "right" }}>
                  Amount
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {rows.map((row, index) => {
                const isNegative = row.value !== null && row.value < 0;
                const displayValue = row.value;
                return (
                  <Table.Row
                    key={`${row.label}-${index}`}
                    style={{
                      background:
                        row.isBold ? "var(--accent-a1)" : undefined,
                      borderTop:
                        row.isBold && index > 0
                          ? "2px solid var(--accent-a4)"
                          : undefined,
                    }}
                  >
                    <Table.Cell
                      style={{
                        textAlign: "left",
                        paddingLeft: row.indent ? 32 : undefined,
                      }}
                    >
                      <Text
                        size="2"
                        weight={row.isBold ? "bold" : "medium"}
                      >
                        {row.label}
                      </Text>
                    </Table.Cell>
                    <Table.Cell style={{ textAlign: "right" }}>
                      <Text
                        size="2"
                        weight={row.isBold ? "bold" : "medium"}
                        style={{
                          color: isNegative
                            ? "var(--red-11)"
                            : `var(--${row.color}-11)`,
                        }}
                      >
                        {displayValue !== null
                          ? formatCurrency(displayValue, data.currencyCode)
                          : "—"}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        </Box>

        {/* Quick Stats */}
        <Box
          style={{
            borderTop: "1px solid var(--gray-a5)",
            paddingTop: 16,
          }}
        >
          <Flex gap="4" wrap="wrap">
            <Box>
              <Text size="1" color="gray" weight="medium">
                Transactions
              </Text>
              <Text size="3" weight="bold">
                {data.totalTransactions ?? "—"}
              </Text>
            </Box>
            <Box>
              <Text size="1" color="gray" weight="medium">
                Inventory Value
              </Text>
              <Text size="3" weight="bold">
                {data.inventoryValue !== null
                  ? formatCurrency(data.inventoryValue, data.currencyCode)
                  : "—"}
              </Text>
            </Box>
            <Box>
              <Text size="1" color="gray" weight="medium">
                Low Stock Items
              </Text>
              <Text size="3" weight="bold" style={{ color: "var(--amber-11)" }}>
                {data.lowStockCount ?? "—"}
              </Text>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </Card>
  );
};
