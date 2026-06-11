import React, { memo, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Callout,
  Card,
  Flex,
  Grid,
  Heading,
  Skeleton,
  Text,
} from "@radix-ui/themes";
import { InfoCircledIcon, TriangleUpIcon, TriangleDownIcon } from "@radix-ui/react-icons";
import { LocalOfferOutlined } from "@mui/icons-material";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PromoPerformanceItemDto } from "core-lib/api/commons/types";
import { formatCurrency } from "../contents/procurement/format";

// ─── Props ────────────────────────────────────────────────────────────────────

interface PromoPerformanceTabProps {
  data: PromoPerformanceItemDto[];
  loading: boolean;
  currencyCode: string;
  periodLabel: string;
}

// ─── Type badge colours ───────────────────────────────────────────────────────

type BadgeColor = "amber" | "blue" | "green" | "violet" | "gray";

function promoTypeColor(type: string): BadgeColor {
  switch (type) {
    case "PercentageDiscount": return "amber";
    case "FixedDiscount": return "blue";
    case "BuyXGetY": return "green";
    case "Bundle": return "violet";
    default: return "gray";
  }
}

function promoTypeLabel(type: string): string {
  switch (type) {
    case "PercentageDiscount": return "% Off";
    case "FixedDiscount": return "Fixed Off";
    case "BuyXGetY": return "Buy X Get Y";
    case "Bundle": return "Bundle";
    default: return type;
  }
}

// ─── Sort state ───────────────────────────────────────────────────────────────

type SortKey = "usageCount" | "totalRevenue" | "totalDiscountGiven" | "averageOrderValue";
type SortDir = "asc" | "desc";

// ─── Stat chip ────────────────────────────────────────────────────────────────

const StatChip = memo<{
  label: string;
  value: string;
  accent: string;
  loading: boolean;
}>(({ label, value, accent, loading }) => (
  <Card
    style={{
      padding: "16px 20px",
      background: `var(--${accent}-a2)`,
      border: `1px solid var(--${accent}-a5)`,
      minWidth: 0,
    }}
  >
    <Text size="1" color="gray" weight="medium" as="div" style={{ textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
      {label}
    </Text>
    {loading ? (
      <Skeleton width="80%" height="22px" />
    ) : (
      <Text weight="bold" as="div" style={{ fontSize: 20, color: `var(--${accent}-11)`, lineHeight: 1.2 }}>
        {value}
      </Text>
    )}
  </Card>
));

// ─── Main Component ───────────────────────────────────────────────────────────

export const PromoPerformanceTab = memo<PromoPerformanceTabProps>(({
  data,
  loading,
  currencyCode,
  periodLabel,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>("usageCount");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const totalUsage = useMemo(() => data.reduce((s, d) => s + d.usageCount, 0), [data]);
  const totalDiscount = useMemo(() => data.reduce((s, d) => s + d.totalDiscountGiven, 0), [data]);
  const totalRevenue = useMemo(() => data.reduce((s, d) => s + d.totalRevenue, 0), [data]);

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const diff = a[sortKey] - b[sortKey];
      return sortDir === "desc" ? -diff : diff;
    });
  }, [data, sortKey, sortDir]);

  const chartData = useMemo(
    () =>
      [...data]
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 10)
        .map((d) => ({ name: d.promoTitle.length > 20 ? d.promoTitle.slice(0, 18) + "…" : d.promoTitle, uses: d.usageCount, revenue: d.totalRevenue })),
    [data],
  );

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === "desc"
      ? <TriangleDownIcon style={{ display: "inline", verticalAlign: "middle", marginLeft: 3 }} />
      : <TriangleUpIcon style={{ display: "inline", verticalAlign: "middle", marginLeft: 3 }} />;
  };

  return (
    <Box pt="4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

        {/* ── Header ── */}
        <Flex align="center" gap="3" mb="4">
          <Box
            style={{
              width: 36, height: 36, borderRadius: "var(--radius-3)",
              background: "var(--violet-a3)", color: "var(--violet-11)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LocalOfferOutlined style={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Heading size="4" weight="bold">Promo Performance</Heading>
            <Text size="2" color="gray">Which promotions are driving your sales — {periodLabel}</Text>
          </Box>
        </Flex>

        {/* ── Stat chips ── */}
        <Grid columns={{ initial: "1", sm: "3" }} gap="3" mb="5">
          <StatChip label="Promos Used" value={loading ? "…" : totalUsage.toLocaleString()} accent="violet" loading={loading} />
          <StatChip label="Total Discount Given" value={loading ? "…" : formatCurrency(totalDiscount, currencyCode)} accent="amber" loading={loading} />
          <StatChip label="Promo-Driven Revenue" value={loading ? "…" : formatCurrency(totalRevenue, currencyCode)} accent="green" loading={loading} />
        </Grid>

        {/* ── Empty state ── */}
        {!loading && data.length === 0 && (
          <Callout.Root color="gray" mb="5">
            <InfoCircledIcon />
            <Callout.Text>
              No promo-tagged sales found for this period. Apply promos in the POS register to see performance data here.
            </Callout.Text>
          </Callout.Root>
        )}

        {/* ── Bar chart: top promos by usage ── */}
        {(loading || data.length > 0) && (
          <Card mb="5" style={{ padding: "20px" }}>
            <Heading size="3" weight="medium" mb="4">Top Promos by Usage</Heading>
            {loading ? (
              <Box style={{ height: 260, background: "var(--gray-a3)", borderRadius: "var(--radius-2)", animation: "pulse 2s infinite" }} />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 4, right: 16, left: 8, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-a4)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "var(--gray-11)" }}
                    tickLine={false}
                    axisLine={false}
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    yAxisId="uses"
                    tick={{ fontSize: 11, fill: "var(--gray-11)" }}
                    tickLine={false}
                    axisLine={false}
                    width={36}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: "var(--color-panel-solid)",
                      border: "1px solid var(--gray-a4)",
                      borderRadius: "var(--radius-2)",
                      fontSize: 12,
                    }}
                    formatter={(value, name) => {
                      if (name === "uses") return [value, "Uses"];
                      return [formatCurrency(Number(value), currencyCode), "Revenue"];
                    }}
                  />
                  <Bar yAxisId="uses" dataKey="uses" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={`var(--violet-${Math.min(9 + i, 12)})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        )}

        {/* ── Table ── */}
        {(loading || data.length > 0) && (
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <Box p="3" style={{ borderBottom: "1px solid var(--gray-a3)" }}>
              <Heading size="3" weight="medium">Promo Details</Heading>
            </Box>

            <style>{`
              .promo-perf-table { width: 100%; border-collapse: collapse; font-size: 13px; }
              .promo-perf-table thead tr { background: var(--gray-a2); border-bottom: 1px solid var(--gray-a4); }
              .promo-perf-table th { padding: 10px 14px; text-align: left; font-weight: 500; color: var(--gray-11); white-space: nowrap; }
              .promo-perf-table th.sortable { cursor: pointer; user-select: none; }
              .promo-perf-table th.sortable:hover { color: var(--gray-12); }
              .promo-perf-table th:not(:first-child) { text-align: right; }
              .promo-perf-table tbody tr { border-bottom: 1px solid var(--gray-a3); transition: background 80ms ease; }
              .promo-perf-table tbody tr:hover { background: var(--gray-a2); }
              .promo-perf-table td { padding: 10px 14px; color: var(--gray-12); }
              .promo-perf-table td:not(:first-child):not(:nth-child(2)) { text-align: right; }
            `}</style>

            <Box style={{ overflowX: "auto" }}>
              <table className="promo-perf-table">
                <thead>
                  <tr>
                    <th>Promo</th>
                    <th>Type</th>
                    <th className="sortable" onClick={() => handleSort("usageCount")}>
                      Uses <SortIcon col="usageCount" />
                    </th>
                    <th className="sortable" onClick={() => handleSort("totalDiscountGiven")}>
                      Discount Given <SortIcon col="totalDiscountGiven" />
                    </th>
                    <th className="sortable" onClick={() => handleSort("totalRevenue")}>
                      Revenue <SortIcon col="totalRevenue" />
                    </th>
                    <th className="sortable" onClick={() => handleSort("averageOrderValue")}>
                      Avg Order <SortIcon col="averageOrderValue" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 6 }).map((__, j) => (
                            <td key={j}><Skeleton width="80%" height="16px" /></td>
                          ))}
                        </tr>
                      ))
                    : sorted.map((item) => (
                        <tr key={item.promoID}>
                          <td style={{ fontWeight: 500, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.promoTitle}
                          </td>
                          <td>
                            <Badge color={promoTypeColor(item.promoType)} variant="soft" size="1">
                              {promoTypeLabel(item.promoType)}
                            </Badge>
                          </td>
                          <td style={{ fontWeight: 600 }}>{item.usageCount.toLocaleString()}</td>
                          <td style={{ color: "var(--amber-11)" }}>{formatCurrency(item.totalDiscountGiven, currencyCode)}</td>
                          <td style={{ color: "var(--green-11)", fontWeight: 600 }}>{formatCurrency(item.totalRevenue, currencyCode)}</td>
                          <td>{formatCurrency(item.averageOrderValue, currencyCode)}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </Box>
          </Card>
        )}
      </motion.div>
    </Box>
  );
});
