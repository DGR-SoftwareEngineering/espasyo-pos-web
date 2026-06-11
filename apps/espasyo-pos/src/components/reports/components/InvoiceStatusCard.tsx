import React, { memo, useMemo } from "react";
import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  Text,
} from "@radix-ui/themes";
import { ReceiptLongOutlined } from "@mui/icons-material";
import { ChartEmpty, ChartLoader } from "core-lib/components/radix/charts";
import type { SupplierInvoiceDto } from "core-lib/api/commons/types";
import { INVOICE_STATUS_META } from "../../contents/procurement/constants";
import { formatCurrency } from "../../contents/procurement/format";
import { STATUS_ORDER } from "../constants";

interface InvoiceStatusCardProps {
  invoices: SupplierInvoiceDto[];
  loading: boolean;
  currencyCode: string;
}

const InvoiceStatusCardInner: React.FC<InvoiceStatusCardProps> = ({ invoices, loading, currencyCode }) => {
  const grouped = useMemo(() => {
    const map: Record<number, { count: number; total: number }> = {};
    for (const inv of invoices) {
      if (!map[inv.status]) map[inv.status] = { count: 0, total: 0 };
      map[inv.status].count++;
      map[inv.status].total += inv.totalAmount;
    }
    return map;
  }, [invoices]);

  const totalCount = invoices.length;

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
              <ReceiptLongOutlined style={{ fontSize: 18 }} />
            </Box>
            <Box style={{ minWidth: 0 }}>
              <Heading size="3" weight="medium" truncate>
                Invoice Status
              </Heading>
              <Text size="1" color="gray" truncate>
                Supplier invoices by payment state
              </Text>
            </Box>
          </Flex>
          <Badge variant="soft" color="gray" radius="full" size="1">
            {totalCount} invoices
          </Badge>
        </Flex>

        <Box style={{ flex: 1 }}>
          {loading ? (
            <ChartLoader height={260} variant="donut" />
          ) : totalCount === 0 ? (
            <ChartEmpty height={260} hint="No supplier invoices found" />
          ) : (
            <Flex direction="column" gap="2">
              {STATUS_ORDER.map((status) => {
                const meta = INVOICE_STATUS_META[status];
                const entry = grouped[status];
                if (!entry) return null;
                const pct = totalCount > 0 ? (entry.count / totalCount) * 100 : 0;
                return (
                  <Box
                    key={status}
                    p="3"
                    style={{
                      borderRadius: "var(--radius-3)",
                      background: `var(--${meta.color}-a2)`,
                      border: `1px solid var(--${meta.color}-a4)`,
                    }}
                  >
                    <Flex justify="between" align="center" gap="2" mb="2">
                      <Flex align="center" gap="2" style={{ minWidth: 0 }}>
                        <Box
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: `var(--${meta.color}-9)`,
                            flexShrink: 0,
                          }}
                        />
                        <Text
                          size="2"
                          weight="medium"
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {meta.label}
                        </Text>
                        <Badge color={meta.color} variant="soft" size="1">
                          {entry.count}
                        </Badge>
                      </Flex>
                      <Text
                        size="2"
                        weight="bold"
                        style={{
                          color: `var(--${meta.color}-11)`,
                          flexShrink: 0,
                        }}
                      >
                        {formatCurrency(entry.total, currencyCode)}
                      </Text>
                    </Flex>
                    <Box
                      style={{
                        height: 5,
                        borderRadius: 999,
                        background: `var(--${meta.color}-a3)`,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: `var(--${meta.color}-9)`,
                          transition: "width 0.5s ease",
                          borderRadius: 999,
                        }}
                      />
                    </Box>
                    <Text size="1" color="gray" mt="1" as="div">
                      {pct.toFixed(0)}% of total invoices
                    </Text>
                  </Box>
                );
              })}
            </Flex>
          )}
        </Box>
      </Flex>
    </Card>
  );
};

export const InvoiceStatusCard = memo(InvoiceStatusCardInner);
InvoiceStatusCard.displayName = "InvoiceStatusCard";
