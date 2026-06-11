import React, { useCallback, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Text,
} from "@radix-ui/themes";
import { ChevronLeftIcon, ChevronRightIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useApi } from "core-lib/core/hooks";
import { useDialogContext } from "core-lib";
import { usePublicSettings } from "core-lib/core/contexts";
import type { OrderDto, SaleDetailDto } from "core-lib/api/commons/types";
import type { OrderDetailDialogData } from "core-lib/api/content/types/common";
import { SaleReceiptPrintable } from "../../contents/pos/printables/SaleReceiptPrintable";
import { formatCurrency } from "../../contents/procurement/format";
import { getStatusBadge } from "../types";
import { tableStyles } from "../styles";
import type { DailyTransactionsPanelProps } from "../types";

export const DailyTransactionsPanel: React.FC<DailyTransactionsPanelProps> = ({
  date,
  summary,
  onClose,
}) => {
  const { openDialog } = useDialogContext();
  const { systemName, theme, currencyCode, pos } = usePublicSettings();
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 20;

  const ordersApi = useApi(
    (api) => {
      if (!date) return Promise.resolve(null);
      const d = new Date(date + "T12:00:00");
      d.setDate(d.getDate() + 1);
      const exclusiveToDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return api.commons.orderList({
        fromDate: date,
        toDate: exclusiveToDate,
        pageNumber,
        pageSize,
      });
    },
    [date, pageNumber],
  );

  const orders = (ordersApi.result?.data?.response?.items ?? []) as OrderDto[];
  const pagination = ordersApi.result?.data?.response;
  const totalPages = pagination?.totalPages ?? 1;
  const actualSalesCount = (pagination as unknown as Record<string, unknown>)?.totalCount as number ?? orders.length;
  const actualDayTotal = orders.reduce((sum, o) => sum + ((o as unknown as Record<string, number>).totalAmount ?? 0), 0);

  const renderReceipt = useCallback(
    (sale: SaleDetailDto) => (
      <SaleReceiptPrintable
        sale={sale}
        businessName={systemName}
        logoUrl={theme?.logoUrl ?? null}
        currencyCode={currencyCode}
        receiptHeader={pos.receiptHeader}
        receiptFooter={pos.receiptFooter}
      />
    ),
    [systemName, theme, currencyCode, pos],
  );

  const handleRowClick = useCallback(
    (order: OrderDto) => {
      openDialog({
        title: `Order \u00B7 ${order.orderNumber}`,
        dialogContentType: "OrderDetail",
        data: {
          orderID: order.orderID,
          renderReceipt,
          onStateChange: () => setPageNumber(1),
        } as OrderDetailDialogData,
      });
    },
    [openDialog, renderReceipt],
  );

  const dateFormatted = date
    ? new Date(date + "T12:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <Dialog.Root open={date !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content
        style={{
          maxWidth: "860px",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <Flex justify="between" align="center" mb="4">
          <Heading size="5" weight="bold">
            Transactions \u2014 {dateFormatted}
          </Heading>
          <Dialog.Close>
            <IconButton size="2" variant="ghost">
              <Cross2Icon />
            </IconButton>
          </Dialog.Close>
        </Flex>

        <Flex gap="2" mb="4">
          <Card
            style={{
              padding: "12px 16px",
              background: "var(--indigo-a2)",
              border: "1px solid var(--indigo-a5)",
            }}
          >
            <Flex direction="column" gap="1">
              <Text size="1" color="gray" weight="medium">
                Daily Total
              </Text>
              <Text size="3" weight="bold" style={{ color: "var(--indigo-11)" }}>
                {formatCurrency(ordersApi.loading ? (summary?.totalAmount ?? 0) : actualDayTotal)}
              </Text>
            </Flex>
          </Card>
          <Card
            style={{
              padding: "12px 16px",
              background: "var(--amber-a2)",
              border: "1px solid var(--amber-a5)",
            }}
          >
            <Flex direction="column" gap="1">
              <Text size="1" color="gray" weight="medium">
                Transactions
              </Text>
              <Text size="3" weight="bold" style={{ color: "var(--amber-11)" }}>
                {ordersApi.loading ? (summary?.salesCount ?? 0) : actualSalesCount}
              </Text>
            </Flex>
          </Card>
        </Flex>

        {ordersApi.loading && (
          <Flex justify="center" align="center" style={{ minHeight: "200px" }}>
            <Spinner size="3" />
          </Flex>
        )}

        {!ordersApi.loading && orders.length > 0 && (
          <>
            <style>{tableStyles}</style>

            <Box style={{ overflowX: "auto", marginBottom: "16px" }}>
              <table className="daily-orders-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Time</th>
                    <th>Cashier</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const badge = getStatusBadge(order.status);
                    const time = order.completedAt
                      ? new Date(order.completedAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "\u2014";
                    return (
                      <tr key={order.orderID} onClick={() => handleRowClick(order)}>
                        <td style={{ fontWeight: 500 }}>{order.orderNumber}</td>
                        <td>{time}</td>
                        <td>{order.cashierName}</td>
                        <td>{order.paymentSummary}</td>
                        <td>
                          <Badge size="1" color={badge.color}>
                            {order.statusName || badge.label}
                          </Badge>
                        </td>
                        <td style={{ fontWeight: 500 }}>
                          {order.refundedAmount > 0 && (
                            <div style={{ textDecoration: "line-through", color: "var(--gray-9)" }}>
                              {formatCurrency(order.totalAmount)}
                            </div>
                          )}
                          <div>{formatCurrency(order.totalAmount - order.refundedAmount)}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>

            <Flex justify="between" align="center" mt="3">
              <Text size="1" color="gray">
                Page {pageNumber} of {totalPages}
              </Text>
              <Flex gap="2">
                <Button
                  size="1"
                  variant="soft"
                  disabled={pageNumber === 1}
                  onClick={() => setPageNumber((n) => Math.max(1, n - 1))}
                >
                  <ChevronLeftIcon />
                </Button>
                <Button
                  size="1"
                  variant="soft"
                  disabled={pageNumber >= totalPages}
                  onClick={() => setPageNumber((n) => n + 1)}
                >
                  <ChevronRightIcon />
                </Button>
              </Flex>
            </Flex>
          </>
        )}

        {!ordersApi.loading && orders.length === 0 && (
          <Flex
            justify="center"
            align="center"
            direction="column"
            style={{ minHeight: "200px", gap: "12px" }}
          >
            <Text size="3" style={{ fontSize: "32px" }}>
              📭
            </Text>
            <Text size="2" color="gray" align="center">
              No orders for this date
            </Text>
          </Flex>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
};
