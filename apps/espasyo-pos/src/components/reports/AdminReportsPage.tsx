import React, {
  memo,
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
} from "react";
import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Grid,
  Heading,
  ScrollArea,
  Separator,
  Skeleton,
  Text,
} from "@radix-ui/themes";
import {
  ActivityLogIcon,
  BarChartIcon,
  CubeIcon,
  LayersIcon,
  PieChartIcon,
  CalendarIcon,
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
} from "@mui/icons-material";
import { motion } from "framer-motion";
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
import { usePublicSettings } from "core-lib/core/contexts";
import { FinancialSummaryTable } from "./FinancialSummaryTable";
import {
  SupplierInvoiceDto,
  SupplierInvoiceStatusDto,
} from "core-lib/api/commons/types";
import { INVOICE_STATUS_META } from "../contents/procurement/constants";
import { formatCurrency } from "../contents/procurement/format";

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

// ─── Main Component ───────────────────────────────────────────────────────────

export const AdminReportsPage: React.FC = () => {
  const { currencyCode, inventory, theme } = usePublicSettings();
  const { isMobile } = useResolution();
  const [period, setPeriod] = useState<ChartPeriod>("30d");

  // useDeferredValue means the charts re-render with a lower priority when the
  // period changes — KPI cards and the header update instantly while charts
  // catch up without blocking the main thread.
  const deferredPeriod = useDeferredValue(period);
  const isTransitioning = period !== deferredPeriod;

  // ── Data fetches (all run in parallel on mount) ───────────────────────────

  const salesChart = useChart({ chartKey: "sales-by-day", period });
  const dailySummaryApi = useApi((api) => api.commons.salesDailySummary(), []);
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

  // Only fetch count (pageSize: 1) — we only need totalItems
  const saleListApi = useApi(
    (api) => api.commons.saleList({ pageNumber: 1, pageSize: 1, status: 1 }),
    [],
  );
  const totalTransactions =
    saleListApi.result?.data?.response?.totalItems ?? null;

  // Fetch invoices for procurement cost sum
  const invoiceApi = useApi(
    (api) => api.commons.supplierInvoiceList({ pageNumber: 1, pageSize: 500 }),
    [],
  );

  const procurementCost = useMemo(() => {
    const items = invoiceApi.result?.data?.response?.items;
    if (!Array.isArray(items)) return null;
    return items.reduce((sum, inv) => sum + (inv.paidAmount ?? 0), 0);
  }, [invoiceApi.result]);

  // Fetch business expenses from the dedicated BusinessExpense table
  const businessExpenseApi = useApi(
    (api) => api.commons.businessExpenseList(),
    [],
  );

  const { operationalExpenses, businessSupplyExpenses } = useMemo(() => {
    const invoiceItems = invoiceApi.result?.data?.response?.items;
    const expenseItems = businessExpenseApi.result?.data?.response;

    // Operational expenses = all paid invoices (no longer filtered by type)
    const operationalExpensesTotal = Array.isArray(invoiceItems)
      ? invoiceItems.reduce((sum, inv) => sum + (inv.paidAmount ?? 0), 0)
      : null;

    // Business supply expenses = sum from BusinessExpenses table (response is an array)
    const businessSupplyExpensesTotal = Array.isArray(expenseItems)
      ? expenseItems.reduce((sum, expense) => sum + (expense.amount ?? 0), 0)
      : null;

    return {
      operationalExpenses: operationalExpensesTotal,
      businessSupplyExpenses: businessSupplyExpensesTotal,
    };
  }, [invoiceApi.result, businessExpenseApi.result]);

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
        hint: "Non-sellable items & overhead",
        accent: "orange",
        icon: <AccountBalanceWalletOutlined style={{ fontSize: 18 }} />,
        loading: invoiceApi.loading,
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
      saleListApi.loading,
      lowStockApi.loading,
      currencyCode,
      periodLabel,
      inventory.lowStockAlertEnabled,
    ],
  );

  const handlePrint = useCallback(() => window.print(), []);

  // Calculate total expenses and net profit for financial summary table
  const totalExpenses = useMemo(() => {
    if (operationalExpenses === null || businessSupplyExpenses === null) return null;
    return operationalExpenses + businessSupplyExpenses;
  }, [operationalExpenses, businessSupplyExpenses]);

  const netProfit = useMemo(() => {
    if (grossSales === null || totalExpenses === null) return null;
    return grossSales - totalExpenses;
  }, [grossSales, totalExpenses]);

  // Build tabs
  const tabs = useMemo<TabOption[]>(
    () => [
      {
        key: "reports_charts",
        label: "Reports Chart",
        content: (
          <Box pt="4">
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
                  invoices={invoiceApi.result?.data?.response?.items ?? []}
                  loading={invoiceApi.loading}
                  currencyCode={currencyCode}
                />
                <InvoiceStatusCard
                  invoices={invoiceApi.result?.data?.response?.items ?? []}
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
                  operationalExpenses: businessSupplyExpenses,
                  businessSupplyExpenses,
                  totalExpenses,
                  netProfit,
                  totalTransactions,
                  inventoryValue: null,
                  lowStockCount,
                }}
              />
            </motion.div>
          </Box>
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
      saleListApi.loading,
      lowStockApi.loading,
      procurementCost,
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
            <TabsContextProvider>
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
    </>
  );
};
