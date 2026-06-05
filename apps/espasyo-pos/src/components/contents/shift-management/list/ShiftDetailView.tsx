import React from "react";
import { Badge, Box, Card, Flex, Separator, Text } from "@radix-ui/themes";
import { ShiftSummaryDto } from "core-lib/api/commons/types";
import { formatCurrency } from "core-lib/business/strings";
import { STATUS_CONFIG } from "../constants";

interface Props {
  summary: ShiftSummaryDto;
}

const Row: React.FC<{ label: string; value: React.ReactNode; bold?: boolean }> = ({
  label,
  value,
  bold,
}) => (
  <Flex justify="between" align="center" py="1">
    <Text size="2" color="gray">
      {label}
    </Text>
    <Text size="2" weight={bold ? "bold" : "medium"}>
      {value}
    </Text>
  </Flex>
);

const formatDateTime = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const ShiftDetailView: React.FC<Props> = ({ summary }) => {
  const statusCfg = STATUS_CONFIG[summary.status];
  const overShort = summary.overShort;
  const overShortColor =
    overShort == null
      ? undefined
      : overShort > 0
      ? "var(--green-11)"
      : overShort < 0
      ? "var(--red-11)"
      : undefined;

  return (
    <Box>
      {/* Header */}
      <Flex align="center" justify="between" mb="4">
        <Box>
          <Text size="3" weight="bold" as="div">
            {summary.cashierName}
          </Text>
          <Text size="2" color="gray" as="div">
            Shift {summary.shiftNumber}
          </Text>
        </Box>
        <Badge color={statusCfg.color} variant="soft" size="2">
          {statusCfg.label}
        </Badge>
      </Flex>

      {/* Timing */}
      <Card variant="surface" size="2" mb="3" style={{ background: "var(--gray-a2)" }}>
        <Row label="Opened At" value={formatDateTime(summary.openedAt)} />
        <Row label="Closed At" value={formatDateTime(summary.closedAt)} />
      </Card>

      {/* Cash summary */}
      <Card variant="surface" size="2" mb="3" style={{ background: "var(--gray-a2)" }}>
        <Text size="1" weight="bold" color="gray" mb="2" as="div" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Cash Summary
        </Text>
        <Row label="Opening Cash" value={formatCurrency(summary.openingCash)} />
        <Separator size="4" my="2" />
        <Row label="Cash Sales" value={formatCurrency(summary.cashSales)} />
        <Row label="Non-Cash Sales" value={formatCurrency(summary.nonCashSales)} />
        <Row label="Total Refunds" value={formatCurrency(summary.totalRefunds)} />
        <Separator size="4" my="2" />
        <Row label="Total Sales" value={formatCurrency(summary.totalSales)} bold />
        <Row label="Transactions" value={summary.transactionCount} />
      </Card>

      {/* Closing reconciliation */}
      {summary.status === "Closed" && (
        <Card variant="surface" size="2" mb="3" style={{ background: "var(--gray-a2)" }}>
          <Text size="1" weight="bold" color="gray" mb="2" as="div" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Reconciliation
          </Text>
          <Row label="Expected Cash" value={formatCurrency(summary.expectedCash)} />
          <Row label="Actual Cash" value={summary.actualCash != null ? formatCurrency(summary.actualCash) : "—"} />
          <Separator size="4" my="2" />
          <Row
            label="Over / Short"
            value={
              overShort != null ? (
                <Text size="2" weight="bold" style={{ color: overShortColor }}>
                  {overShort > 0 ? "+" : ""}{formatCurrency(overShort)}
                </Text>
              ) : (
                "—"
              )
            }
            bold
          />
        </Card>
      )}

      {/* By payment method */}
      {summary.byPaymentMethod && Object.keys(summary.byPaymentMethod).length > 0 && (
        <Card variant="surface" size="2" style={{ background: "var(--gray-a2)" }}>
          <Text size="1" weight="bold" color="gray" mb="2" as="div" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
            By Payment Method
          </Text>
          {Object.entries(summary.byPaymentMethod).map(([method, amount]) => (
            <Row key={method} label={method} value={formatCurrency(amount)} />
          ))}
        </Card>
      )}

      {summary.notes && (
        <Box mt="3">
          <Text size="1" color="gray" weight="bold" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Notes
          </Text>
          <Text size="2" as="p" mt="1">
            {summary.notes}
          </Text>
        </Box>
      )}
    </Box>
  );
};
