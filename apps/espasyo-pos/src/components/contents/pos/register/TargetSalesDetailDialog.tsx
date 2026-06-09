import React, { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  IconButton,
  ScrollArea,
  Separator,
  Skeleton,
  Text,
} from "@radix-ui/themes";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { EmojiEvents, TrendingUpOutlined } from "@mui/icons-material";
import { useRouter } from "next/router";
import { DialogBox } from "core-lib/components/radix/dialog/DialogBox";
import { useApiCallback } from "core-lib/core/hooks";
import { DailySalesSummaryDto, SaleDto, SaleStatusDto } from "core-lib/api/commons/types";
import { formatCurrency } from "../format";

const PAGE_SIZE = 10;

interface Props {
  open: boolean;
  onClose: () => void;
  currentAmount: number;
  targetAmount: number;
  progressPct: number;
  reached: boolean;
  currencyCode: string;
  summary: DailySalesSummaryDto | null;
}

const getThresholdColor = (pct: number): string => {
  if (pct >= 100) return "jade";
  if (pct >= 80) return "green";
  if (pct >= 50) return "amber";
  return "red";
};

const getGradient = (color: string): string => {
  const gradients: Record<string, string> = {
    red: "linear-gradient(90deg, var(--red-9), var(--red-10))",
    amber: "linear-gradient(90deg, var(--amber-9), var(--amber-10))",
    green: "linear-gradient(90deg, var(--green-9), var(--green-10))",
    jade: "linear-gradient(90deg, var(--jade-9), var(--jade-10))",
  };
  return gradients[color] || gradients.red;
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  Cash: "Cash",
  Card: "Card",
  GCash: "GCash",
  Maya: "Maya",
  BankTransfer: "Bank Transfer",
  StoreCredit: "Store Credit",
  Other: "Other",
};

const getSaleStatusMeta = (status: SaleStatusDto): { label: string; color: "jade" | "red" | "amber"; dim: boolean } => {
  switch (status) {
    case SaleStatusDto.Voided:
      return { label: "Voided", color: "red", dim: true };
    case SaleStatusDto.PartiallyRefunded:
      return { label: "Part. Refund", color: "amber", dim: false };
    case SaleStatusDto.FullyRefunded:
      return { label: "Refunded", color: "amber", dim: true };
    default:
      return { label: "Done", color: "jade", dim: false };
  }
};

const formatTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch {
    return "—";
  }
};

interface StatCardProps {
  label: string;
  value: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => (
  <Box
    style={{
      background: "var(--gray-a2)",
      borderRadius: "var(--radius-3)",
      padding: "12px 14px",
      border: "1px solid var(--gray-a4)",
    }}
  >
    <Text size="1" color="gray" style={{ display: "block", marginBottom: 4 }}>
      {label}
    </Text>
    <Text
      size="4"
      weight="bold"
      style={{ color: color ? `var(--${color}-11)` : undefined }}
    >
      {value}
    </Text>
  </Box>
);

export const TargetSalesDetailDialog: React.FC<Props> = ({
  open,
  onClose,
  currentAmount,
  targetAmount,
  progressPct,
  reached,
  currencyCode,
  summary,
}) => {
  const router = useRouter();
  const thresholdColor = getThresholdColor(progressPct);
  const cappedPct = Math.min(progressPct, 100);

  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sales, setSales] = useState<SaleDto[]>([]);
  const [loading, setLoading] = useState(false);

  const salesCb = useApiCallback((api, page: number) => {
    const today = new Date().toISOString().split("T")[0];
    return api.commons.saleList({ fromDate: today, toDate: today, pageSize: PAGE_SIZE, pageNumber: page });
  });

  // Reset to page 1 whenever the dialog opens.
  useEffect(() => {
    if (open) setPageNumber(1);
  }, [open]);

  // Fetch sales for the current page while the dialog is open.
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    salesCb.execute(pageNumber)
      .then((res) => {
        const data = res?.data?.response;
        setSales(data?.items ?? []);
        setTotalPages(data?.totalPages ?? 1);
        setTotalItems(data?.totalItems ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, pageNumber]);

  const paymentEntries = summary?.byPaymentMethod
    ? Object.entries(summary.byPaymentMethod).filter(([, amount]) => amount > 0)
    : [];

  const multipleCashiers = (summary?.byCashier?.length ?? 0) > 1;

  const skeletonRows = [1, 2, 3, 4, 5];

  const today = new Date().toISOString().split("T")[0];

  return (
    <DialogBox
      open={open}
      onClose={(_e, _reason) => onClose()}
      maxWidth="sm"
      title={
        <Flex align="center" gap="2">
          <EmojiEvents style={{ color: `var(--${thresholdColor}-11)`, fontSize: 20 }} />
          <Text weight="bold" size="3">Daily Sales Performance</Text>
        </Flex>
      }
      footer={
        <Flex justify="end">
          <Button variant="solid" color="indigo" size="2" onClick={onClose}>
            Close
          </Button>
        </Flex>
      }
      stickyFooter
    >
      <Flex direction="column" gap="4" pb="2">
        {/* --- Stat Cards --- */}
        <Grid columns="3" gap="2">
          <StatCard
            label="Total Sales"
            value={formatCurrency(currentAmount, currencyCode)}
            color={thresholdColor}
          />
          <StatCard
            label="Transactions"
            value={String(summary?.salesCount ?? 0)}
          />
          <StatCard
            label="Net Revenue"
            value={formatCurrency(summary?.netRevenue ?? currentAmount, currencyCode)}
          />
        </Grid>

        {/* --- Progress Bar --- */}
        <Box
          style={{
            background: reached ? `var(--${thresholdColor}-a2)` : "var(--gray-a2)",
            border: `1px solid var(--${thresholdColor}-a4)`,
            borderRadius: "var(--radius-3)",
            padding: "14px 16px",
          }}
        >
          <Flex justify="between" align="center" mb="2">
            <Flex align="center" gap="2">
              <TrendingUpOutlined style={{ fontSize: 16, color: `var(--${thresholdColor}-11)` }} />
              <Text size="2" weight="medium">
                Progress to Target
              </Text>
            </Flex>
            <Flex align="center" gap="2">
              <Badge
                color={thresholdColor as "jade" | "green" | "amber" | "red"}
                variant="soft"
                radius="full"
                size="1"
              >
                {cappedPct.toFixed(0)}%
              </Badge>
              <Text size="2" weight="bold" style={{ color: `var(--${thresholdColor}-11)` }}>
                {formatCurrency(targetAmount, currencyCode)}
              </Text>
            </Flex>
          </Flex>

          <Box
            style={{
              height: 8,
              borderRadius: 999,
              background: "var(--gray-a4)",
              overflow: "hidden",
            }}
          >
            <motion.div
              style={{
                height: "100%",
                borderRadius: 999,
                background: getGradient(thresholdColor),
              }}
              initial={{ width: 0 }}
              animate={{ width: `${cappedPct}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </Box>

          <Flex justify="between" align="center" mt="2">
            <Text size="1" color="gray">
              {formatCurrency(currentAmount, currencyCode)} earned
            </Text>
            {!reached && (
              <Text size="1" color="gray">
                {formatCurrency(Math.max(0, targetAmount - currentAmount), currencyCode)} remaining
              </Text>
            )}
            {reached && (
              <Text size="1" weight="medium" style={{ color: "var(--jade-11)" }}>
                🎉 Target reached!
              </Text>
            )}
          </Flex>
        </Box>

        {/* --- Payment Breakdown --- */}
        {paymentEntries.length > 0 && (
          <Box>
            <Text size="2" weight="medium" color="gray" mb="2" style={{ display: "block" }}>
              By Payment Method
            </Text>
            <Box
              style={{
                background: "var(--gray-a2)",
                borderRadius: "var(--radius-3)",
                border: "1px solid var(--gray-a4)",
                overflow: "hidden",
              }}
            >
              {paymentEntries.map(([method, amount], i) => (
                <React.Fragment key={method}>
                  {i > 0 && <Separator size="4" style={{ background: "var(--gray-a3)" }} />}
                  <Flex justify="between" align="center" px="3" py="2">
                    <Text size="2">{PAYMENT_METHOD_LABELS[method] ?? method}</Text>
                    <Text size="2" weight="medium">
                      {formatCurrency(amount, currencyCode)}
                    </Text>
                  </Flex>
                </React.Fragment>
              ))}
              {paymentEntries.length > 1 && (
                <>
                  <Separator size="4" style={{ background: "var(--gray-a5)" }} />
                  <Flex justify="between" align="center" px="3" py="2">
                    <Text size="2" weight="bold" color="gray">Total</Text>
                    <Text size="2" weight="bold">
                      {formatCurrency(paymentEntries.reduce((s, [, v]) => s + v, 0), currencyCode)}
                    </Text>
                  </Flex>
                </>
              )}
            </Box>
          </Box>
        )}

        {/* --- By Cashier (only if multiple cashiers) --- */}
        {multipleCashiers && (
          <Box>
            <Text size="2" weight="medium" color="gray" mb="2" style={{ display: "block" }}>
              By Cashier
            </Text>
            <Box
              style={{
                background: "var(--gray-a2)",
                borderRadius: "var(--radius-3)",
                border: "1px solid var(--gray-a4)",
                overflow: "hidden",
              }}
            >
              {summary!.byCashier.map((c, i) => (
                <React.Fragment key={c.cashierUserID}>
                  {i > 0 && <Separator size="4" style={{ background: "var(--gray-a3)" }} />}
                  <Flex justify="between" align="center" px="3" py="2">
                    <Flex direction="column" gap="0">
                      <Text size="2">{c.cashierName}</Text>
                      <Text size="1" color="gray">{c.salesCount} transaction{c.salesCount !== 1 ? "s" : ""}</Text>
                    </Flex>
                    <Text size="2" weight="medium">
                      {formatCurrency(c.netRevenue, currencyCode)}
                    </Text>
                  </Flex>
                </React.Fragment>
              ))}
            </Box>
          </Box>
        )}

        {/* --- Today's Transactions --- */}
        <Box>
          <Flex justify="between" align="center" mb="2">
            <Text
              size="2"
              weight="medium"
              onClick={() => {
                onClose();
                router.push(`/cashier/orders?fromDate=${today}&toDate=${today}`);
              }}
              style={{
                color: "var(--indigo-11)",
                cursor: "pointer",
                textDecoration: "underline",
                textDecorationColor: "var(--indigo-a6)",
                textUnderlineOffset: 2,
              }}
            >
              Today's Transactions ↗
            </Text>
            {totalItems > 0 && (
              <Badge variant="soft" color="gray" radius="full" size="1">
                {totalItems}
              </Badge>
            )}
          </Flex>

          <Box
            style={{
              background: "var(--gray-a2)",
              borderRadius: "var(--radius-3)",
              border: "1px solid var(--gray-a4)",
              overflow: "hidden",
            }}
          >
            {loading && sales.length === 0 ? (
              <Flex direction="column" gap="0">
                {skeletonRows.map((n) => (
                  <React.Fragment key={n}>
                    {n > 1 && <Separator size="4" style={{ background: "var(--gray-a3)" }} />}
                    <Flex justify="between" align="center" px="3" py="3" gap="3">
                      <Skeleton width="80px" height="16px" />
                      <Skeleton width="60px" height="16px" />
                      <Skeleton width="70px" height="16px" />
                    </Flex>
                  </React.Fragment>
                ))}
              </Flex>
            ) : sales.length === 0 ? (
              <Flex align="center" justify="center" py="5">
                <Text size="2" color="gray">No transactions yet today</Text>
              </Flex>
            ) : (
              <ScrollArea style={{ maxHeight: 300 }}>
                {sales.map((sale, i) => {
                  const statusMeta = getSaleStatusMeta(sale.status);
                  return (
                    <React.Fragment key={sale.saleID}>
                      {i > 0 && <Separator size="4" style={{ background: "var(--gray-a3)" }} />}
                      <Flex
                        justify="between"
                        align="center"
                        px="3"
                        py="2"
                        gap="2"
                        style={{ opacity: statusMeta.dim ? 0.6 : 1 }}
                      >
                        <Flex direction="column" gap="0" style={{ minWidth: 0 }}>
                          <Text
                            size="1"
                            weight="bold"
                            style={{
                              fontFamily: "var(--font-mono, monospace)",
                              color: "var(--gray-12)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {sale.saleNumber}
                          </Text>
                          <Text size="1" color="gray">
                            {formatTime(sale.completedAt)} · {sale.itemCount} item{sale.itemCount !== 1 ? "s" : ""}
                          </Text>
                        </Flex>

                        <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
                          <Text size="2" weight="medium">
                            {formatCurrency(sale.totalAmount, currencyCode)}
                          </Text>
                          <Badge
                            color={statusMeta.color}
                            variant="soft"
                            radius="full"
                            size="1"
                          >
                            {statusMeta.label}
                          </Badge>
                        </Flex>
                      </Flex>
                    </React.Fragment>
                  );
                })}
              </ScrollArea>
            )}
          </Box>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <Flex align="center" justify="between" pt="2" px="1">
              <Text size="1" color="gray">
                {totalItems} transaction{totalItems !== 1 ? "s" : ""} total
              </Text>
              <Flex align="center" gap="2">
                <IconButton
                  variant="soft"
                  color="gray"
                  size="1"
                  disabled={pageNumber <= 1 || loading}
                  onClick={() => setPageNumber((p) => p - 1)}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <Text size="1" color="gray" style={{ minWidth: 40, textAlign: "center" }}>
                  {pageNumber} / {totalPages}
                </Text>
                <IconButton
                  variant="soft"
                  color="gray"
                  size="1"
                  disabled={pageNumber >= totalPages || loading}
                  onClick={() => setPageNumber((p) => p + 1)}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Flex>
            </Flex>
          )}
        </Box>
      </Flex>
    </DialogBox>
  );
};
