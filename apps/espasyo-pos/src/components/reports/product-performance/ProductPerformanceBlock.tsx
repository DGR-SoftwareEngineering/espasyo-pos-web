import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Callout,
  Flex,
  Grid,
  Heading,
  IconButton,
  Skeleton,
  Text,
} from "@radix-ui/themes";
import {
  AssessmentOutlined,
  ExpandLessOutlined,
  ExpandMoreOutlined,
  TrendingDownOutlined,
  TrendingUpOutlined,
  WarningOutlined,
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import { useApiCallback } from "core-lib/core/hooks";
import { formatCurrency } from "core-lib/business/strings";
import {
  ProductPerformanceQueryParams,
  ProductPerformanceReportDto,
  ProductPerformanceItemDto,
  ProductVariantPerformanceDto,
  ProductAddOnPerformanceDto,
} from "core-lib/api/commons/types";
import { StatsCard } from "core-lib/components/radix/StatsCard";

export const ProductPerformanceBlock: React.FC = () => {
  const [, setFilters] = useState<ProductPerformanceQueryParams>({});
  const [report, setReport] = useState<ProductPerformanceReportDto | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [slowThreshold, setSlowThreshold] = useState(5);
  const [fastThreshold, setFastThreshold] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = useCallback((productID: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(productID)) next.delete(productID);
      else next.add(productID);
      return next;
    });
  }, []);

  const reportCb = useApiCallback(
    async (api, params: ProductPerformanceQueryParams) =>
      api.commons.productPerformanceReport(params),
  );

  const loadReport = useCallback(
    async (params: ProductPerformanceQueryParams) => {
      setError(null);
      try {
        const result = await reportCb.execute(params);
        const data = result?.data?.response ?? null;
        if (!data && result?.data?.success === false) {
          setError(result?.data?.message ?? "Failed to load report");
        }
        setReport(data);
      } catch {
        setError("Unable to reach the Product Performance API. Make sure the backend is running.");
      }
    },
    [reportCb],
  );

  useEffect(() => {
    loadReport({});
  }, []);

  const handleApplyFilter = useCallback(() => {
    const params: ProductPerformanceQueryParams = {};
    if (fromDate) params.From = fromDate;
    if (toDate) params.To = toDate;
    if (slowThreshold) params.SlowThreshold = slowThreshold;
    if (fastThreshold) params.FastThreshold = fastThreshold;
    setFilters(params);
    loadReport(params);
  }, [fromDate, toDate, slowThreshold, fastThreshold, loadReport]);

  const handleReset = useCallback(() => {
    setFromDate("");
    setToDate("");
    setSlowThreshold(5);
    setFastThreshold(50);
    setFilters({});
    loadReport({});
  }, [loadReport]);

  const sorted = useMemo(() => {
    if (!report?.items) return [];
    const slow = report.items.filter((i) => i.movementTag === "slow");
    const normal = report.items.filter((i) => i.movementTag === "normal");
    const fast = report.items.filter((i) => i.movementTag === "fast");
    return [...slow, ...normal, ...fast];
  }, [report]);

  const maxQtySold = useMemo(() => {
    return Math.max(1, ...(sorted.map((i) => i.quantitySold) || [1]));
  }, [sorted]);

  const top10 = useMemo(
    () =>
      [...sorted]
        .sort((a, b) => b.quantitySold - a.quantitySold)
        .slice(0, 10),
    [sorted],
  );

  return (
    <Box style={{ width: "100%" }}>
      {/* Hero filter card */}
      <Card variant="surface" size="3" mb="4">
        {/* Gradient title header */}
        <Box
          style={{
            background: "linear-gradient(135deg, var(--indigo-9) 0%, var(--violet-8) 100%)",
            borderRadius: "var(--radius-3)",
            padding: "20px 24px",
            color: "white",
            marginBottom: 20,
          }}
        >
          <Flex align="center" gap="3">
            <AssessmentOutlined style={{ fontSize: 28 }} />
            <Flex direction="column" gap="1">
              <Text size="6" weight="bold">
                Product Performance
              </Text>
              <Text size="2" style={{ opacity: 0.9 }}>
                Sales velocity analysis — fast & slow moving items
              </Text>
            </Flex>
          </Flex>
        </Box>

        {/* Filter controls */}
        <Flex gap="3" align="end" wrap="wrap">
          <Flex direction="column" gap="1">
            <Text size="1" weight="medium" color="gray">
              From
            </Text>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid var(--gray-6)",
                background: "var(--gray-3)",
                color: "var(--gray-12)",
                fontSize: 14,
                width: 160,
              }}
            />
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="1" weight="medium" color="gray">
              To
            </Text>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid var(--gray-6)",
                background: "var(--gray-3)",
                color: "var(--gray-12)",
                fontSize: 14,
                width: 160,
              }}
            />
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="1" weight="medium" color="gray">
              Slow Threshold
            </Text>
            <input
              type="number"
              value={slowThreshold}
              onChange={(e) => setSlowThreshold(Number(e.target.value))}
              min="1"
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid var(--gray-6)",
                background: "var(--gray-3)",
                color: "var(--gray-12)",
                fontSize: 14,
                width: 100,
              }}
            />
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="1" weight="medium" color="gray">
              Fast Threshold
            </Text>
            <input
              type="number"
              value={fastThreshold}
              onChange={(e) => setFastThreshold(Number(e.target.value))}
              min="1"
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid var(--gray-6)",
                background: "var(--gray-3)",
                color: "var(--gray-12)",
                fontSize: 14,
                width: 100,
              }}
            />
          </Flex>

          <Flex gap="2">
            <Button
              variant="solid"
              color="indigo"
              onClick={handleApplyFilter}
              disabled={reportCb.loading}
            >
              Apply Filter
            </Button>
            <Button
              variant="soft"
              color="gray"
              onClick={handleReset}
              disabled={reportCb.loading}
            >
              Reset
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Error state */}
      {error && (
        <Callout.Root color="red" mb="4">
          <Callout.Icon>
            <WarningOutlined />
          </Callout.Icon>
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      {/* KPI tiles */}
      {report && (
        <Card variant="surface" size="3" mb="4">
          <Flex gap="3" wrap="wrap">
            <StatsCard
              label="Total Menu Items"
              value={report.totalMenuItems}
              color="primary"
            />
            <StatsCard
              label="Fast Moving"
              value={report.fastMovingCount}
              color="success"
            />
            <StatsCard
              label="Normal"
              value={report.normalCount}
              color="info"
            />
            <StatsCard
              label="Slow Moving"
              value={report.slowMovingCount}
              color="error"
            />
          </Flex>
        </Card>
      )}

      {/* Charts */}
      {report && sorted.length > 0 && (
        <Grid columns={{ initial: "1", md: "2" }} gap="4" mb="4">
          {/* Movement Distribution Donut */}
          <Card variant="surface" size="3">
            <Heading size="3" weight="medium" mb="1">
              Movement Distribution
            </Heading>
            <Text size="1" color="gray" mb="3">
              Fast / Normal / Slow breakdown
            </Text>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Fast", value: report.fastMovingCount },
                    { name: "Normal", value: report.normalCount },
                    { name: "Slow", value: report.slowMovingCount },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  <Cell fill="var(--green-9)" />
                  <Cell fill="var(--gray-8)" />
                  <Cell fill="var(--red-9)" />
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    background: "var(--color-panel-solid)",
                    border: "1px solid var(--gray-a4)",
                    borderRadius: "var(--radius-2)",
                    fontSize: 12,
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Top 10 Products by Qty Sold */}
          <Card variant="surface" size="3">
            <Heading size="3" weight="medium" mb="1">
              Top Products by Sales Volume
            </Heading>
            <Text size="1" color="gray" mb="3">
              Qty sold in period — colored by movement
            </Text>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                layout="vertical"
                data={top10}
                margin={{ top: 0, right: 16, left: 150, bottom: 0 }}
              >
                <CartesianGrid horizontal={false} stroke="var(--gray-a4)" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "var(--gray-11)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="productName"
                  tick={{ fontSize: 10, fill: "var(--gray-11)" }}
                  tickLine={false}
                  axisLine={false}
                  width={140}
                />
                <RechartsTooltip
                  formatter={(value) => [
                    `${Number(value).toFixed(1)} units`,
                    "Qty Sold",
                  ]}
                  contentStyle={{
                    background: "var(--color-panel-solid)",
                    border: "1px solid var(--gray-a4)",
                    borderRadius: "var(--radius-2)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="quantitySold" radius={[0, 4, 4, 0]} maxBarSize={22}>
                  {top10.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        entry.movementTag === "fast"
                          ? "var(--green-9)"
                          : entry.movementTag === "slow"
                            ? "var(--red-9)"
                            : "var(--indigo-9)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      )}

      {/* Data table */}
      <Card variant="surface" size="2" style={{ overflow: "hidden" }}>
        {reportCb.loading ? (
          <Flex direction="column" gap="3" p="4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} height="48px" />
            ))}
          </Flex>
        ) : sorted.length === 0 ? (
          <Flex align="center" justify="center" direction="column" gap="2" py="6">
            <AssessmentOutlined style={{ fontSize: 32, color: "var(--gray-9)" }} />
            <Text size="2" color="gray">
              No data available for this period.
            </Text>
          </Flex>
        ) : (
          <Box style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "var(--gray-a2)",
                    borderBottom: "1px solid var(--gray-a4)",
                  }}
                >
                  <th style={{ width: 40 }} />
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "var(--gray-11)",
                    }}
                  >
                    Product Name
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "var(--gray-11)",
                    }}
                  >
                    Category
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "center",
                      fontWeight: 600,
                      color: "var(--gray-11)",
                    }}
                  >
                    Qty Sold
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      fontWeight: 600,
                      color: "var(--gray-11)",
                    }}
                  >
                    Revenue
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "center",
                      fontWeight: 600,
                      color: "var(--gray-11)",
                    }}
                  >
                    Transactions
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "center",
                      fontWeight: 600,
                      color: "var(--gray-11)",
                    }}
                  >
                    Movement
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((item) => {
                  const rowBg =
                    item.movementTag === "slow"
                      ? "var(--red-a2)"
                      : item.movementTag === "fast"
                        ? "var(--green-a2)"
                        : "transparent";
                  const borderColor =
                    item.movementTag === "slow"
                      ? "var(--red-6)"
                      : item.movementTag === "fast"
                        ? "var(--green-6)"
                        : "transparent";
                  const qtyPercent = (item.quantitySold / maxQtySold) * 100;
                  const hasDetails = item.variants.length > 0 || item.addOns.length > 0;
                  const isExpanded = expandedRows.has(item.productID);

                  return (
                    <React.Fragment key={item.productID}>
                      <tr
                        style={{
                          background: rowBg,
                          borderBottom: "1px solid var(--gray-a3)",
                          borderLeft: `3px solid ${borderColor}`,
                        }}
                      >
                        <td style={{ padding: "4px 8px", width: 40, textAlign: "center" }}>
                          {hasDetails && (
                            <IconButton
                              size="1"
                              variant="ghost"
                              color="gray"
                              onClick={() => toggleRow(item.productID)}
                            >
                              {isExpanded
                                ? <ExpandLessOutlined style={{ fontSize: 16 }} />
                                : <ExpandMoreOutlined style={{ fontSize: 16 }} />
                              }
                            </IconButton>
                          )}
                        </td>
                        <td style={{ padding: "12px 16px", fontWeight: 500, color: "var(--gray-12)" }}>
                          {item.productName}
                        </td>
                        <td style={{ padding: "12px 16px", color: "var(--gray-11)" }}>
                          {item.categoryName || "—"}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <Flex align="center" gap="2" justify="center">
                            <Box
                              style={{
                                background: "var(--indigo-a6)",
                                height: 6,
                                borderRadius: 3,
                                width: `${Math.max(qtyPercent, 5)}px`,
                                minWidth: 30,
                              }}
                            />
                            <Text size="1" weight="medium" style={{ color: "var(--gray-12)" }}>
                              {item.quantitySold.toFixed(1)}
                            </Text>
                          </Flex>
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            textAlign: "right",
                            fontWeight: 500,
                            color: "var(--gray-12)",
                          }}
                        >
                          {formatCurrency(item.revenue)}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "center", color: "var(--gray-11)" }}>
                          {item.transactionCount}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          {item.movementTag === "slow" ? (
                            <Badge color="red" variant="surface" size="1">
                              <TrendingDownOutlined style={{ fontSize: 12 }} />
                              Slow
                            </Badge>
                          ) : item.movementTag === "fast" ? (
                            <Badge color="green" variant="surface" size="1">
                              <TrendingUpOutlined style={{ fontSize: 12 }} />
                              Fast
                            </Badge>
                          ) : (
                            <Badge color="gray" variant="surface" size="1">
                              Normal
                            </Badge>
                          )}
                        </td>
                      </tr>

                      {isExpanded && hasDetails && (
                        <>
                          {item.variants.length > 0 && (
                            <>
                              <tr style={{ background: "var(--indigo-a1)" }}>
                                <td />
                                <td
                                  colSpan={6}
                                  style={{
                                    padding: "6px 16px 4px 32px",
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: "var(--indigo-11)",
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                  }}
                                >
                                  Variants
                                </td>
                              </tr>
                              {item.variants.map((v: ProductVariantPerformanceDto, vi: number) => (
                                <tr
                                  key={`v-${vi}`}
                                  style={{
                                    background: "var(--indigo-a1)",
                                    borderBottom: "1px solid var(--gray-a2)",
                                  }}
                                >
                                  <td />
                                  <td style={{ padding: "8px 16px 8px 32px", color: "var(--indigo-11)" }}>
                                    ↳ {v.variantName}
                                  </td>
                                  <td style={{ padding: "8px 16px", color: "var(--gray-9)" }}>—</td>
                                  <td style={{ padding: "8px 16px", textAlign: "center", color: "var(--gray-11)" }}>
                                    <Text size="1">{v.quantitySold.toFixed(1)}</Text>
                                  </td>
                                  <td style={{ padding: "8px 16px", textAlign: "right", color: "var(--gray-11)" }}>
                                    <Text size="1">{formatCurrency(v.revenue)}</Text>
                                  </td>
                                  <td style={{ padding: "8px 16px", textAlign: "center", color: "var(--gray-11)" }}>
                                    <Text size="1">{v.transactionCount}</Text>
                                  </td>
                                  <td />
                                </tr>
                              ))}
                            </>
                          )}

                          {item.addOns.length > 0 && (
                            <>
                              <tr style={{ background: "var(--violet-a1)" }}>
                                <td />
                                <td
                                  colSpan={6}
                                  style={{
                                    padding: "6px 16px 4px 32px",
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: "var(--violet-11)",
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                  }}
                                >
                                  Add-ons
                                </td>
                              </tr>
                              {item.addOns.map((a: ProductAddOnPerformanceDto, ai: number) => (
                                <tr
                                  key={`ao-${ai}`}
                                  style={{
                                    background: "var(--violet-a1)",
                                    borderBottom: "1px solid var(--gray-a2)",
                                  }}
                                >
                                  <td />
                                  <td style={{ padding: "8px 16px 8px 32px", color: "var(--violet-11)" }}>
                                    ↳ {a.groupName}: {a.itemName}
                                  </td>
                                  <td style={{ padding: "8px 16px", color: "var(--gray-9)" }}>—</td>
                                  <td style={{ padding: "8px 16px", textAlign: "center", color: "var(--gray-11)" }}>
                                    <Text size="1">—</Text>
                                  </td>
                                  <td style={{ padding: "8px 16px", textAlign: "right", color: "var(--gray-11)" }}>
                                    <Text size="1">{formatCurrency(a.revenue)}</Text>
                                  </td>
                                  <td style={{ padding: "8px 16px", textAlign: "center", color: "var(--gray-11)" }}>
                                    <Text size="1">{a.timesOrdered}×</Text>
                                  </td>
                                  <td />
                                </tr>
                              ))}
                            </>
                          )}
                        </>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </Box>
        )}
      </Card>
    </Box>
  );
};
