import React, { memo, useMemo } from "react";
import { Box, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { BarChartIcon } from "@radix-ui/react-icons";
import { ChartEmpty, ChartLoader } from "core-lib/components/radix/charts";
import type { SupplierInvoiceDto } from "core-lib/api/commons/types";
import { formatCurrency } from "../../contents/procurement/format";

interface ProcurementTrendCardProps {
  invoices: SupplierInvoiceDto[];
  loading: boolean;
  currencyCode: string;
}

const ProcurementTrendCardInner: React.FC<ProcurementTrendCardProps> = ({ invoices, loading, currencyCode }) => {
  const monthlyData = useMemo(() => {
    const map: Record<string, { label: string; total: number; paid: number }> = {};
    for (const inv of invoices) {
      if (!inv.invoiceDate) continue;
      const d = new Date(inv.invoiceDate);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map[key]) {
        map[key] = {
          label: d.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
          total: 0,
          paid: 0,
        };
      }
      map[key].total += inv.totalAmount;
      map[key].paid += inv.paidAmount;
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([, d]) => d);
  }, [invoices]);

  const maxTotal = Math.max(...monthlyData.map((d) => d.total), 1);
  const grandTotal = monthlyData.reduce((s, d) => s + d.total, 0);

  return (
    <Card size="3" variant="surface" style={{ height: "100%" }}>
      <Flex direction="column" gap="3" style={{ height: "100%" }}>
        <Flex align="start" justify="between" gap="3">
          <Flex align="center" gap="3" style={{ minWidth: 0 }}>
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-3)",
                background: "var(--accent-a3)",
                color: "var(--accent-11)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <BarChartIcon />
            </Box>
            <Box style={{ minWidth: 0 }}>
              <Heading size="3" weight="medium" truncate>
                Procurement Cost Trend
              </Heading>
              <Text size="1" color="gray" truncate>
                Monthly purchase spend (last 8 months)
              </Text>
            </Box>
          </Flex>
          {!loading && grandTotal > 0 && (
            <Text size="2" weight="bold" color="amber" style={{ flexShrink: 0 }}>
              {formatCurrency(grandTotal, currencyCode)}
            </Text>
          )}
        </Flex>

        <Box style={{ flex: 1 }}>
          {loading ? (
            <ChartLoader height={260} variant="cartesian" />
          ) : monthlyData.length === 0 ? (
            <ChartEmpty height={260} hint="No procurement data found" />
          ) : (
            <Flex direction="column" gap="2" style={{ height: "100%" }}>
              {monthlyData.map((m) => {
                const barPct = (m.total / maxTotal) * 100;
                const paidPct = m.total > 0 ? (m.paid / m.total) * 100 : 0;
                return (
                  <Box key={m.label}>
                    <Flex justify="between" align="center" mb="1">
                      <Text size="1" color="gray" weight="medium">
                        {m.label}
                      </Text>
                      <Flex align="center" gap="3">
                        <Text size="1" color="gray">
                          Paid:{" "}
                          <Text weight="medium" style={{ color: "var(--green-11)" }}>
                            {formatCurrency(m.paid, currencyCode)}
                          </Text>
                        </Text>
                        <Text size="1" weight="bold">
                          {formatCurrency(m.total, currencyCode)}
                        </Text>
                      </Flex>
                    </Flex>
                    <Box
                      style={{
                        height: 10,
                        borderRadius: 999,
                        background: "var(--amber-a3)",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <Box
                        style={{
                          height: "100%",
                          width: `${barPct}%`,
                          background: "var(--amber-a6)",
                          borderRadius: 999,
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: `${paidPct}%`,
                            background: "var(--green-9)",
                            borderRadius: 999,
                            transition: "width 0.5s ease",
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                );
              })}
              <Flex gap="3" mt="1">
                <Flex align="center" gap="1">
                  <Box style={{ width: 10, height: 10, borderRadius: 2, background: "var(--green-9)" }} />
                  <Text size="1" color="gray">Paid</Text>
                </Flex>
                <Flex align="center" gap="1">
                  <Box style={{ width: 10, height: 10, borderRadius: 2, background: "var(--amber-a6)" }} />
                  <Text size="1" color="gray">Total ordered</Text>
                </Flex>
              </Flex>
            </Flex>
          )}
        </Box>
      </Flex>
    </Card>
  );
};

export const ProcurementTrendCard = memo(ProcurementTrendCardInner);
ProcurementTrendCard.displayName = "ProcurementTrendCard";
