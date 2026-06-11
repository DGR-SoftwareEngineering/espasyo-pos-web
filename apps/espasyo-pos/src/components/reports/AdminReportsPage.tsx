import React, {
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
  PaidOutlined,
  AccountBalanceWalletOutlined,
  WarningAmberOutlined,
  PrintOutlined,
  AssessmentOutlined,
  ShoppingCartOutlined,
  SavingsOutlined,
  InfoOutlined,
  RefreshOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import {
  ChartCard,
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
import { FinancialSummaryTable } from "./FinancialSummaryTable";
import { ShiftDetailsTab } from "./ShiftDetailsTab";
import { SalesForecastingTab } from "./SalesForecastingTab";
import { ProductVariantTab } from "./ProductVariantTab";
import { PromoPerformanceTab } from "./PromoPerformanceTab";
import type { ProductOption } from "core-lib/components/radix/charts";
import { formatCurrency } from "../contents/procurement/format";
import { PERIODS, periodToDateRange, filterExpensesByPeriod, filterInvoicesByPeriod } from "./constants";
import { printStyles } from "./styles";
import { KpiCard } from "./components/KpiCard";
import { SummaryTile } from "./components/SummaryTile";
import { ReportSection } from "./components/ReportSection";
import { InvoiceStatusCard } from "./components/InvoiceStatusCard";
import { ProcurementTrendCard } from "./components/ProcurementTrendCard";
import { DailySalesTargetTab } from "./components/DailySalesTargetTab";
import { RefreshDialog } from "./print/RefreshDialog";
import { ChartPrintPreview } from "./print/ChartPrintPreview";
import { FinancialPrintPreview } from "./print/FinancialPrintPreview";
import type { KpiTile } from "./types";

export const AdminReportsPage: React.FC = () => {
  const router = useRouter();
  const { currencyCode, inventory, theme, systemName } = usePublicSettings();
  const { isMobile } = useResolution();
  const [period, setPeriod] = useState<ChartPeriod>("30d");

  const initialTabIndex = useMemo(() => {
    if (router.query.tab === "daily_target") return 3;
    return 0;
  }, [router.query.tab]);

  const deferredPeriod = useDeferredValue(period);
  const isTransitioning = period !== deferredPeriod;
  const [refreshDialogOpen, setRefreshDialogOpen] = useState(false);
  const [tabPrint, setTabPrint] = useState<"chart" | "financial" | null>(null);

  // ── Data fetches ─────────────────────────────────────────────────

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

  const { from: periodFrom, to: periodTo } = useMemo(
    () => periodToDateRange(period),
    [period],
  );

  const saleListApi = useApi(
    (api) => api.commons.saleList({ pageNumber: 1, pageSize: 1, status: 1, fromDate: periodFrom, toDate: periodTo }),
    [periodFrom, periodTo],
  );
  const totalTransactions =
    saleListApi.result?.data?.response?.totalItems ?? null;

  const invoiceApi = useApi(
    (api) => api.commons.supplierInvoiceList({ pageNumber: 1, pageSize: 500 }),
    [],
  );

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

  const revenuePoints = useMemo(() =>
    (salesChart.data?.points ?? []).map((p) => ({
      label: p.label,
      amount: (Object.values(p.values)[0] ?? 0) as number,
    })),
    [salesChart.data],
  );

  const financialReportApi = useApi(
    (api) => api.commons.financialReport({ From: periodFrom, To: periodTo }),
    [periodFrom, periodTo],
  );
  const revenueByProduct =
    financialReportApi.result?.data?.response?.revenueByProduct ?? [];
  const promoPerformance =
    financialReportApi.result?.data?.response?.promoPerformance ?? [];

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

  // ── KPI tiles ─────────────────────────────────────────────────────

  const periodLabel = useMemo(
    () => PERIODS.find((p) => p.value === period)?.label ?? period,
    [period],
  );

  const kpiTiles = useMemo<KpiTile[]>(
    () => [
      {
        label: "Gross Sales",
        value: formatCurrency(grossSales, currencyCode),
        hint: `Revenue \u00B7 ${periodLabel}`,
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
        hint: `Non-sellable items & overhead \u00B7 ${periodLabel}`,
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
      grossSales, grossProfit, operationalExpenses, businessSupplyExpenses,
      totalTransactions, lowStockCount, salesLoading, invoiceApi.loading,
      businessExpenseApi.loading, saleListApi.loading, lowStockApi.loading,
      currencyCode, periodLabel, inventory.lowStockAlertEnabled,
    ],
  );

  const handlePrint = useCallback(() => window.print(), []);

  const heroGradient = theme.primaryColor && theme.secondaryColor
    ? `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 55%, ${theme.primaryColor} 100%)`
    : `linear-gradient(135deg, var(--indigo-11) 0%, var(--violet-9) 55%, var(--indigo-9) 100%)`;

  // ── Tabs ──────────────────────────────────────────────────────────

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

            <Callout.Root color="blue" mb="4">
              <InfoOutlined style={{ fontSize: 18 }} />
              <Callout.Text>
                <strong>Gross Profit Breakdown:</strong> Gross Sales minus Cost of Goods Sold (COGS). Formula: <code>Gross Profit = Revenue - COGS</code>. This shows profitability before operating expenses are deducted.
              </Callout.Text>
            </Callout.Root>

            <div className="no-print">
              <ReportSection
                title="Revenue & Sales"
                description="Trends, payment breakdown and top products"
                icon={<TrendingUpOutlined style={{ fontSize: 18 }} />}
                accent="indigo"
                delay={0.15}
              >
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
                    description="In Stock \u00B7 Low \u00B7 Critical \u00B7 Out of Stock"
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
                      value={totalTransactions?.toLocaleString() ?? "\u2014"}
                      loading={saleListApi.loading}
                      color="var(--teal-11)"
                      hint="Completed sales"
                    />
                    <SummaryTile
                      label="Low Stock"
                      value={lowStockCount?.toLocaleString() ?? "\u2014"}
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
                          : "\u2014"}
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
      {
        key: "promo_performance",
        label: "Promo Performance",
        content: (
          <PromoPerformanceTab
            data={promoPerformance}
            loading={financialReportApi.loading}
            currencyCode={currencyCode}
            periodLabel={periodLabel}
          />
        ),
      },
    ],
    [
      deferredPeriod, isTransitioning, productOptions, currencyCode,
      grossSales, operationalExpenses, businessSupplyExpenses,
      grossProfit, totalExpenses, netProfit, totalTransactions,
      lowStockCount, periodLabel, salesLoading, invoiceApi.loading,
      businessExpenseApi.loading, saleListApi.loading, lowStockApi.loading,
      procurementCost, dailySummaryApi.result, todayTotal, salesCount,
      systemName, theme?.logoUrl, financialReportApi.loading,
      financialReportApi.result, revenueByProduct, promoPerformance,
      filteredInvoices,
    ],
  );

  return (
    <>
      <style>{printStyles}</style>

      <Box style={{ minHeight: "100%", background: "var(--gray-2)" }}>
        <Box
          className="reports-print-root"
          px={{ initial: "3", sm: "4", md: "5" }}
          py="4"
          style={{ width: "100%" }}
        >
          {/* ── Hero ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Box
              mb="4"
              p={{ initial: "4", sm: "5" }}
              style={{
                borderRadius: "var(--radius-4)",
                position: "relative",
                overflow: "hidden",
                boxShadow: "var(--shadow-3)",
                background: heroGradient,
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
                      Financial \u00B7 Operations \u00B7 Inventory
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

              <Box mt="4" style={{ position: "relative" }} className="no-print">
                <ScrollArea type="auto" scrollbars="horizontal">
                  <Flex gap="2" pb="1">
                    {PERIODS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
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

              <Box className="print-only" mt="2">
                <Text size="2" style={{ color: "rgba(255,255,255,0.85)" }}>
                  Period: {periodLabel} \u00B7 Printed{" "}
                  {new Date().toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </Box>
            </Box>
          </motion.div>

          {/* ── KPI tiles ────────────────────────────────────────────── */}
          <Grid
            columns={{ initial: "2", sm: "3", md: "6" }}
            gap="3"
            mb="5"
          >
            {kpiTiles.map((tile, idx) => (
              <KpiCard key={tile.label} tile={tile} delay={idx * 0.05} />
            ))}
          </Grid>

          {/* ── Print-only: summary tables ────────────────────────────── */}
          <div className="print-only" style={{ marginBottom: 24 }}>
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
                        {totalTransactions?.toLocaleString() ?? "\u2014"}
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
                      <td style={{ padding: "7px 0", color: "#64748b", fontWeight: 500 }}>
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
                          : "\u2014"}
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
                          : "\u2014"}
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
                          ? lowStockCount?.toLocaleString() ?? "\u2014"
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

          {/* ── Tabs Container ────────────────────────────────────────── */}
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

      {/* ── Dialogs ── */}
      <RefreshDialog open={refreshDialogOpen} />

      {tabPrint === "chart" && (
        <ChartPrintPreview
          open
          onOpenChange={() => setTabPrint(null)}
          periodLabel={periodLabel}
          businessName={systemName}
          logoUrl={theme?.logoUrl ?? null}
          currencyCode={currencyCode}
          grossSales={grossSales}
          grossProfit={grossProfit}
          totalTransactions={totalTransactions}
          revenuePoints={revenuePoints}
          operationalExpenses={operationalExpenses}
          businessSupplyExpenses={businessSupplyExpenses}
          lowStockCount={lowStockCount}
          lowStockAlertEnabled={!!inventory.lowStockAlertEnabled}
          filteredInvoices={filteredInvoices}
        />
      )}

      {tabPrint === "financial" && (
        <FinancialPrintPreview
          open
          onOpenChange={() => setTabPrint(null)}
          periodLabel={periodLabel}
          businessName={systemName}
          logoUrl={theme?.logoUrl ?? null}
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
      )}
    </>
  );
};
