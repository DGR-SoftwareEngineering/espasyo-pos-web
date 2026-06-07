import React, {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Dialog,
  Flex,
  Grid,
  Heading,
  IconButton,
  ScrollArea,
  Separator,
  Skeleton,
  Text,
  Spinner,
} from "@radix-ui/themes";
import {
  ActivityLogIcon,
  BarChartIcon,
  CubeIcon,
  LayersIcon,
  PieChartIcon,
  CalendarIcon,
  Cross2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import {
  TrendingUpOutlined,
  ReceiptLongOutlined,
  PaidOutlined,
  AccountBalanceWalletOutlined,
  WarningAmberOutlined,
  PrintOutlined,
  AssessmentOutlined,
  ShoppingCartOutlined,
  SavingsOutlined,
  InfoOutlined,
  RefreshOutlined,
  ExpandMoreOutlined,
  ExpandLessOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Cell,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  ChartCard,
  ChartEmpty,
  ChartLoader,
  ProductOption,
  useChart,
} from "core-lib/components/radix/charts";
import type { ChartPeriod } from "core-lib/components/radix/charts";
import {
  TabsContextProvider,
  TabsHeaderDesktop,
  TabsHeaderMobile,
  TabPanel,
  TabOption,
} from "core-lib/components/radix/tabs";
import { useApi, useResolution } from "core-lib/core/hooks";
import { getDailySalesGross } from "core-lib/business";
import { usePublicSettings } from "core-lib/core/contexts";
import { useRouter } from "core-lib/core/router";
import { useDialogContext } from "core-lib";
import { FinancialSummaryTable } from "./FinancialSummaryTable";
import { ShiftDetailsTab } from "./ShiftDetailsTab";
import { SalesForecastingTab } from "./SalesForecastingTab";
import { ProductVariantTab } from "./ProductVariantTab";
import {
  SupplierInvoiceDto,
  SupplierInvoiceStatusDto,
  OrderDto,
  SaleStatusDto,
  SaleDetailDto,
  FinancialReportProductRevenueItemDto,
  FinancialReportVariantRevenueDto,
  BusinessExpenseDto,
} from "core-lib/api/commons/types";
import type { OrderDetailDialogData } from "core-lib/api/content/types/common";
import { INVOICE_STATUS_META } from "../contents/procurement/constants";
import { formatCurrency } from "../contents/procurement/format";
import { SaleReceiptPrintable } from "../contents/pos/printables/SaleReceiptPrintable";
import { PrintPreviewDialog, PrintableDocument } from "core-lib/components/print";

// ─── Types ────────────────────────────────────────────────────────────────────

type Accent =
  | "indigo"
  | "violet"
  | "teal"
  | "amber"
  | "red"
  | "green"
  | "blue"
  | "orange";

interface KpiTile {
  label: string;
  value: string | null;
  hint: string;
  accent: Accent;
  icon: React.ReactNode;
  loading: boolean;
}

const PERIODS: { label: string; value: ChartPeriod }[] = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
  { label: "YTD", value: "ytd" },
  { label: "This Year", value: "year" },
];

function periodToDateRange(period: ChartPeriod): { from: string; to: string } {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const to = fmt(today);
  switch (period) {
    case "today":
      return { from: to, to };
    case "7d": {
      const d = new Date(today); d.setDate(d.getDate() - 6);
      return { from: fmt(d), to };
    }
    case "30d": {
      const d = new Date(today); d.setDate(d.getDate() - 29);
      return { from: fmt(d), to };
    }
    case "90d": {
      const d = new Date(today); d.setDate(d.getDate() - 89);
      return { from: fmt(d), to };
    }
    case "ytd": {
      return { from: `${today.getFullYear()}-01-01`, to };
    }
    case "year": {
      const y = today.getFullYear();
      return { from: `${y}-01-01`, to: `${y}-12-31` };
    }
    default:
      return { from: to, to };
  }
}

// ─── Helper to filter expenses by date range ─────────────────────────────────

function filterExpensesByPeriod(expenses: BusinessExpenseDto[], fromDate: string, toDate: string): BusinessExpenseDto[] {
  return expenses.filter(expense => {
    const expenseDate = expense.expenseDate;
    return expenseDate >= fromDate && expenseDate <= toDate;
  });
}

function filterInvoicesByPeriod(invoices: SupplierInvoiceDto[], fromDate: string, toDate: string): SupplierInvoiceDto[] {
  return invoices.filter(inv => {
    const invoiceDate = inv.invoiceDate?.split('T')[0];
    return invoiceDate && invoiceDate >= fromDate && invoiceDate <= toDate;
  });
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

const KpiCard = memo<{ tile: KpiTile; delay: number }>(({ tile, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
    style={{ minWidth: 0, height: "100%" }}
  >
    <Card
      size="2"
      variant="surface"
      style={{
        background: `var(--${tile.accent}-a2)`,
        borderColor: `var(--${tile.accent}-a5)`,
        height: "100%",
        minWidth: 0,
      }}
    >
      <Flex direction="column" gap="2" style={{ minWidth: 0 }}>
        {/* Label row */}
        <Flex justify="between" align="center" gap="2">
          <Text
            size="1"
            color="gray"
            weight="medium"
            style={{
              textTransform: "uppercase",
              letterSpacing: 0.5,
              lineHeight: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              minWidth: 0,
            }}
          >
            {tile.label}
          </Text>
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-2)",
              background: `var(--${tile.accent}-a3)`,
              color: `var(--${tile.accent}-11)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {tile.icon}
          </Box>
        </Flex>

        {/* Value */}
        {tile.loading ? (
          <Skeleton width="80%" height="24px" />
        ) : (
          <Text
            weight="bold"
            as="div"
            style={{
              color: `var(--${tile.accent}-11)`,
              fontSize: 20,
              lineHeight: 1.15,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {tile.value ?? "—"}
          </Text>
        )}

        {/* Hint */}
        <Text
          size="1"
          color="gray"
          as="div"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineHeight: 1.2,
          }}
        >
          {tile.hint}
        </Text>
      </Flex>
    </Card>
  </motion.div>
));

// ─── Summary Tile ─────────────────────────────────────────────────────────────

const SummaryTile = memo<{
  label: string;
  value: string;
  loading: boolean;
  color: string;
  hint: string;
  negative?: boolean;
}>(({ label, value, loading, color, hint, negative }) => (
  <Box
    p="3"
    style={{
      borderRadius: "var(--radius-3)",
      background: "var(--gray-a2)",
      border: "1px solid var(--gray-a3)",
      minWidth: 0,
      overflow: "hidden",
    }}
  >
    <Text
      size="1"
      color="gray"
      weight="medium"
      as="div"
      style={{
        textTransform: "uppercase",
        letterSpacing: 0.5,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Text>
    {loading ? (
      <Skeleton width="90%" height="22px" style={{ marginTop: 6 }} />
    ) : (
      <Text
        weight="bold"
        as="div"
        mt="1"
        style={{
          color,
          fontSize: 18,
          lineHeight: 1.2,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {negative ? `− ${value}` : value}
      </Text>
    )}
    <Text
      size="1"
      color="gray"
      as="div"
      mt="1"
      style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {hint}
    </Text>
  </Box>
));

// ─── Section Header ───────────────────────────────────────────────────────────

const ReportSection = memo<{
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: Accent;
  delay: number;
  children: React.ReactNode;
}>(({ title, description, icon, accent, delay, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
  >
    <Box mb="5">
      <Flex align="center" gap="3" mb="4">
        <Box
          style={{
            width: 34,
            height: 34,
            borderRadius: "var(--radius-2)",
            background: `var(--${accent}-a3)`,
            color: `var(--${accent}-11)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box style={{ minWidth: 0 }}>
          <Heading size="4" weight="bold">
            {title}
          </Heading>
          <Text size="2" color="gray">
            {description}
          </Text>
        </Box>
      </Flex>
      {children}
    </Box>
  </motion.div>
));

// ─── Invoice Status Card (locally-computed from fetched invoices) ─────────────

const STATUS_ORDER = [
  SupplierInvoiceStatusDto.Paid,
  SupplierInvoiceStatusDto.Pending,
  SupplierInvoiceStatusDto.PartiallyPaid,
  SupplierInvoiceStatusDto.Overdue,
  SupplierInvoiceStatusDto.Voided,
] as const;

const InvoiceStatusCard = memo<{
  invoices: SupplierInvoiceDto[];
  loading: boolean;
  currencyCode: string;
}>(({ invoices, loading, currencyCode }) => {
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
        {/* Header */}
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

        {/* Body */}
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
                        <Badge color={meta.color as any} variant="soft" size="1">
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
                    {/* Progress bar */}
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
});

// ─── Procurement Trend Card (locally-computed month-over-month) ───────────────

const ProcurementTrendCard = memo<{
  invoices: SupplierInvoiceDto[];
  loading: boolean;
  currencyCode: string;
}>(({ invoices, loading, currencyCode }) => {
  const monthlyData = useMemo(() => {
    const map: Record<string, { label: string; total: number; paid: number }> =
      {};
    for (const inv of invoices) {
      if (!inv.invoiceDate) continue;
      const d = new Date(inv.invoiceDate);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map[key]) {
        map[key] = {
          label: d.toLocaleDateString(undefined, {
            month: "short",
            year: "numeric",
          }),
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
        {/* Header */}
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

        {/* Body */}
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
                    {/* Total bar */}
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
                        {/* Paid overlay */}
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
              {/* Legend */}
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
});

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getDaysAgoIso(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() - n);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDatesInRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const current = new Date(from + "T00:00:00Z");
  const end = new Date(to + "T00:00:00Z");
  const maxDays = 31;

  let dayCount = 0;
  while (current <= end && dayCount < maxDays) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
    dayCount++;
  }

  return dates;
}

function getStatusBadge(
  status: SaleStatusDto
): { color: "green" | "red" | "amber" | "blue"; label: string } {
  switch (status) {
    case SaleStatusDto.Completed:
      return { color: "green", label: "Completed" };
    case SaleStatusDto.Voided:
      return { color: "red", label: "Voided" };
    case SaleStatusDto.PartiallyRefunded:
      return { color: "amber", label: "Partial Refund" };
    case SaleStatusDto.FullyRefunded:
      return { color: "blue", label: "Fully Refunded" };
    default:
      return { color: "gray" as any, label: "Unknown" };
  }
}

// ─── Daily Transactions Panel Component ───────────────────────────────────────

interface DailyTransactionsPanelProps {
  date: string | null;
  summary: { totalAmount: number; salesCount: number } | null;
  onClose: () => void;
}

const DailyTransactionsPanel: React.FC<DailyTransactionsPanelProps> = ({
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
  const actualSalesCount = (pagination as any)?.totalCount ?? orders.length;
  const actualDayTotal = orders.reduce((sum, o) => sum + ((o as any).totalAmount ?? 0), 0);

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
        title: `Order · ${order.orderNumber}`,
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
        {/* Header */}
        <Flex justify="between" align="center" mb="4">
          <Heading size="5" weight="bold">
            Transactions — {dateFormatted}
          </Heading>
          <Dialog.Close>
            <IconButton size="2" variant="ghost">
              <Cross2Icon />
            </IconButton>
          </Dialog.Close>
        </Flex>

        {/* Summary chips */}
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

        {/* Loading state */}
        {ordersApi.loading && (
          <Flex justify="center" align="center" style={{ minHeight: "200px" }}>
            <Spinner size="3" />
          </Flex>
        )}

        {/* Orders table */}
        {!ordersApi.loading && orders.length > 0 && (
          <>
            <style>{`
              .daily-orders-table { width: 100%; border-collapse: collapse; font-size: 13px; }
              .daily-orders-table thead tr { background: var(--gray-a2); border-bottom: 1px solid var(--gray-a4); }
              .daily-orders-table th { padding: 10px 12px; text-align: left; font-weight: 500; color: var(--gray-11); }
              .daily-orders-table th:nth-child(2),
              .daily-orders-table th:nth-child(3),
              .daily-orders-table th:nth-child(4),
              .daily-orders-table th:nth-child(5),
              .daily-orders-table th:nth-child(6) { text-align: center; }
              .daily-orders-table tbody tr { border-bottom: 1px solid var(--gray-a3); transition: background 80ms ease; cursor: pointer; }
              .daily-orders-table tbody tr:hover { background: var(--gray-a2); }
              .daily-orders-table td { padding: 10px 12px; color: var(--gray-12); }
              .daily-orders-table td:nth-child(2),
              .daily-orders-table td:nth-child(3),
              .daily-orders-table td:nth-child(4),
              .daily-orders-table td:nth-child(5),
              .daily-orders-table td:nth-child(6) { text-align: center; }
            `}</style>

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
                      : "—";
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

            {/* Pagination */}
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

        {/* Empty state */}
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

// ─── Daily Sales Target Tab Component ──────────────────────────────────────────

interface DailySalesTargetTabProps {
  todayTotal: number;
  salesCount: number;
  salesLoading: boolean;
}

const DailySalesTargetTab: React.FC<DailySalesTargetTabProps> = ({ todayTotal, salesCount, salesLoading }) => {
  const { pos, currencyCode: tabCurrencyCode } = usePublicSettings();
  const router = useRouter();
  const { openDialog } = useDialogContext();

  // Today's data (always today, independent of table filter)
  const targetAmount = pos.targetSalesAmountPerDay;
  const currentAmount = todayTotal;

  // Date range state — table only (defaults to last 7 days)
  const [fromDate, setFromDate] = useState(() => getDaysAgoIso(6));
  const [toDate, setToDate] = useState(() => getDaysAgoIso(0));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [printOpen, setPrintOpen] = useState(false);

  // Backend uses exclusive upper bound (SaleDate < toDate), so add 1 day for API calls
  const apiToDate = useMemo(() => {
    const d = new Date(toDate + "T12:00:00");
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, [toDate]);

  // Chart-based per-day data for table rows (admin-wide, not user-scoped)
  const rangeChart = useChart({
    chartKey: "sales-by-day",
    fromDate,
    toDate: apiToDate,
  });

  const progressPct = useMemo(() => {
    if (targetAmount <= 0) return 0;
    return Math.min((currentAmount / targetAmount) * 100, 100);
  }, [currentAmount, targetAmount]);

  const remaining = Math.max(targetAmount - currentAmount, 0);
  const reached = targetAmount > 0 && currentAmount >= targetAmount;

  // Transform chart points to table rows (must be before conditional return — Rules of Hooks)
  const rangeRows = useMemo(() => {
    const todayIso = getDaysAgoIso(0);
    const points = rangeChart.data?.points ?? [];
    return points
      .map((p) => {
        const isoDate = p.timestamp
          ? (() => {
              const d = new Date(p.timestamp);
              return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            })()
          : null;
        const rawAmount = (Object.values(p.values)[0] ?? 0) as number;
        // Chart groups by CompletedAt UTC and sums SubTotal — override today's row with the
        // accurate salesDailySummary total (uses SaleDate equality, includes all local-time txns)
        const amount = isoDate === todayIso && todayTotal > 0 ? todayTotal : rawAmount;
        return { date: isoDate, label: p.label, amount };
      })
      .filter((r) => !r.date || (r.date >= fromDate && r.date <= toDate));
  }, [rangeChart.data, fromDate, toDate, todayTotal]);

  const chartData = useMemo(
    () =>
      [...rangeRows].reverse().map(({ label, amount }) => ({
        label,
        actual: amount > 0 ? amount : 0,
      })),
    [rangeRows],
  );

  const selectedDateSummary = selectedDate
    ? { totalAmount: rangeRows.find((r) => r.date === selectedDate)?.amount ?? 0, salesCount: 0 }
    : null;

  // Conditional return AFTER all hooks
  if (targetAmount <= 0 || !pos.targetSalesEnabled) {
    return (
      <Box pt="4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Callout.Root
            style={{
              background: "var(--amber-a2)",
              borderColor: "var(--amber-a5)",
              padding: "20px",
            }}
          >
            <WarningAmberOutlined style={{ fontSize: 18 }} />
            <Callout.Text>
              <strong>Daily Sales Target not configured</strong> — Go to{" "}
              <Button
                variant="ghost"
                size="1"
                style={{ cursor: "pointer", paddingInline: "4px" }}
                onClick={() => router.push("/admin/hub/settings")}
              >
                Settings
              </Button>
              {" "}to enable and set your daily target.
            </Callout.Text>
          </Callout.Root>
        </motion.div>
      </Box>
    );
  }

  const getStatusColor = (): { color: string; bg: string; message: string; emoji: string } => {
    if (reached) return { color: "jade", bg: "jade-a2", message: "🎉 Target achieved!", emoji: "🎯" };
    if (progressPct >= 80) return { color: "green", bg: "green-a2", message: "Almost there! Keep pushing.", emoji: "💪" };
    if (progressPct >= 50) return { color: "amber", bg: "amber-a2", message: "Halfway done! Keep going.", emoji: "⚡" };
    return { color: "red", bg: "red-a2", message: "Keep pushing! You're just getting started.", emoji: "🚀" };
  };

  const status = getStatusColor();
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <Box pt="4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Header */}
        <Flex justify="between" align="center" mb="4">
          <Heading size="5" weight="bold">Today's Sales Performance</Heading>
          <Text size="2" color="gray">{today}</Text>
        </Flex>

        {/* Hero: Circular progress + Stat Cards */}
        <Grid columns={{ initial: "1", md: "3" }} gap="4" mb="6">
          {/* Circular Progress Ring */}
          <Card
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "32px",
              background: `var(--${status.color}-a2)`,
              border: `2px solid var(--${status.color}-a5)`,
              minHeight: 300,
            }}
          >
            <Box style={{ position: "relative", width: 140, height: 140, marginBottom: "16px" }}>
              <svg width={140} height={140} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                <circle cx={70} cy={70} r={60} fill="none" stroke="var(--gray-a3)" strokeWidth={10} />
                <motion.circle
                  initial={{ strokeDashoffset: 377 }}
                  animate={{ strokeDashoffset: 377 - (377 * progressPct) / 100 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  cx={70}
                  cy={70}
                  r={60}
                  fill="none"
                  stroke={`var(--${status.color}-11)`}
                  strokeWidth={10}
                  strokeDasharray={377}
                  strokeLinecap="round"
                />
              </svg>
              <Flex justify="center" align="center" style={{ position: "absolute", inset: 0, fontSize: 28, fontWeight: "bold", color: `var(--${status.color}-11)` }}>
                {salesLoading ? <Spinner size="3" /> : (reached ? "🎯" : `${Math.round(progressPct)}%`)}
              </Flex>
            </Box>
            <Text size="3" weight="bold" style={{ color: `var(--${status.color}-11)`, marginBottom: "8px" }}>
              {status.emoji} {status.message}
            </Text>
            <Text size="1" color="gray" align="center">
              {formatCurrency(currentAmount)} of {formatCurrency(targetAmount)}
            </Text>
          </Card>

          {/* Current Sales Card */}
          <Card
            style={{
              padding: "24px",
              background: `var(--indigo-a2)`,
              border: `1px solid var(--indigo-a5)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 180,
            }}
          >
            <Flex direction="column" gap="3" align="center">
              <Flex align="center" gap="2">
                <TrendingUpOutlined style={{ fontSize: 20, color: "var(--indigo-11)" }} />
                <Text size="2" weight="medium" color="gray">Current Sales</Text>
              </Flex>
              <Text size="8" weight="bold" align="center" style={{ color: "var(--indigo-11)", lineHeight: 1 }}>
                {formatCurrency(currentAmount)}
              </Text>
              <Text size="2" color="gray" align="center">
                {salesCount.toLocaleString()} transactions
              </Text>
            </Flex>
          </Card>

          {/* Target Card */}
          <Card
            style={{
              padding: "24px",
              background: `var(--gray-a2)`,
              border: `1px solid var(--gray-a4)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 180,
            }}
          >
            <Flex direction="column" gap="3" align="center">
              <Flex align="center" gap="2">
                <AssessmentOutlined style={{ fontSize: 20, color: "var(--gray-11)" }} />
                <Text size="2" weight="medium" color="gray">Daily Target</Text>
              </Flex>
              <Text size="8" weight="bold" align="center" style={{ color: "var(--gray-11)", lineHeight: 1 }}>
                {formatCurrency(targetAmount)}
              </Text>
              {!reached && (
                <Text size="2" color="gray" align="center">
                  Remaining: {formatCurrency(remaining)}
                </Text>
              )}
              {reached && (
                <Text size="2" align="center" style={{ color: "var(--jade-11)" }}>
                  ✓ Completed
                </Text>
              )}
            </Flex>
          </Card>
        </Grid>

        {/* Progress Bar */}
        <Box mb="4">
          <Flex justify="between" align="center" mb="2">
            <Text size="1" weight="medium" color="gray">Progress</Text>
            <Text size="1" weight="bold">{Math.round(progressPct)}%</Text>
          </Flex>
          <Box style={{ height: 8, background: "var(--gray-a3)", borderRadius: "var(--radius-3)", overflow: "hidden" }}>
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                height: "100%",
                background: `linear-gradient(90deg, var(--${status.color}-10), var(--${status.color}-11))`,
                borderRadius: "var(--radius-3)",
              }}
            />
          </Box>
        </Box>

        {/* Settings Shortcut */}
        <Callout.Root mb="6" style={{ background: `var(--${status.color}-a2)`, borderColor: `var(--${status.color}-a5)` }}>
          <InfoOutlined style={{ fontSize: 16 }} />
          <Callout.Text>
            <strong>Target Configuration:</strong> Daily target is set to <strong>{formatCurrency(targetAmount)}</strong>. To adjust this, visit your <Button
              variant="ghost"
              size="1"
              style={{ cursor: "pointer", paddingInline: "4px" }}
              onClick={() => router.push("/admin/hub/settings")}
            >
              Settings
            </Button>
          </Callout.Text>
        </Callout.Root>

        <Separator my="6" />

        {/* Date Range Filter */}
        <Card style={{ padding: "16px", marginBottom: "24px", background: "var(--gray-a1)" }}>
          <Flex align="center" gap="3" wrap="wrap">
            <CalendarIcon width={18} height={18} style={{ color: "var(--gray-11)" }} />
            <Text size="1" weight="medium" color="gray">From:</Text>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{
                padding: "6px 8px",
                borderRadius: "var(--radius-2)",
                border: "1px solid var(--gray-a4)",
                fontSize: "13px",
                fontFamily: "inherit",
                color: "var(--gray-12)",
                backgroundColor: "var(--color-background)",
              }}
            />
            <Text size="1" weight="medium" color="gray">To:</Text>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{
                padding: "6px 8px",
                borderRadius: "var(--radius-2)",
                border: "1px solid var(--gray-a4)",
                fontSize: "13px",
                fontFamily: "inherit",
                color: "var(--gray-12)",
                backgroundColor: "var(--color-background)",
              }}
            />
            <Button
              size="1"
              variant="soft"
              onClick={() => {
                setFromDate(getDaysAgoIso(6));
                setToDate(getDaysAgoIso(0));
              }}
            >
              Reset (7 Days)
            </Button>
            <Button
              size="1"
              variant="soft"
              color="indigo"
              style={{ marginLeft: "auto" }}
              onClick={() => setPrintOpen(true)}
            >
              <PrintOutlined style={{ fontSize: 13 }} />
              Print
            </Button>
          </Flex>
        </Card>

        {/* Daily Sales vs Target Chart */}
        <Card mb="5" style={{ padding: "20px" }}>
          <Flex justify="between" align="center" mb="3">
            <Text size="3" weight="bold">Daily Sales vs Target</Text>
            <Badge color="amber" variant="soft" size="1">
              Target: {formatCurrency(targetAmount)}
            </Badge>
          </Flex>

          {rangeChart.loading ? (
            <ChartLoader />
          ) : chartData.length === 0 ? (
            <Flex justify="center" align="center" style={{ height: 200 }}>
              <Text size="2" color="gray">No data for this range</Text>
            </Flex>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-a4)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--gray-11)" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v) => formatCurrency(v)}
                  tick={{ fontSize: 11, fill: "var(--gray-11)" }}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <RechartsTooltip
                  formatter={(value, name) => {
                    const numValue = typeof value === 'number' ? value : 0;
                    if (name === "actual") {
                      const hit = numValue >= targetAmount;
                      return [
                        `${formatCurrency(numValue)} ${hit ? "✓ Hit" : "↓ Below"}`,
                        "Sales",
                      ];
                    }
                    return [formatCurrency(numValue), name as string];
                  }}
                  contentStyle={{
                    background: "var(--color-panel-solid)",
                    border: "1px solid var(--gray-a4)",
                    borderRadius: "var(--radius-2)",
                    fontSize: 12,
                  }}
                />
                <ReferenceLine
                  y={targetAmount}
                  stroke="var(--amber-10)"
                  strokeDasharray="5 3"
                  strokeWidth={2}
                  label={{
                    value: "Target",
                    position: "insideTopRight",
                    fontSize: 11,
                    fill: "var(--amber-11)",
                    fontWeight: 600,
                  }}
                />
                <Bar dataKey="actual" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.actual >= targetAmount
                          ? "var(--jade-9)"
                          : "var(--indigo-9)"
                      }
                    />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          )}

          <Flex gap="4" mt="3" justify="center">
            <Flex align="center" gap="1">
              <Box style={{ width: 10, height: 10, borderRadius: 2, background: "var(--jade-9)" }} />
              <Text size="1" color="gray">Hit target</Text>
            </Flex>
            <Flex align="center" gap="1">
              <Box style={{ width: 10, height: 10, borderRadius: 2, background: "var(--indigo-9)" }} />
              <Text size="1" color="gray">Below target</Text>
            </Flex>
            <Flex align="center" gap="1">
              <Box style={{ width: 16, height: 2, background: "var(--amber-10)" }} />
              <Text size="1" color="gray">Target line</Text>
            </Flex>
          </Flex>
        </Card>

        <Text size="2" weight="bold" mb="3">
          Daily Performance
        </Text>
        <Box>
          <style>{`
            .daily-target-table { width: 100%; border-collapse: collapse; font-size: 14px; }
            .daily-target-table thead tr { background: var(--gray-a2); border-bottom: 1px solid var(--gray-a4); }
            .daily-target-table th { padding: 12px 16px; text-align: left; font-weight: 500; color: var(--gray-11); }
            .daily-target-table th:nth-child(2),
            .daily-target-table th:nth-child(3),
            .daily-target-table th:nth-child(4) { text-align: center; }
            .daily-target-table tbody tr { border-bottom: 1px solid var(--gray-a3); transition: background 80ms ease; cursor: pointer; }
            .daily-target-table tbody tr:hover { background: var(--gray-a2); }
            .daily-target-table td { padding: 12px 16px; color: var(--gray-12); }
            .daily-target-table td:nth-child(2),
            .daily-target-table td:nth-child(3),
            .daily-target-table td:nth-child(4) { text-align: center; }
          `}</style>

          <Card style={{ padding: 0, overflow: "hidden" }}>
            <Box style={{ overflowX: "auto" }}>
              <table className="daily-target-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Sales</th>
                    <th>Progress</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...rangeRows]
                    .reverse()
                    .map(({ date, label, amount }) => {
                      const isToday = date === getDaysAgoIso(0);
                      const pct =
                        amount !== null && amount > 0 && targetAmount > 0
                          ? Math.min((amount / targetAmount) * 100, 100)
                          : 0;
                      const hitTarget =
                        amount !== null &&
                        amount > 0 &&
                        targetAmount > 0 &&
                        amount >= targetAmount;

                      return (
                        <tr
                          key={date}
                          onClick={() => date && setSelectedDate(date)}
                          style={{ cursor: date ? "pointer" : "default" }}
                        >
                          <td>
                            <strong>{label}</strong>
                            {isToday && (
                              <span
                                style={{
                                  marginLeft: "8px",
                                  fontSize: 11,
                                  color: "var(--amber-11)",
                                }}
                              >
                                TODAY
                              </span>
                            )}
                          </td>
                          <td style={{ fontWeight: 500 }}>
                            {rangeChart.loading ? (
                              <Box
                                style={{
                                  width: "80px",
                                  height: "16px",
                                  background: "var(--gray-a3)",
                                  borderRadius: "var(--radius-1)",
                                  margin: "0 auto",
                                  animation: "pulse 2s infinite",
                                }}
                              />
                            ) : amount > 0 ? (
                              formatCurrency(amount)
                            ) : (
                              "—"
                            )}
                          </td>
                          <td>
                            {rangeChart.loading ? (
                              <Box
                                style={{
                                  width: "120px",
                                  height: "6px",
                                  background: "var(--gray-a3)",
                                  borderRadius: "var(--radius-1)",
                                  margin: "0 auto",
                                  animation: "pulse 2s infinite",
                                }}
                              />
                            ) : amount > 0 ? (
                              <div
                                style={{
                                  height: 6,
                                  width: 120,
                                  background: "var(--gray-a3)",
                                  borderRadius: "var(--radius-2)",
                                  margin: "0 auto",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${pct}%`,
                                    background: hitTarget
                                      ? "var(--jade-10)"
                                      : "var(--indigo-10)",
                                  }}
                                />
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td>
                            {rangeChart.loading ? (
                              <Box
                                style={{
                                  width: "80px",
                                  height: "20px",
                                  background: "var(--gray-a3)",
                                  borderRadius: "var(--radius-1)",
                                  margin: "0 auto",
                                  animation: "pulse 2s infinite",
                                }}
                              />
                            ) : amount > 0 ? (
                              hitTarget ? (
                                <Badge color="jade" size="1">
                                  ✓ Hit
                                </Badge>
                              ) : (
                                <Badge color="amber" size="1">
                                  ◐ In Progress
                                </Badge>
                              )
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </Box>
          </Card>
        </Box>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
        `}</style>

        {/* Daily Transactions Panel */}
        <DailyTransactionsPanel
          date={selectedDate}
          summary={selectedDateSummary}
          onClose={() => setSelectedDate(null)}
        />
      </motion.div>

      {/* ── Print Preview ── */}
      <PrintPreviewDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        title={`Daily Sales Target · ${new Date().toLocaleDateString()}`}
      >
        <PrintableDocument
          businessName=""
          documentLabel="Daily Sales Target"
          documentNumber={new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
        >
          {/* Today's Performance Summary */}
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#444", fontWeight: 700, marginBottom: 10 }}>
            Today&apos;s Performance
          </div>
          <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            <Box style={{ padding: "10px 12px", background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 6 }}>
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888", fontWeight: 700, marginBottom: 3 }}>Current Sales</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#4338ca" }}>{formatCurrency(currentAmount, tabCurrencyCode)}</div>
            </Box>
            <Box style={{ padding: "10px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6 }}>
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888", fontWeight: 700, marginBottom: 3 }}>Daily Target</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#334155" }}>{formatCurrency(targetAmount, tabCurrencyCode)}</div>
            </Box>
            <Box style={{ padding: "10px 12px", background: reached ? "#f0fdf4" : progressPct >= 50 ? "#fffbeb" : "#fef2f2", border: "1px solid " + (reached ? "#bbf7d0" : progressPct >= 50 ? "#fde68a" : "#fecaca"), borderRadius: 6 }}>
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888", fontWeight: 700, marginBottom: 3 }}>Progress</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: reached ? "#16a34a" : progressPct >= 50 ? "#d97706" : "#dc2626" }}>{progressPct.toFixed(1)}%</div>
            </Box>
          </Box>
          <p style={{ fontSize: 11, color: reached ? "#16a34a" : "#64748b", marginBottom: 20, fontWeight: reached ? 600 : 400 }}>
            {reached
              ? `✓ Target reached — exceeded by ${formatCurrency(currentAmount - targetAmount, tabCurrencyCode)}`
              : targetAmount > 0
                ? `Remaining: ${formatCurrency(remaining, tabCurrencyCode)} to reach today's target`
                : "Daily sales target not configured"}
          </p>

          {/* Daily Performance Table */}
          {rangeRows.length > 0 && (
            <>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#444", fontWeight: 700, marginBottom: 8 }}>
                Daily Performance — {fromDate} to {toDate}
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #111" }}>
                    <th style={{ padding: "6px 8px", textAlign: "left", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Date</th>
                    <th style={{ padding: "6px 8px", textAlign: "right", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Revenue</th>
                    {targetAmount > 0 && <th style={{ padding: "6px 8px", textAlign: "right", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>% of Target</th>}
                    {targetAmount > 0 && <th style={{ padding: "6px 8px", textAlign: "center", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Status</th>}
                  </tr>
                </thead>
                <tbody>
                  {[...rangeRows].reverse().map(({ date, label, amount }) => {
                    const isToday = date === getDaysAgoIso(0);
                    const pct = amount > 0 && targetAmount > 0 ? (amount / targetAmount) * 100 : 0;
                    const hit = amount > 0 && targetAmount > 0 && amount >= targetAmount;
                    return (
                      <tr key={date} style={{ borderBottom: "1px solid #eee", background: isToday ? "#fffbeb" : "transparent" }}>
                        <td style={{ padding: "5px 8px" }}>
                          <strong>{label}</strong>
                          {isToday && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, color: "#b45309", textTransform: "uppercase" }}>Today</span>}
                        </td>
                        <td style={{ padding: "5px 8px", textAlign: "right", fontWeight: 500 }}>
                          {amount > 0 ? formatCurrency(amount, tabCurrencyCode) : "—"}
                        </td>
                        {targetAmount > 0 && (
                          <td style={{ padding: "5px 8px", textAlign: "right", color: hit ? "#16a34a" : "#64748b" }}>
                            {amount > 0 ? `${pct.toFixed(1)}%` : "—"}
                          </td>
                        )}
                        {targetAmount > 0 && (
                          <td style={{ padding: "5px 8px", textAlign: "center" }}>
                            {amount > 0 ? (
                              <span style={{ display: "inline-block", fontSize: 9, fontWeight: 700, textTransform: "uppercase", padding: "2px 6px", borderRadius: 3, background: hit ? "#dcfce7" : "#fef9c3", color: hit ? "#166534" : "#854d0e" }}>
                                {hit ? "✓ Hit" : "In Progress"}
                              </span>
                            ) : "—"}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "2px solid #111" }}>
                    <td style={{ padding: "6px 8px", fontWeight: 700 }}>Total ({rangeRows.length} days)</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, color: "#4338ca" }}>
                      {formatCurrency(rangeRows.reduce((s, r) => s + (r.amount || 0), 0), tabCurrencyCode)}
                    </td>
                    {targetAmount > 0 && <td colSpan={2} />}
                  </tr>
                </tfoot>
              </table>
            </>
          )}
        </PrintableDocument>
      </PrintPreviewDialog>
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const AdminReportsPage: React.FC = () => {
  const router = useRouter();
  const { currencyCode, inventory, theme, systemName } = usePublicSettings();
  const { isMobile } = useResolution();
  const [period, setPeriod] = useState<ChartPeriod>("30d");

  const initialTabIndex = useMemo(() => {
    if (router.query.tab === "daily_target") return 3;
    return 0;
  }, [router.query.tab]);

  // useDeferredValue means the charts re-render with a lower priority when the
  // period changes — KPI cards and the header update instantly while charts
  // catch up without blocking the main thread.
  const deferredPeriod = useDeferredValue(period);
  const isTransitioning = period !== deferredPeriod;
  const [refreshDialogOpen, setRefreshDialogOpen] = useState(false);
  const [tabPrint, setTabPrint] = useState<"chart" | "financial" | null>(null);

  // ── Data fetches (all run in parallel on mount) ───────────────────────────

  const salesChart = useChart({ chartKey: "sales-by-day", period });
  const dailySummaryApi = useApi((api) => api.commons.salesDailySummary(), []);
  const dailySummaryResponse = dailySummaryApi.result?.data?.response;
  const todayTotal = getDailySalesGross(dailySummaryResponse);
  const salesCount = dailySummaryResponse?.salesCount ?? 0;
  const dailySummaryAmount = dailySummaryApi.result?.data?.response?.totalAmount ?? null;
  const grossSales = period === "today"
    ? dailySummaryAmount
    : (salesChart.data?.meta?.total ?? null);
  const salesLoading = period === "today" ? dailySummaryApi.loading : salesChart.loading;

  const productsApi = useApi((api) => api.commons.productList());
  const productOptions = useMemo<ProductOption[]>(() => {
    const resp = productsApi.result?.data?.response;
    if (!Array.isArray(resp)) return [];
    return resp
      .filter((p) => p.isActive)
      .map((p) => ({ id: p.productID, name: p.name }));
  }, [productsApi.result]);

  // Filter expenses and invoices based on selected period
  const { from: periodFrom, to: periodTo } = useMemo(
    () => periodToDateRange(period),
    [period],
  );

  // Only fetch count (pageSize: 1) — we only need totalItems
  const saleListApi = useApi(
    (api) => api.commons.saleList({ pageNumber: 1, pageSize: 1, status: 1, fromDate: periodFrom, toDate: periodTo }),
    [periodFrom, periodTo],
  );
  const totalTransactions =
    saleListApi.result?.data?.response?.totalItems ?? null;

  // Fetch invoices for procurement cost sum
  const invoiceApi = useApi(
    (api) => api.commons.supplierInvoiceList({ pageNumber: 1, pageSize: 500 }),
    [],
  );

  // Fetch business expenses from the dedicated BusinessExpense table
  const businessExpenseApi = useApi(
    (api) => api.commons.businessExpenseList(),
    [],
  );

  const filteredInvoices = useMemo(() => {
    const invoiceItems = invoiceApi.result?.data?.response?.items;
    if (!Array.isArray(invoiceItems)) return [];
    return filterInvoicesByPeriod(invoiceItems, periodFrom, periodTo);
  }, [invoiceApi.result, periodFrom, periodTo]);

  const filteredBusinessExpenses = useMemo(() => {
    const expenses = businessExpenseApi.result?.data?.response;
    if (!Array.isArray(expenses)) return [];
    return filterExpensesByPeriod(expenses, periodFrom, periodTo);
  }, [businessExpenseApi.result, periodFrom, periodTo]);

  const procurementCost = useMemo(() => {
    if (filteredInvoices.length === 0) return null;
    return filteredInvoices.reduce((sum, inv) => sum + (inv.paidAmount ?? 0), 0);
  }, [filteredInvoices]);

  const operationalExpenses = useMemo(() => {
    if (filteredInvoices.length === 0) return null;
    return filteredInvoices.reduce((sum, inv) => sum + (inv.paidAmount ?? 0), 0);
  }, [filteredInvoices]);

  const businessSupplyExpenses = useMemo(() => {
    if (filteredBusinessExpenses.length === 0) return null;
    return filteredBusinessExpenses.reduce((sum, expense) => sum + (expense.amount ?? 0), 0);
  }, [filteredBusinessExpenses]);

  // Conditional — only fires when low stock alert is enabled
  const lowStockApi = useApi(
    (api) => {
      if (!inventory.lowStockAlertEnabled) return Promise.resolve(undefined);
      return api.commons.inventoryLowStock();
    },
    [inventory.lowStockAlertEnabled],
  );
  const lowStockCount = useMemo(() => {
    const arr = lowStockApi.result?.data?.response;
    return Array.isArray(arr) ? arr.length : null;
  }, [lowStockApi.result]);

  const grossProfit = useMemo(() => {
    if (grossSales === null || procurementCost === null) return null;
    return grossSales - procurementCost;
  }, [grossSales, procurementCost]);

  const totalExpenses = useMemo(() => {
    if (operationalExpenses === null || businessSupplyExpenses === null) return null;
    return operationalExpenses + businessSupplyExpenses;
  }, [operationalExpenses, businessSupplyExpenses]);

  const netProfit = useMemo(() => {
    if (grossSales === null || totalExpenses === null) return null;
    return grossSales - totalExpenses;
  }, [grossSales, totalExpenses]);

  const financialReportApi = useApi(
    (api) => api.commons.financialReport({ From: periodFrom, To: periodTo }),
    [periodFrom, periodTo],
  );
  const revenueByProduct: FinancialReportProductRevenueItemDto[] =
    financialReportApi.result?.data?.response?.revenueByProduct ?? [];

  const salesForecastApi = useApi((api) => api.commons.salesForecast(), []);

  const isRefreshing =
    dailySummaryApi.loading ||
    productsApi.loading ||
    saleListApi.loading ||
    invoiceApi.loading ||
    businessExpenseApi.loading ||
    lowStockApi.loading ||
    financialReportApi.loading ||
    salesChart.loading;

  const handleRefresh = useCallback(() => {
    setRefreshDialogOpen(true);
    dailySummaryApi.execute();
    productsApi.execute();
    saleListApi.execute();
    invoiceApi.execute();
    businessExpenseApi.execute();
    lowStockApi.execute();
    financialReportApi.execute();
    salesChart.refresh();
    salesForecastApi.execute();
  }, [dailySummaryApi, productsApi, saleListApi, invoiceApi, businessExpenseApi, lowStockApi, financialReportApi, salesChart, salesForecastApi]);

  useEffect(() => {
    if (!isRefreshing && refreshDialogOpen) {
      const t = setTimeout(() => setRefreshDialogOpen(false), 800);
      return () => clearTimeout(t);
    }
  }, [isRefreshing, refreshDialogOpen]);

  // ── KPI tiles ─────────────────────────────────────────────────────────────

  const periodLabel = useMemo(
    () => PERIODS.find((p) => p.value === period)?.label ?? period,
    [period],
  );

  const kpiTiles = useMemo<KpiTile[]>(
    () => [
      {
        label: "Gross Sales",
        value: formatCurrency(grossSales, currencyCode),
        hint: `Revenue · ${periodLabel}`,
        accent: "indigo",
        icon: <TrendingUpOutlined style={{ fontSize: 18 }} />,
        loading: salesLoading,
      },
      {
        label: "Gross Profit",
        value:
          grossProfit !== null ? formatCurrency(grossProfit, currencyCode) : null,
        hint: "Sales minus total expenses",
        accent: grossProfit !== null && grossProfit >= 0 ? "green" : "red",
        icon: <SavingsOutlined style={{ fontSize: 18 }} />,
        loading: salesLoading || invoiceApi.loading,
      },
      {
        label: "Operational Expenses",
        value: formatCurrency(operationalExpenses, currencyCode),
        hint: "Ingredients & inventory",
        accent: "amber",
        icon: <ShoppingCartOutlined style={{ fontSize: 18 }} />,
        loading: invoiceApi.loading,
      },
      {
        label: "Business Supply Expenses",
        value: formatCurrency(businessSupplyExpenses, currencyCode),
        hint: `Non-sellable items & overhead · ${periodLabel}`,
        accent: "orange",
        icon: <AccountBalanceWalletOutlined style={{ fontSize: 18 }} />,
        loading: businessExpenseApi.loading,
      },
      {
        label: "Transactions",
        value: totalTransactions?.toLocaleString() ?? null,
        hint: "Completed POS sales",
        accent: "teal",
        icon: <ShoppingCartOutlined style={{ fontSize: 18 }} />,
        loading: saleListApi.loading,
      },
      {
        label: "Low Stock",
        value: lowStockCount?.toLocaleString() ?? null,
        hint: inventory.lowStockAlertEnabled
          ? lowStockCount
            ? "Action needed"
            : "Inventory healthy"
          : "Alert disabled",
        accent: lowStockCount ? "amber" : "teal",
        icon: <WarningAmberOutlined style={{ fontSize: 18 }} />,
        loading: lowStockApi.loading,
      },
    ],
    [
      grossSales,
      grossProfit,
      operationalExpenses,
      businessSupplyExpenses,
      totalTransactions,
      lowStockCount,
      salesLoading,
      invoiceApi.loading,
      businessExpenseApi.loading,
      saleListApi.loading,
      lowStockApi.loading,
      currencyCode,
      periodLabel,
      inventory.lowStockAlertEnabled,
    ],
  );

  const handlePrint = useCallback(() => window.print(), []);

  // Build tabs
  const tabs = useMemo<TabOption[]>(
    () => [
      {
        key: "reports_charts",
        label: "Reports Chart",
        content: (
          <Box pt="4">
            <Flex justify="end" mb="3">
              <Button size="1" variant="soft" color="indigo" onClick={() => setTabPrint("chart")}>
                <PrintOutlined style={{ fontSize: 13 }} />
                Print this report
              </Button>
            </Flex>
            {/* ── Info Alert ────────────────────────────────────────────────– */}
            <Callout.Root color="blue" mb="4">
              <InfoOutlined style={{ fontSize: 18 }} />
              <Callout.Text>
                <strong>Gross Profit Breakdown:</strong> Gross Sales minus Cost of Goods Sold (COGS). Formula: <code>Gross Profit = Revenue - COGS</code>. This shows profitability before operating expenses are deducted.
              </Callout.Text>
            </Callout.Root>

            {/* ── Charts: Revenue & Sales ───────────────────────────────────── */}
            <div className="no-print">
              <ReportSection
                title="Revenue & Sales"
                description="Trends, payment breakdown and top products"
                icon={<TrendingUpOutlined style={{ fontSize: 18 }} />}
                accent="indigo"
                delay={0.15}
              >
                {/* Full-width area chart */}
                <Box
                  mb="3"
                  style={{ opacity: isTransitioning ? 0.6 : 1, transition: "opacity 0.2s" }}
                >
                  <ChartCard
                    key={`revenue-${deferredPeriod}`}
                    chartKey="sales-by-day"
                    title="Revenue Over Time"
                    description="Daily gross sales"
                    icon={<ActivityLogIcon />}
                    typeOverride="area"
                    showFilters
                    productOptions={productOptions}
                    initialFilters={{ period: deferredPeriod, groupBy: "day" }}
                    height={320}
                    xAxisLabel="Date"
                    yAxisLabel="Revenue"
                  />
                </Box>

                <Grid
                  columns={{ initial: "1", md: "2" }}
                  gap="3"
                  style={{ opacity: isTransitioning ? 0.6 : 1, transition: "opacity 0.2s" }}
                >
                  <ChartCard
                    key={`top-products-${deferredPeriod}`}
                    chartKey="top-products"
                    title="Top Products by Revenue"
                    description="Best-selling products this period"
                    icon={<BarChartIcon />}
                    showFilters
                    productOptions={productOptions}
                    initialFilters={{ period: deferredPeriod, groupBy: "day" }}
                    height={320}
                  />
                  <ChartCard
                    key={`sales-payment-${deferredPeriod}`}
                    chartKey="sales-by-payment-method"
                    title="Sales by Payment Method"
                    description="Cash, card and digital wallets"
                    icon={<PaidOutlined style={{ fontSize: 16 }} />}
                    typeOverride="bar"
                    showFilters
                    initialFilters={{ period: deferredPeriod, groupBy: "day" }}
                    height={320}
                  />
                </Grid>
              </ReportSection>

              {/* ── Charts: Inventory & Stock ─────────────────────────────────── */}
              <ReportSection
                title="Inventory & Stock"
                description="Stock health, movements and category breakdown"
                icon={<CubeIcon />}
                accent="teal"
                delay={0.2}
              >
                <Grid
                  columns={{ initial: "1", sm: "2", xl: "3" }}
                  gap="3"
                  style={{ opacity: isTransitioning ? 0.6 : 1, transition: "opacity 0.2s" }}
                >
                  <ChartCard
                    key={`stock-movements-${deferredPeriod}`}
                    chartKey="stock-movements-by-type"
                    title="Stock Movements"
                    description="Receives, deductions and adjustments"
                    icon={<LayersIcon />}
                    showFilters
                    productOptions={productOptions}
                    initialFilters={{ period: deferredPeriod, groupBy: "day" }}
                    height={300}
                  />
                  <ChartCard
                    key={`inventory-status-${deferredPeriod}`}
                    chartKey="inventory-by-status"
                    title="Inventory Health"
                    description="In Stock · Low · Critical · Out of Stock"
                    icon={<CubeIcon />}
                    typeOverride="donut"
                    height={300}
                  />
                  <ChartCard
                    key={`products-category-${deferredPeriod}`}
                    chartKey="products-by-category"
                    title="Products by Category"
                    description="Catalog spread across categories"
                    icon={<PieChartIcon />}
                    typeOverride="donut"
                    height={300}
                  />
                </Grid>
              </ReportSection>
            </div>

            {/* ── Charts: Procurement & Expenses ───────────────────────────── */}
            <ReportSection
              title="Procurement & Expenses"
              description="Supplier invoices and purchase cost trends"
              icon={<AccountBalanceWalletOutlined style={{ fontSize: 18 }} />}
              accent="amber"
              delay={0.25}
            >
              <Grid columns={{ initial: "1", md: "2" }} gap="3">
                <ProcurementTrendCard
                  invoices={filteredInvoices}
                  loading={invoiceApi.loading}
                  currencyCode={currencyCode}
                />
                <InvoiceStatusCard
                  invoices={filteredInvoices}
                  loading={invoiceApi.loading}
                  currencyCode={currencyCode}
                />
              </Grid>
            </ReportSection>

            {/* ── Financial Summary card ────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.3 }}
            >
              <Card
                variant="surface"
                mb="5"
                style={{
                  background: "var(--color-panel-solid)",
                  border: "1px solid var(--gray-a4)",
                }}
              >
                <Box p={{ initial: "3", sm: "4" }}>
                  {/* Header */}
                  <Flex align="center" gap="3" mb="4" wrap="wrap">
                    <Box
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "var(--radius-3)",
                        background:
                          "linear-gradient(135deg, var(--green-a3), var(--teal-a3))",
                        color: "var(--green-11)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <SavingsOutlined style={{ fontSize: 20 }} />
                    </Box>
                    <Box style={{ minWidth: 0, flex: 1 }}>
                      <Heading size="4" weight="bold">
                        Financial Summary
                      </Heading>
                      <Text size="2" color="gray">
                        Period: {periodLabel}
                      </Text>
                    </Box>
                    <Badge color="green" variant="soft" radius="full">
                      <CalendarIcon />
                      <Text size="1">{periodLabel}</Text>
                    </Badge>
                  </Flex>

                  {/* 4-tile grid */}
                  <Grid
                    columns={{ initial: "2", sm: "2", md: "4" }}
                    gap="3"
                    mb="4"
                  >
                    <SummaryTile
                      label="Gross Sales"
                      value={formatCurrency(grossSales, currencyCode)}
                      loading={salesLoading}
                      color="var(--indigo-11)"
                      hint="Total POS revenue"
                    />
                    <SummaryTile
                      label="Procurement Cost"
                      value={formatCurrency(procurementCost, currencyCode)}
                      loading={invoiceApi.loading}
                      color="var(--orange-11)"
                      hint="Paid invoices"
                      negative
                    />
                    <SummaryTile
                      label="Transactions"
                      value={totalTransactions?.toLocaleString() ?? "—"}
                      loading={saleListApi.loading}
                      color="var(--teal-11)"
                      hint="Completed sales"
                    />
                    <SummaryTile
                      label="Low Stock"
                      value={lowStockCount?.toLocaleString() ?? "—"}
                      loading={lowStockApi.loading}
                      color={
                        lowStockCount
                          ? "var(--amber-11)"
                          : "var(--green-11)"
                      }
                      hint={lowStockCount ? "Needs reorder" : "Fully stocked"}
                    />
                  </Grid>

                  <Separator
                    size="4"
                    style={{ background: "var(--gray-a4)", marginBottom: 16 }}
                  />

                  {/* Gross Profit highlight */}
                  <Flex justify="between" align="center" wrap="wrap" gap="3">
                    <Box style={{ minWidth: 0 }}>
                      <Text
                        size="2"
                        color="gray"
                        weight="medium"
                        style={{ textTransform: "uppercase", letterSpacing: 0.6 }}
                      >
                        Estimated Gross Profit
                      </Text>
                      <Text size="1" color="gray" as="div" mt="1">
                        Gross Sales minus total Procurement Cost
                      </Text>
                    </Box>

                    {invoiceApi.loading || salesLoading ? (
                      <Skeleton width="160px" height="36px" />
                    ) : (
                      <Heading
                        size={{ initial: "6", sm: "7" }}
                        weight="bold"
                        style={{
                          color:
                            grossProfit !== null && grossProfit >= 0
                              ? "var(--green-11)"
                              : "var(--red-11)",
                          lineHeight: 1,
                          flexShrink: 0,
                        }}
                      >
                        {grossProfit !== null
                          ? formatCurrency(grossProfit, currencyCode)
                          : "—"}
                      </Heading>
                    )}
                  </Flex>
                </Box>
              </Card>
            </motion.div>

            <Box style={{ height: 24 }} />
          </Box>
        ),
      },
      {
        key: "financial_summary",
        label: "Financial Summary",
        content: (
          <Box pt="4">
            <Flex justify="end" mb="3">
              <Button size="1" variant="soft" color="indigo" onClick={() => setTabPrint("financial")}>
                <PrintOutlined style={{ fontSize: 13 }} />
                Print this report
              </Button>
            </Flex>
            {/* ── Info Alert ────────────────────────────────────────────────– */}
            <Callout.Root color="teal" mb="4">
              <InfoOutlined style={{ fontSize: 18 }} />
              <Callout.Text>
                <strong>Net Profit vs Gross Profit:</strong> Net Profit = Gross Profit - Operating Expenses. Formula: <code>Net Profit = Revenue - COGS - Operating Expenses</code>. This is the final profit/loss after all business expenses are deducted.
              </Callout.Text>
            </Callout.Root>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <FinancialSummaryTable
                data={{
                  currencyCode,
                  grossSales,
                  cogs: operationalExpenses,
                  grossProfit,
                  operationalExpenses,
                  businessSupplyExpenses,
                  totalExpenses,
                  netProfit,
                  totalTransactions,
                  inventoryValue: financialReportApi.result?.data?.response?.directStockValue ?? null,
                  lowStockCount,
                }}
              />
            </motion.div>

          </Box>
        ),
      },
      {
        key: "product_variant",
        label: "Product by Variant",
        content: (
          <ProductVariantTab
            data={revenueByProduct}
            loading={financialReportApi.loading}
            currencyCode={currencyCode}
            periodLabel={periodLabel}
          />
        ),
      },
      {
        key: "daily_target",
        label: "Daily Sales Target",
        content: <DailySalesTargetTab todayTotal={todayTotal} salesCount={salesCount} salesLoading={dailySummaryApi.loading} />,
      },
      {
        key: "shift_details",
        label: "Shift Details",
        content: <ShiftDetailsTab />,
      },
      {
        key: "sales_forecast",
        label: "Sales Forecast",
        content: (
          <SalesForecastingTab
            currencyCode={currencyCode}
            businessName={systemName}
            logoUrl={theme?.logoUrl ?? null}
          />
        ),
      },
    ],
    [
      deferredPeriod,
      isTransitioning,
      kpiTiles,
      productOptions,
      currencyCode,
      grossSales,
      operationalExpenses,
      businessSupplyExpenses,
      grossProfit,
      totalExpenses,
      netProfit,
      totalTransactions,
      lowStockCount,
      periodLabel,
      salesLoading,
      invoiceApi.loading,
      businessExpenseApi.loading,
      saleListApi.loading,
      lowStockApi.loading,
      procurementCost,
      dailySummaryApi.result,
      todayTotal,
      salesCount,
      systemName,
      theme?.logoUrl,
      financialReportApi.loading,
      financialReportApi.result,
      revenueByProduct,
      filteredInvoices,
    ],
  );

  return (
    <>
      {/* Print + animation styles */}
      <style>{`
        .print-only { display: none; }

        @media screen {
          .reports-hero-bg {
            background: ${
              theme.primaryColor && theme.secondaryColor
                ? `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 55%, ${theme.primaryColor} 100%)`
                : `linear-gradient(135deg, var(--indigo-11) 0%, var(--violet-9) 55%, var(--indigo-9) 100%)`
            };
          }
          .period-btn:hover { background: rgba(255,255,255,0.18) !important; }
        }

        @media print {
          /* ── Hide all shell chrome ── */
          aside[aria-label="Primary navigation"],
          [data-layout="app-header"],
          [data-layout="maintenance-banner"] {
            display: none !important;
          }

          /* ── Make content fill the full page ── */
          body, html {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* ── Remove padding/background from the content shell ── */
          body > div,
          #__next,
          #__next > * {
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            overflow: visible !important;
          }

          /* ── Reports page content fills full width ── */
          .reports-print-root {
            width: 100% !important;
            max-width: 100% !important;
            padding: 16px !important;
            margin: 0 !important;
          }

          /* ── Card styling for print ── */
          .rt-Card {
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
            break-inside: avoid;
          }

          /* ── Toggle display helpers ── */
          .no-print { display: none !important; }
          .print-only { display: block !important; }

          /* ── Charts: keep together on same page ── */
          .recharts-wrapper { break-inside: avoid; }

          /* ── Hero background prints as a solid color (browsers strip CSS gradients by default) ── */
          .reports-hero-bg {
            background: ${theme.primaryColor || "#4338ca"} !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <Box style={{ minHeight: "100%", background: "var(--gray-2)" }}>
        <Box
          className="reports-print-root"
          px={{ initial: "3", sm: "4", md: "5" }}
          py="4"
          style={{ width: "100%" }}
        >

          {/* ── Hero ─────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Box
              mb="4"
              p={{ initial: "4", sm: "5" }}
              className="reports-hero-bg"
              style={{
                borderRadius: "var(--radius-4)",
                position: "relative",
                overflow: "hidden",
                boxShadow: "var(--shadow-3)",
              }}
            >
              <Box
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "radial-gradient(circle at 10% 20%, rgba(255,255,255,0.12) 0, transparent 40%), " +
                    "radial-gradient(circle at 90% 80%, rgba(255,255,255,0.07) 0, transparent 35%)",
                  pointerEvents: "none",
                }}
              />

              {/* Title + print button */}
              <Flex
                justify="between"
                align="center"
                wrap="wrap"
                gap="3"
                style={{ position: "relative" }}
              >
                <Flex align="center" gap="3">
                  <Box
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "var(--radius-3)",
                      background: "rgba(255,255,255,0.16)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      flexShrink: 0,
                    }}
                  >
                    <AssessmentOutlined style={{ fontSize: 26 }} />
                  </Box>
                  <Box>
                    <Heading
                      size={{ initial: "5", sm: "6" }}
                      weight="bold"
                      style={{ color: "white", lineHeight: 1.1 }}
                    >
                      Reports & Analytics
                    </Heading>
                    <Text size="2" style={{ color: "rgba(255,255,255,0.75)" }}>
                      Financial · Operations · Inventory
                    </Text>
                  </Box>
                </Flex>

                <Flex align="center" gap="2" className="no-print">
                  <Button
                    variant="soft"
                    size="2"
                    disabled={refreshDialogOpen}
                    onClick={handleRefresh}
                    style={{
                      background: "rgba(255,255,255,0.16)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.25)",
                      gap: 6,
                    }}
                  >
                    <RefreshOutlined style={{ fontSize: 15 }} />
                    Refresh All
                  </Button>
                  <Button
                    variant="soft"
                    size="2"
                    onClick={handlePrint}
                    style={{
                      background: "rgba(255,255,255,0.16)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.25)",
                    }}
                  >
                    <PrintOutlined style={{ fontSize: 15 }} />
                    Print
                  </Button>
                </Flex>
              </Flex>

              {/* Period pills */}
              <Box mt="4" style={{ position: "relative" }} className="no-print">
                <ScrollArea type="auto" scrollbars="horizontal">
                  <Flex gap="2" pb="1">
                    {PERIODS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        className="period-btn"
                        onClick={() => setPeriod(p.value)}
                        style={{
                          padding: "5px 14px",
                          borderRadius: 999,
                          border:
                            period === p.value
                              ? "1px solid rgba(255,255,255,0.9)"
                              : "1px solid rgba(255,255,255,0.3)",
                          background:
                            period === p.value
                              ? "rgba(255,255,255,0.22)"
                              : "transparent",
                          color: "white",
                          fontSize: 12,
                          fontWeight: period === p.value ? 700 : 500,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </Flex>
                </ScrollArea>
              </Box>

              {/* Print-only period */}
              <Box className="print-only" mt="2">
                <Text size="2" style={{ color: "rgba(255,255,255,0.85)" }}>
                  Period: {periodLabel} · Printed{" "}
                  {new Date().toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </Box>
            </Box>
          </motion.div>

          {/* ── KPI tiles ────────────────────────────────────────────────── */}
          <Grid
            columns={{ initial: "2", sm: "3", md: "6" }}
            gap="3"
            mb="5"
          >
            {kpiTiles.map((tile, idx) => (
              <KpiCard key={tile.label} tile={tile} delay={idx * 0.05} />
            ))}
          </Grid>

          {/* ── Print-only: chart summary tables ────────────────────── */}
          <div className="print-only" style={{ marginBottom: 24 }}>
            {/* Revenue & Sales */}
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  background: "#eef2ff",
                  padding: "10px 16px",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <strong style={{ fontSize: 14, color: "#4338ca" }}>
                  Revenue &amp; Sales Summary
                </strong>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Period: {periodLabel}
                </span>
              </div>
              <div style={{ padding: "12px 16px" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "7px 0", color: "#64748b" }}>
                        Gross Sales
                      </td>
                      <td
                        style={{
                          padding: "7px 0",
                          textAlign: "right",
                          fontWeight: 700,
                          color: "#4338ca",
                        }}
                      >
                        {formatCurrency(grossSales, currencyCode)}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "7px 0", color: "#64748b" }}>
                        Total Transactions
                      </td>
                      <td
                        style={{
                          padding: "7px 0",
                          textAlign: "right",
                          fontWeight: 600,
                        }}
                      >
                        {totalTransactions?.toLocaleString() ?? "—"}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "7px 0", color: "#64748b" }}>
                        Operational Expenses
                      </td>
                      <td
                        style={{
                          padding: "7px 0",
                          textAlign: "right",
                          fontWeight: 600,
                          color: "#b45309",
                        }}
                      >
                        {formatCurrency(operationalExpenses, currencyCode)}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "7px 0", color: "#64748b" }}>
                        Business Supply Expenses
                      </td>
                      <td
                        style={{
                          padding: "7px 0",
                          textAlign: "right",
                          fontWeight: 600,
                          color: "#ea580c",
                        }}
                      >
                        {formatCurrency(businessSupplyExpenses, currencyCode)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: "7px 0",
                          color: "#64748b",
                          fontWeight: 500,
                        }}
                      >
                        Estimated Gross Profit
                      </td>
                      <td
                        style={{
                          padding: "7px 0",
                          textAlign: "right",
                          fontWeight: 700,
                          color:
                            grossProfit !== null && grossProfit >= 0
                              ? "#16a34a"
                              : "#dc2626",
                        }}
                      >
                        {grossProfit !== null
                          ? formatCurrency(grossProfit, currencyCode)
                          : "—"}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 11,
                    color: "#94a3b8",
                    fontStyle: "italic",
                  }}
                >
                  * Detailed revenue charts and product-level breakdown are
                  available in the web application.
                </p>
              </div>
            </div>

            {/* Inventory */}
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: "#f0fdfa",
                  padding: "10px 16px",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <strong style={{ fontSize: 14, color: "#0f766e" }}>
                  Inventory Summary
                </strong>
              </div>
              <div style={{ padding: "12px 16px" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "7px 0", color: "#64748b" }}>
                        Active Products
                      </td>
                      <td
                        style={{
                          padding: "7px 0",
                          textAlign: "right",
                          fontWeight: 600,
                        }}
                      >
                        {productOptions.length > 0
                          ? productOptions.length.toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "7px 0", color: "#64748b" }}>
                        Low Stock Items
                      </td>
                      <td
                        style={{
                          padding: "7px 0",
                          textAlign: "right",
                          fontWeight: 600,
                          color: lowStockCount ? "#d97706" : "#16a34a",
                        }}
                      >
                        {inventory.lowStockAlertEnabled
                          ? lowStockCount?.toLocaleString() ?? "—"
                          : "Alert disabled"}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 11,
                    color: "#94a3b8",
                    fontStyle: "italic",
                  }}
                >
                  * Stock movement charts and category breakdown are available
                  in the web application.
                </p>
              </div>
            </div>
          </div>

          {/* ── Tabs Container ────────────────────────────────────────────── */}
          <div className="no-print">
            <TabsContextProvider initialIndex={initialTabIndex}>
              {isMobile ? (
                <TabsHeaderMobile id="reports_tabs_mobile" tabs={tabs} />
              ) : (
                <TabsHeaderDesktop id="reports_tabs_desktop" tabs={tabs} />
              )}
              {tabs.map((tab, index) => (
                <TabPanel
                  index={index}
                  id={`${tab.key}_tabpanel_${index}`}
                  aria-labelledby={`${tab.key}_tab_${index}`}
                  key={`${tab.key}_${index}`}
                >
                  {tab.content}
                </TabPanel>
              ))}
            </TabsContextProvider>
          </div>
        </Box>
      </Box>

      {/* Refresh all dialog */}
      <Dialog.Root open={refreshDialogOpen}>
        <Dialog.Content
          style={{
            maxWidth: 340,
            textAlign: "center",
            padding: "48px 32px 40px",
            borderRadius: 20,
            overflow: "visible",
          }}
          aria-describedby={undefined}
        >
          <Flex direction="column" align="center" gap="5">

            {/* Animated icon stack */}
            <Box style={{ position: "relative", width: 96, height: 96 }}>
              {/* Outer slow-spinning ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "3px dashed var(--accent-6)",
                  opacity: 0.7,
                }}
              />
              {/* Inner fast-spinning ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute",
                  inset: 10,
                  borderRadius: "50%",
                  border: "3px solid transparent",
                  borderTopColor: "var(--accent-9)",
                  borderRightColor: "var(--accent-7)",
                }}
              />
              {/* Center icon */}
              <Flex
                align="center"
                justify="center"
                style={{
                  position: "absolute",
                  inset: 18,
                  borderRadius: "50%",
                  background: "var(--accent-3)",
                }}
              >
                <RefreshOutlined style={{ fontSize: 28, color: "var(--accent-9)" }} />
              </Flex>
            </Box>

            {/* Text */}
            <Flex direction="column" gap="2" align="center">
              <Heading size="4" weight="bold">
                Refreshing Reports
              </Heading>
              <Text
                size="2"
                color="gray"
                style={{ animation: "pulse 1.8s ease-in-out infinite" }}
              >
                Updating all your data, please wait…
              </Text>
            </Flex>

          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* ── Per-Tab Print Previews ── */}
      {tabPrint === "chart" && (
        <PrintPreviewDialog
          open
          onOpenChange={() => setTabPrint(null)}
          title={`Reports Chart · ${periodLabel}`}
        >
          <PrintableDocument
            businessName={systemName}
            logoUrl={theme?.logoUrl ?? null}
            documentLabel="Reports Chart"
            documentNumber={periodLabel}
          >
            {/* ── Financial Overview ── */}
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#444", fontWeight: 700, marginBottom: 10 }}>Financial Overview</div>
            <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Gross Sales", value: formatCurrency(grossSales, currencyCode), color: "#4338ca", bg: "#eef2ff", border: "#c7d2fe" },
                { label: "Gross Profit", value: grossProfit !== null ? formatCurrency(grossProfit, currencyCode) : "—", color: grossProfit !== null && grossProfit >= 0 ? "#16a34a" : "#dc2626", bg: grossProfit !== null && grossProfit >= 0 ? "#f0fdf4" : "#fef2f2", border: grossProfit !== null && grossProfit >= 0 ? "#bbf7d0" : "#fecaca" },
                { label: "Transactions", value: totalTransactions?.toLocaleString() ?? "—", color: "#0f766e", bg: "#f0fdfa", border: "#99f6e4" },
                { label: "Operational Expenses", value: formatCurrency(operationalExpenses, currencyCode), color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
                { label: "Business Supply Expenses", value: formatCurrency(businessSupplyExpenses, currencyCode), color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
                { label: "Low Stock Items", value: inventory.lowStockAlertEnabled ? (lowStockCount?.toLocaleString() ?? "—") : "Alert disabled", color: lowStockCount ? "#d97706" : "#16a34a", bg: lowStockCount ? "#fffbeb" : "#f0fdf4", border: lowStockCount ? "#fde68a" : "#bbf7d0" },
              ].map(({ label, value, color, bg, border }) => (
                <Box key={label} style={{ padding: "10px 12px", background: bg, border: `1px solid ${border}`, borderRadius: 6 }}>
                  <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888", fontWeight: 700, marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color }}>{value}</div>
                </Box>
              ))}
            </Box>

            {/* ── Revenue by Day ── */}
            {(() => {
              const revenueRows = (salesChart.data?.points ?? [])
                .map((p) => ({
                  label: p.label,
                  amount: (Object.values(p.values)[0] ?? 0) as number,
                }))
                .filter((r) => r.amount > 0);
              const periodTotal = revenueRows.reduce((s, r) => s + r.amount, 0);
              if (revenueRows.length === 0) return null;
              return (
                <Box mb="4">
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#444", fontWeight: 700, marginBottom: 8 }}>
                    Revenue by Day — {periodLabel}
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #111" }}>
                        <th style={{ padding: "6px 8px", textAlign: "left", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Date</th>
                        <th style={{ padding: "6px 8px", textAlign: "right", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueRows.map((r, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: "5px 8px" }}>{r.label}</td>
                          <td style={{ padding: "5px 8px", textAlign: "right", fontWeight: 500 }}>{formatCurrency(r.amount, currencyCode)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: "2px solid #111" }}>
                        <td style={{ padding: "6px 8px", fontWeight: 700 }}>Total</td>
                        <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, color: "#4338ca" }}>{formatCurrency(periodTotal, currencyCode)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </Box>
              );
            })()}

            {/* ── Procurement & Expenses ── */}
            {(() => {
              const paidInvoices = filteredInvoices
                .filter((inv) => (inv.paidAmount ?? 0) > 0)
                .slice(0, 20);
              const procTotal = paidInvoices.reduce((s, inv) => s + (inv.paidAmount ?? 0), 0);
              if (paidInvoices.length === 0) return null;
              return (
                <Box mb="4">
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#444", fontWeight: 700, marginBottom: 8 }}>
                    Procurement & Paid Invoices
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #111" }}>
                        <th style={{ padding: "6px 8px", textAlign: "left", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Supplier</th>
                        <th style={{ padding: "6px 8px", textAlign: "left", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Invoice #</th>
                        <th style={{ padding: "6px 8px", textAlign: "right", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Paid Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paidInvoices.map((inv) => (
                        <tr key={inv.supplierInvoiceID} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: "5px 8px" }}>{inv.supplierName}</td>
                          <td style={{ padding: "5px 8px", color: "#64748b" }}>{inv.invoiceNumber}</td>
                          <td style={{ padding: "5px 8px", textAlign: "right", fontWeight: 500 }}>{formatCurrency(inv.paidAmount ?? 0, currencyCode)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: "2px solid #111" }}>
                        <td colSpan={2} style={{ padding: "6px 8px", fontWeight: 700 }}>Total Procurement</td>
                        <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, color: "#b45309" }}>{formatCurrency(procTotal, currencyCode)}</td>
                      </tr>
                    </tfoot>
                  </table>
                  {paidInvoices.length === 20 && (
                    <p style={{ fontSize: 10, color: "#94a3b8", fontStyle: "italic", marginTop: 4 }}>
                      * Showing top 20 paid invoices. View all in Procurement → Invoices.
                    </p>
                  )}
                </Box>
              );
            })()}

            <p style={{ fontSize: 10, color: "#94a3b8", fontStyle: "italic", marginTop: 8 }}>
              * Visual charts (bar, line, donut) are available in the web application.
            </p>
          </PrintableDocument>
        </PrintPreviewDialog>
      )}

      {tabPrint === "financial" && (
        <PrintPreviewDialog
          open
          onOpenChange={() => setTabPrint(null)}
          title={`Financial Summary · ${periodLabel}`}
        >
          <PrintableDocument
            businessName={systemName}
            logoUrl={theme?.logoUrl ?? null}
            documentLabel="Financial Summary"
            documentNumber={periodLabel}
          >
            <FinancialSummaryTable
              data={{
                currencyCode,
                grossSales,
                cogs: operationalExpenses,
                grossProfit,
                operationalExpenses,
                businessSupplyExpenses,
                totalExpenses,
                netProfit,
                totalTransactions,
                inventoryValue: financialReportApi.result?.data?.response?.directStockValue ?? null,
                lowStockCount,
              }}
            />
          </PrintableDocument>
        </PrintPreviewDialog>
      )}

    </>
  );
};