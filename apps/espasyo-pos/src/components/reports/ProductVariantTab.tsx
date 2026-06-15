import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Card,
  Flex,
  Grid,
  Heading,
  IconButton,
  Separator,
  Skeleton,
  Text,
} from "@radix-ui/themes";
import {
  CategoryOutlined,
  ExpandLessOutlined,
  ExpandMoreOutlined,
  Inventory2Outlined,
  LayersOutlined,
  LocalOfferOutlined,
  UnfoldMoreOutlined,
  UnfoldLessOutlined,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  FinancialReportProductRevenueItemDto,
  FinancialReportVariantRevenueDto,
} from "core-lib/api/commons/types";
import { DEFAULT_PALETTE } from "core-lib/components/radix/charts";
import { formatCurrency } from "../contents/procurement/format";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductVariantTabProps {
  data: FinancialReportProductRevenueItemDto[];
  loading: boolean;
  currencyCode: string;
  periodLabel: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function fmtQty(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const ProductTooltip = memo<{
  active?: boolean;
  payload?: { value: number; payload: { productName: string; quantitySold: number } }[];
  currencyCode: string;
}>(({ active, payload, currencyCode }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <Box
      p="3"
      style={{
        background: "var(--color-panel-solid)",
        border: "1px solid var(--gray-a5)",
        borderRadius: "var(--radius-3)",
        boxShadow: "var(--shadow-3)",
        minWidth: 180,
      }}
    >
      <Text size="2" weight="bold" style={{ color: "var(--gray-12)", display: "block" }} mb="1">
        {d.productName}
      </Text>
      <Flex gap="3" direction="column" mt="1">
        <Flex justify="between" gap="4">
          <Text size="1" color="gray">Revenue</Text>
          <Text size="1" weight="medium" style={{ color: "var(--indigo-11)" }}>
            {formatCurrency(payload[0].value, currencyCode)}
          </Text>
        </Flex>
        <Flex justify="between" gap="4">
          <Text size="1" color="gray">Qty Sold</Text>
          <Text size="1" weight="medium">{fmtQty(d.quantitySold)}</Text>
        </Flex>
      </Flex>
    </Box>
  );
});

const VariantTooltip = memo<{
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  currencyCode: string;
}>(({ active, payload, label, currencyCode }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box
      p="3"
      style={{
        background: "var(--color-panel-solid)",
        border: "1px solid var(--gray-a5)",
        borderRadius: "var(--radius-3)",
        boxShadow: "var(--shadow-3)",
        minWidth: 200,
      }}
    >
      <Text size="2" weight="bold" style={{ color: "var(--gray-12)", display: "block" }} mb="2">
        {label}
      </Text>
      <Flex direction="column" gap="1">
        {payload.map((p) => (
          <Flex key={p.name} justify="between" gap="4" align="center">
            <Flex align="center" gap="1">
              <Box style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
              <Text size="1" color="gray">{p.name}</Text>
            </Flex>
            <Text size="1" weight="medium" style={{ color: "var(--gray-12)" }}>
              {formatCurrency(p.value, currencyCode)}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
});

// ─── Summary Card ─────────────────────────────────────────────────────────────

const StatCard = memo<{
  label: string;
  value: string;
  hint: string;
  accent: string;
  icon: React.ReactNode;
  delay: number;
  loading: boolean;
}>(({ label, value, hint, accent, icon, delay, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
    style={{ minWidth: 0, height: "100%" }}
  >
    <Card
      size="2"
      variant="surface"
      style={{
        background: `var(--${accent}-a2)`,
        borderColor: `var(--${accent}-a5)`,
        height: "100%",
        minWidth: 0,
      }}
    >
      <Flex direction="column" gap="2" style={{ minWidth: 0 }}>
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
            {label}
          </Text>
          <Box
            style={{
              width: 32,
              height: 32,
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
        </Flex>
        {loading ? (
          <Skeleton width="70%" height="24px" />
        ) : (
          <Text
            weight="bold"
            as="div"
            style={{
              color: `var(--${accent}-11)`,
              fontSize: 20,
              lineHeight: 1.15,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {value}
          </Text>
        )}
        <Text size="1" color="gray" as="div" style={{ lineHeight: 1.2 }}>
          {hint}
        </Text>
      </Flex>
    </Card>
  </motion.div>
));

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = memo<{ icon: React.ReactNode; title: string; subtitle?: string }>(
  ({ icon, title, subtitle }) => (
    <Flex align="center" gap="2" mb="4">
      <Box
        style={{
          width: 36,
          height: 36,
          borderRadius: "var(--radius-2)",
          background: "var(--indigo-a3)",
          color: "var(--indigo-11)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Heading size="3" style={{ color: "var(--gray-12)" }}>
          {title}
        </Heading>
        {subtitle && (
          <Text size="1" color="gray">
            {subtitle}
          </Text>
        )}
      </Box>
    </Flex>
  ),
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const ProductVariantTab: React.FC<ProductVariantTabProps> = ({
  data,
  loading,
  currencyCode,
  periodLabel,
}) => {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [allExpanded, setAllExpanded] = useState(false);

  const toggleProduct = useCallback((productID: string) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productID)) next.delete(productID);
      else next.add(productID);
      return next;
    });
  }, []);

  const productsWithVariants = useMemo(
    () => data.filter((p) => p.variants.length > 0),
    [data],
  );

  const toggleAll = useCallback(() => {
    if (allExpanded) {
      setExpandedProducts(new Set());
      setAllExpanded(false);
    } else {
      setExpandedProducts(new Set(productsWithVariants.map((p) => p.productID)));
      setAllExpanded(true);
    }
  }, [allExpanded, productsWithVariants]);

  // ── Summary stats ──

  const stats = useMemo(() => {
    const totalRevenue = data.reduce((s, p) => s + p.revenue, 0);
    const totalQty = data.reduce((s, p) => s + p.quantitySold, 0);
    return {
      totalProducts: data.length,
      withVariants: productsWithVariants.length,
      totalRevenue,
      totalQty,
    };
  }, [data, productsWithVariants]);

  // ── Chart A: top products (horizontal bar) ──

  const topProductsData = useMemo(
    () => {
      const top = [...data]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 20);

      // Detect duplicate product names and append category
      const nameDuplicates = new Set(
        top
          .map((p) => p.productName)
          .filter((name, idx, arr) => arr.indexOf(name) !== idx)
      );

      return top.map((p) => {
        const label = nameDuplicates.has(p.productName) && p.categoryName
          ? `${p.productName} (${p.categoryName})`
          : p.productName;
        return { ...p, shortName: truncate(label, 22) };
      });
    },
    [data],
  );

  // ── Chart B: variant breakdown (grouped bars) ──

  const { variantChartData, variantNames } = useMemo(() => {
    if (productsWithVariants.length === 0) return { variantChartData: [], variantNames: [] };
    const names = Array.from(
      new Set(productsWithVariants.flatMap((p) => p.variants.map((v) => v.variantName))),
    );

    // Detect duplicate product names and append category
    const nameDuplicates = new Set(
      productsWithVariants
        .map((p) => p.productName)
        .filter((name, idx, arr) => arr.indexOf(name) !== idx)
    );

    const rows = productsWithVariants.map((p) => {
      const label = nameDuplicates.has(p.productName) && p.categoryName
        ? `${p.productName} (${p.categoryName})`
        : p.productName;
      const row: Record<string, unknown> = { productName: truncate(label, 18) };
      names.forEach((n) => {
        const variant = p.variants.find((v) => v.variantName === n);
        row[n] = variant?.revenue ?? 0;
      });
      return row;
    });
    return { variantChartData: rows, variantNames: names };
  }, [productsWithVariants]);

  // ── Sorted table data ──

  const sortedData = useMemo(
    () =>
      [...data].sort((a, b) =>
        sortDir === "desc" ? b.revenue - a.revenue : a.revenue - b.revenue,
      ),
    [data, sortDir],
  );

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <Box pt="4">
      {/* ── Period badge ──────────────────────────────────────────────────── */}
      <Flex justify="end" mb="4">
        <Badge color="indigo" variant="soft" size="2">
          {periodLabel}
        </Badge>
      </Flex>

      {/* ── Summary Cards ─────────────────────────────────────────────────── */}
      <Grid columns={{ initial: "2", sm: "4" }} gap="3" mb="6">
        <StatCard
          label="Total Products"
          value={loading ? "—" : String(stats.totalProducts)}
          hint="Products with sales this period"
          accent="indigo"
          icon={<Inventory2Outlined style={{ fontSize: 17 }} />}
          delay={0}
          loading={loading}
        />
        <StatCard
          label="With Variants"
          value={loading ? "—" : String(stats.withVariants)}
          hint="Products that have variant data"
          accent="violet"
          icon={<LayersOutlined style={{ fontSize: 17 }} />}
          delay={0.06}
          loading={loading}
        />
        <StatCard
          label="Total Revenue"
          value={loading ? "—" : formatCurrency(stats.totalRevenue, currencyCode)}
          hint="Sum of all product revenues"
          accent="teal"
          icon={<LocalOfferOutlined style={{ fontSize: 17 }} />}
          delay={0.12}
          loading={loading}
        />
        <StatCard
          label="Total Qty Sold"
          value={loading ? "—" : fmtQty(stats.totalQty)}
          hint="Total units sold this period"
          accent="amber"
          icon={<CategoryOutlined style={{ fontSize: 17 }} />}
          delay={0.18}
          loading={loading}
        />
      </Grid>

      {/* ── Charts ────────────────────────────────────────────────────────── */}
      {loading ? (
        <Grid columns={{ initial: "1", md: "2" }} gap="4" mb="6">
          <Skeleton height="320px" style={{ borderRadius: "var(--radius-3)" }} />
          <Skeleton height="320px" style={{ borderRadius: "var(--radius-3)" }} />
        </Grid>
      ) : data.length === 0 ? null : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Grid columns={{ initial: "1", md: variantNames.length > 0 ? "2" : "1" }} gap="4" mb="6">
            {/* Chart A — Top Products */}
            <Card
              size="3"
              variant="surface"
              style={{ borderColor: "var(--gray-a4)", minWidth: 0 }}
            >
              <SectionHeader
                icon={<Inventory2Outlined style={{ fontSize: 18 }} />}
                title="Revenue by Product"
                subtitle={
                  data.length > 20 ? "Showing top 20 by revenue" : `${data.length} products`
                }
              />
              <ResponsiveContainer
                width="100%"
                height={Math.max(260, Math.min(topProductsData.length, 20) * 40)}
              >
                <BarChart
                  layout="vertical"
                  data={topProductsData}
                  margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke="var(--gray-a4)"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => formatCurrency(v, currencyCode)}
                    tick={{ fontSize: 11, fill: "var(--gray-10)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="shortName"
                    width={148}
                    tick={{ fontSize: 11, fill: "var(--gray-11)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    cursor={{ fill: "var(--indigo-a2)" }}
                    content={<ProductTooltip currencyCode={currencyCode} />}
                  />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]} maxBarSize={28}>
                    {topProductsData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={DEFAULT_PALETTE[i % DEFAULT_PALETTE.length]}
                        fillOpacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Chart B — Variant Breakdown */}
            {variantNames.length > 0 && (
              <Card
                size="3"
                variant="surface"
                style={{ borderColor: "var(--gray-a4)", minWidth: 0 }}
              >
                <SectionHeader
                  icon={<LayersOutlined style={{ fontSize: 18 }} />}
                  title="Variant Revenue Breakdown"
                  subtitle={`${productsWithVariants.length} product${productsWithVariants.length !== 1 ? "s" : ""} · ${variantNames.length} variant type${variantNames.length !== 1 ? "s" : ""}`}
                />
                {variantNames.length > 8 ? (
                  <Flex
                    align="center"
                    justify="center"
                    direction="column"
                    gap="2"
                    py="8"
                    style={{ color: "var(--gray-9)" }}
                  >
                    <LayersOutlined style={{ fontSize: 32 }} />
                    <Text size="2" color="gray" align="center">
                      Too many variant types to chart clearly.
                      <br />
                      See the table below for full detail.
                    </Text>
                  </Flex>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={variantChartData}
                      margin={{ top: 0, right: 8, left: 0, bottom: 40 }}
                    >
                      <CartesianGrid stroke="var(--gray-a4)" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="productName"
                        tick={{ fontSize: 10, fill: "var(--gray-11)" }}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                        height={52}
                      />
                      <YAxis
                        tickFormatter={(v) => formatCurrency(v, currencyCode)}
                        tick={{ fontSize: 10, fill: "var(--gray-10)" }}
                        tickLine={false}
                        axisLine={false}
                        width={72}
                      />
                      <RechartsTooltip
                        cursor={{ fill: "var(--violet-a2)" }}
                        content={<VariantTooltip currencyCode={currencyCode} />}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 11, paddingTop: 8, color: "var(--gray-11)" }}
                      />
                      {variantNames.map((name, i) => (
                        <Bar
                          key={name}
                          dataKey={name}
                          fill={DEFAULT_PALETTE[i % DEFAULT_PALETTE.length]}
                          radius={[3, 3, 0, 0]}
                          maxBarSize={32}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>
            )}
          </Grid>
        </motion.div>
      )}

      {/* ── Data Table ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card size="3" variant="surface" style={{ borderColor: "var(--gray-a4)" }}>
          <Flex align="center" justify="between" mb="4" gap="2" wrap="wrap">
            <Flex align="center" gap="2">
              <Box
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-2)",
                  background: "var(--indigo-a3)",
                  color: "var(--indigo-11)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Inventory2Outlined style={{ fontSize: 18 }} />
              </Box>
              <Box>
                <Heading size="3" style={{ color: "var(--gray-12)" }}>
                  Product Details
                </Heading>
                {!loading && (
                  <Text size="1" color="gray">
                    {data.length} product{data.length !== 1 ? "s" : ""}
                    {productsWithVariants.length > 0 &&
                      ` · ${productsWithVariants.length} with variants`}
                  </Text>
                )}
              </Box>
            </Flex>

            {productsWithVariants.length > 0 && !loading && (
              <button
                onClick={toggleAll}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: "var(--radius-2)",
                  border: "1px solid var(--violet-a5)",
                  background: "var(--violet-a2)",
                  color: "var(--violet-11)",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {allExpanded ? (
                  <UnfoldLessOutlined style={{ fontSize: 15 }} />
                ) : (
                  <UnfoldMoreOutlined style={{ fontSize: 15 }} />
                )}
                {allExpanded ? "Collapse All" : "Expand All"}
              </button>
            )}
          </Flex>

          {loading ? (
            <Flex direction="column" gap="2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height="48px" style={{ borderRadius: "var(--radius-2)" }} />
              ))}
            </Flex>
          ) : data.length === 0 ? (
            <Flex
              align="center"
              justify="center"
              direction="column"
              gap="3"
              py="8"
              style={{ color: "var(--gray-9)" }}
            >
              <Inventory2Outlined style={{ fontSize: 40 }} />
              <Text size="2" color="gray">
                No product revenue data for this period.
              </Text>
            </Flex>
          ) : (
            <Box style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "var(--gray-a2)",
                      borderBottom: "2px solid var(--gray-a4)",
                    }}
                  >
                    <th style={{ width: 44 }} />
                    <th
                      style={{
                        padding: "11px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "var(--gray-11)",
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                      }}
                    >
                      Product
                    </th>
                    <th
                      style={{
                        padding: "11px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "var(--gray-11)",
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                      }}
                    >
                      Category
                    </th>
                    <th
                      style={{
                        padding: "11px 16px",
                        textAlign: "center",
                        fontWeight: 600,
                        color: "var(--gray-11)",
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                      }}
                    >
                      Qty Sold
                    </th>
                    <th
                      onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
                      style={{
                        padding: "11px 16px",
                        textAlign: "right",
                        fontWeight: 600,
                        color: "var(--indigo-11)",
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                        cursor: "pointer",
                        userSelect: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Revenue {sortDir === "desc" ? "↓" : "↑"}
                    </th>
                    <th
                      style={{
                        padding: "11px 16px",
                        textAlign: "center",
                        fontWeight: 600,
                        color: "var(--gray-11)",
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Variants
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((item, rowIdx) => {
                    const hasVariants = item.variants.length > 0;
                    const isExpanded = expandedProducts.has(item.productID);
                    const isEven = rowIdx % 2 === 0;
                    return (
                      <React.Fragment key={item.productID}>
                        <tr
                          style={{
                            borderBottom: "1px solid var(--gray-a3)",
                            background: isEven ? "transparent" : "var(--gray-a1)",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLTableRowElement).style.background =
                              "var(--indigo-a1)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLTableRowElement).style.background = isEven
                              ? "transparent"
                              : "var(--gray-a1)";
                          }}
                        >
                          <td style={{ padding: "4px 8px", width: 44, textAlign: "center" }}>
                            {hasVariants && (
                              <IconButton
                                size="1"
                                variant="soft"
                                color="violet"
                                onClick={() => toggleProduct(item.productID)}
                                style={{ cursor: "pointer" }}
                              >
                                {isExpanded ? (
                                  <ExpandLessOutlined style={{ fontSize: 15 }} />
                                ) : (
                                  <ExpandMoreOutlined style={{ fontSize: 15 }} />
                                )}
                              </IconButton>
                            )}
                          </td>
                          <td
                            style={{
                              padding: "11px 16px",
                              fontWeight: 500,
                              color: "var(--gray-12)",
                            }}
                          >
                            <Text size="2">{item.productName}</Text>
                          </td>
                          <td style={{ padding: "11px 16px", color: "var(--gray-10)" }}>
                            <Text size="2">{item.categoryName || "—"}</Text>
                          </td>
                          <td style={{ padding: "11px 16px", textAlign: "center" }}>
                            <Badge variant="soft" color="gray" size="1">
                              {fmtQty(item.quantitySold)}
                            </Badge>
                          </td>
                          <td
                            style={{
                              padding: "11px 16px",
                              textAlign: "right",
                              fontWeight: 600,
                              color: "var(--gray-12)",
                            }}
                          >
                            <Text size="2">{formatCurrency(item.revenue, currencyCode)}</Text>
                          </td>
                          <td style={{ padding: "11px 16px", textAlign: "center" }}>
                            {hasVariants ? (
                              <Badge variant="soft" color="violet" size="1">
                                {item.variants.length} variant{item.variants.length !== 1 ? "s" : ""}
                              </Badge>
                            ) : (
                              <Badge variant="soft" color="gray" size="1">
                                None
                              </Badge>
                            )}
                          </td>
                        </tr>

                        <AnimatePresence initial={false}>
                          {isExpanded &&
                            hasVariants &&
                            item.variants.map(
                              (v: FinancialReportVariantRevenueDto, vi: number) => (
                                <motion.tr
                                  key={`v-${item.productID}-${vi}`}
                                  initial={{ opacity: 0, scaleY: 0.85 }}
                                  animate={{ opacity: 1, scaleY: 1 }}
                                  exit={{ opacity: 0, scaleY: 0.85 }}
                                  transition={{ duration: 0.18, delay: vi * 0.04 }}
                                  style={{
                                    background: "var(--violet-a1)",
                                    borderBottom: "1px solid var(--violet-a3)",
                                    transformOrigin: "top",
                                    display: "table-row",
                                  }}
                                >
                                  <td style={{ padding: "4px 8px", width: 44 }}>
                                    <Box
                                      style={{
                                        width: 3,
                                        height: 28,
                                        borderRadius: 2,
                                        background: "var(--violet-8)",
                                        margin: "0 auto",
                                      }}
                                    />
                                  </td>
                                  <td
                                    style={{ padding: "8px 16px 8px 32px", color: "var(--violet-11)" }}
                                    colSpan={1}
                                  >
                                    <Flex align="center" gap="2">
                                      <Text size="1" style={{ color: "var(--violet-8)" }}>
                                        ↳
                                      </Text>
                                      <Text size="2" weight="medium" style={{ color: "var(--violet-11)" }}>
                                        {v.variantName || "Base"}
                                      </Text>
                                    </Flex>
                                  </td>
                                  <td style={{ padding: "8px 16px", color: "var(--gray-9)" }}>
                                    <Text size="1">—</Text>
                                  </td>
                                  <td style={{ padding: "8px 16px", textAlign: "center" }}>
                                    <Badge variant="soft" color="violet" size="1">
                                      {fmtQty(v.quantitySold)}
                                    </Badge>
                                  </td>
                                  <td
                                    style={{
                                      padding: "8px 16px",
                                      textAlign: "right",
                                      color: "var(--violet-11)",
                                      fontWeight: 500,
                                    }}
                                  >
                                    <Text size="2">{formatCurrency(v.revenue, currencyCode)}</Text>
                                  </td>
                                  <td style={{ padding: "8px 16px" }} />
                                </motion.tr>
                              ),
                            )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </Box>
          )}
        </Card>
      </motion.div>
    </Box>
  );
};
