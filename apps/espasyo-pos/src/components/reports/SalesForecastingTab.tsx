import React, { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Grid,
  Heading,
  IconButton,
  ScrollArea,
  Skeleton,
  Table,
  Text,
} from "@radix-ui/themes";
import {
  AutoAwesomeOutlined,
  InfoOutlined,
  PrintOutlined,
  RefreshOutlined,
  TrendingDownOutlined,
  TrendingFlatOutlined,
  TrendingUpOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApi } from "core-lib/core/hooks";
import { PrintPreviewDialog } from "core-lib/components/print";
import { formatCurrency } from "../contents/procurement/format";
import { SalesForecastPrintable } from "./SalesForecastPrintable";

interface Props {
  currencyCode: string;
  businessName: string;
  logoUrl?: string | null;
}

const TODAY = new Date().toISOString().slice(0, 10);

const formatShortDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
};

const formatFullDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

// ── Tooltip ──────────────────────────────────────────────────────────────────

const ForecastTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ payload: { date: string; dayOfWeek: string; displayValue: number; isFuture: boolean } }>;
  currencyCode: string;
}> = ({ active, payload, currencyCode }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <Box
      style={{
        background: "var(--color-panel-solid)",
        border: "1px solid var(--gray-a5)",
        borderRadius: 8,
        padding: "10px 14px",
        boxShadow: "var(--shadow-2)",
        minWidth: 160,
      }}
    >
      <Text size="2" weight="bold" as="div" mb="1">
        {d.dayOfWeek} · {formatFullDate(d.date)}
      </Text>
      <Text size="2" as="div" style={{ color: d.isFuture ? "#f59e0b" : "#4f46e5" }}>
        {d.isFuture ? "Forecast" : "Actual"}: {formatCurrency(d.displayValue, currencyCode)}
      </Text>
    </Box>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

export const SalesForecastingTab: React.FC<Props> = ({
  currencyCode,
  businessName,
  logoUrl,
}) => {
  const [printOpen, setPrintOpen] = useState(false);
  const forecastApi = useApi((api) => api.commons.salesForecast(), []);
  const forecast = forecastApi.result?.data?.response;

  const chartData = useMemo(() => {
    if (!forecast?.days) return [];
    return forecast.days.map((d) => {
      const isFuture = d.actualRevenue === null;
      return {
        date: d.date,
        dayOfWeek: d.dayOfWeek,
        label: d.date === TODAY ? `${d.dayOfWeek.slice(0, 3)} (Today)` : d.dayOfWeek.slice(0, 3),
        displayValue: isFuture ? d.forecastedRevenue : (d.actualRevenue ?? 0),
        isFuture,
        isToday: d.date === TODAY,
      };
    });
  }, [forecast]);

  const todayIndex = chartData.findIndex((d) => d.isToday);

  const trendColor =
    forecast?.trendDirection === "up"
      ? "var(--green-11)"
      : forecast?.trendDirection === "down"
        ? "var(--red-11)"
        : "var(--gray-11)";

  const trendBg =
    forecast?.trendDirection === "up"
      ? "var(--green-a2)"
      : forecast?.trendDirection === "down"
        ? "var(--red-a2)"
        : "var(--gray-a2)";

  const TrendIcon =
    forecast?.trendDirection === "up"
      ? TrendingUpOutlined
      : forecast?.trendDirection === "down"
        ? TrendingDownOutlined
        : TrendingFlatOutlined;

  if (forecastApi.loading) {
    return (
      <Box pt="4">
        <Grid columns={{ initial: "1", sm: "3" }} gap="3" mb="4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="90px" />
          ))}
        </Grid>
        <Skeleton height="260px" mb="4" />
        <Skeleton height="220px" />
      </Box>
    );
  }

  if (!forecast) {
    return (
      <Box pt="4">
        <Callout.Root color="amber">
          <InfoOutlined style={{ fontSize: 18 }} />
          <Callout.Text>
            Sales forecast data is not available. The forecasting service may need more historical data.
          </Callout.Text>
        </Callout.Root>
      </Box>
    );
  }

  return (
    <>
      <Box pt="4">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Flex justify="between" align="center" wrap="wrap" gap="3" mb="4">
            <Flex align="center" gap="3">
              <Heading size="5" weight="bold">
                Sales Forecast
              </Heading>
              <Badge color="indigo" variant="soft" radius="full">
                {formatFullDate(forecast.forecastWeekStart)} – {formatFullDate(forecast.forecastWeekEnd)}
              </Badge>
              {forecast.isAiGenerated ? (
                <Badge color="amber" variant="soft">
                  <AutoAwesomeOutlined style={{ fontSize: 11 }} />
                  AI-powered
                </Badge>
              ) : (
                <Badge color="blue" variant="soft">
                  Statistical
                </Badge>
              )}
            </Flex>
            <Flex gap="2">
              <Button
                size="1"
                variant="soft"
                color="gray"
                onClick={() => forecastApi.execute()}
              >
                <RefreshOutlined style={{ fontSize: 13 }} />
                Refresh
              </Button>
              <Button
                size="1"
                variant="soft"
                color="indigo"
                onClick={() => setPrintOpen(true)}
              >
                <PrintOutlined style={{ fontSize: 13 }} />
                Print
              </Button>
            </Flex>
          </Flex>
        </motion.div>

        {/* ── KPI Cards ── */}
        <Grid columns={{ initial: "1", sm: "3" }} gap="3" mb="4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <Card
              variant="surface"
              style={{
                background: "var(--indigo-a2)",
                border: "1px solid var(--indigo-a4)",
                height: "100%",
              }}
            >
              <Flex align="center" gap="2" mb="2">
                <TrendingUpOutlined style={{ fontSize: 16, color: "var(--indigo-11)" }} />
                <Text size="1" color="gray" weight="medium" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Forecasted Revenue
                </Text>
              </Flex>
              <Text size="7" weight="bold" style={{ color: "var(--indigo-12)", lineHeight: 1 }}>
                {formatCurrency(forecast.totalForecastedRevenue, currencyCode)}
              </Text>
              <Text size="1" color="gray" as="div" mt="1">
                Next 7 days
              </Text>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card
              variant="surface"
              style={{ height: "100%" }}
            >
              <Flex align="center" gap="2" mb="2">
                <InfoOutlined style={{ fontSize: 16, color: "var(--gray-11)" }} />
                <Text size="1" color="gray" weight="medium" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Previous Week
                </Text>
              </Flex>
              <Text size="7" weight="bold" style={{ color: "var(--gray-12)", lineHeight: 1 }}>
                {formatCurrency(forecast.previousWeekRevenue, currencyCode)}
              </Text>
              <Text size="1" color="gray" as="div" mt="1">
                Last 7 days actual
              </Text>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Card
              variant="surface"
              style={{
                background: trendBg,
                border: `1px solid color-mix(in srgb, ${trendColor} 25%, transparent)`,
                height: "100%",
              }}
            >
              <Flex align="center" gap="2" mb="2">
                <TrendIcon style={{ fontSize: 16, color: trendColor }} />
                <Text size="1" color="gray" weight="medium" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Trend
                </Text>
              </Flex>
              <Text size="7" weight="bold" style={{ color: trendColor, lineHeight: 1 }}>
                {forecast.trendDirection === "up" ? "+" : forecast.trendDirection === "down" ? "−" : ""}
                {forecast.trendPercent.toFixed(1)}%
              </Text>
              <Text size="1" as="div" mt="1" style={{ color: trendColor, opacity: 0.75 }}>
                vs previous week
              </Text>
            </Card>
          </motion.div>
        </Grid>

        {/* ── AI Insight ── */}
        {forecast.insight && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Callout.Root
              color={forecast.isAiGenerated ? "amber" : "blue"}
              mb="4"
              style={{ alignItems: "flex-start" }}
            >
              <Box pt="1">
                {forecast.isAiGenerated ? (
                  <AutoAwesomeOutlined style={{ fontSize: 18 }} />
                ) : (
                  <InfoOutlined style={{ fontSize: 18 }} />
                )}
              </Box>
              <Callout.Text>
                <Flex gap="2" align="center" mb="1" wrap="wrap">
                  <Badge color={forecast.isAiGenerated ? "amber" : "blue"} size="1">
                    {forecast.isAiGenerated ? "AI Insight" : "Statistical Prediction"}
                  </Badge>
                </Flex>
                {forecast.insight}
              </Callout.Text>
            </Callout.Root>
          </motion.div>
        )}

        {/* ── Chart ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
        >
          <Card variant="surface" mb="4">
            <Box p={{ initial: "3", sm: "4" }}>
              <Flex justify="between" align="center" mb="3" wrap="wrap" gap="2">
                <Box>
                  <Heading size="3" weight="bold">14-Day Revenue Overview</Heading>
                  <Text size="1" color="gray">Past 7 days actual · Next 7 days forecast</Text>
                </Box>
                <Flex gap="3" align="center">
                  <Flex align="center" gap="1">
                    <Box style={{ width: 12, height: 12, borderRadius: 3, background: "#4f46e5" }} />
                    <Text size="1" color="gray">Actual</Text>
                  </Flex>
                  <Flex align="center" gap="1">
                    <Box style={{ width: 12, height: 12, borderRadius: 3, background: "#f59e0b", opacity: 0.85 }} />
                    <Text size="1" color="gray">Forecast</Text>
                  </Flex>
                </Flex>
              </Flex>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart
                  data={chartData}
                  margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                  barCategoryGap="30%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-a4)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "var(--gray-11)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--gray-11)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatCurrency(v, currencyCode).replace(/\.\d+$/, "")}
                    width={70}
                  />
                  <RechartsTooltip
                    content={<ForecastTooltip currencyCode={currencyCode} />}
                    cursor={{ fill: "var(--gray-a3)" }}
                  />
                  {todayIndex >= 0 && (
                    <ReferenceLine
                      x={chartData[todayIndex]?.label}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      label={{ value: "Today", position: "insideTopLeft", fontSize: 10, fill: "#b45309" }}
                    />
                  )}
                  <Bar dataKey="displayValue" maxBarSize={32} radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isToday ? "#f59e0b" : entry.isFuture ? "#fbbf24" : "#4f46e5"}
                        opacity={entry.isFuture && !entry.isToday ? 0.7 : 1}
                      />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </motion.div>

        {/* ── Daily Breakdown Table ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
        >
          <Card variant="surface">
            <Box p={{ initial: "3", sm: "4" }}>
              <Heading size="3" weight="bold" mb="3">
                Daily Breakdown
              </Heading>
              <ScrollArea>
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Day</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell justify="end">Actual Revenue</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell justify="end">Forecasted Revenue</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {forecast.days.map((day) => {
                      const isFuture = day.actualRevenue === null;
                      const isToday = day.date === TODAY;
                      return (
                        <Table.Row
                          key={day.date}
                          style={{
                            background: isToday
                              ? "var(--amber-a2)"
                              : isFuture
                                ? "var(--indigo-a1)"
                                : undefined,
                          }}
                        >
                          <Table.Cell>
                            <Flex align="center" gap="2">
                              <Text size="2" weight={isToday ? "bold" : "regular"}>
                                {formatShortDate(day.date)}
                              </Text>
                              {isToday && (
                                <Badge size="1" color="amber" variant="soft" radius="full">
                                  Today
                                </Badge>
                              )}
                            </Flex>
                          </Table.Cell>
                          <Table.Cell>
                            <Text size="2" color="gray">{day.dayOfWeek}</Text>
                          </Table.Cell>
                          <Table.Cell justify="end">
                            {day.actualRevenue !== null ? (
                              <Text size="2" weight="medium">
                                {formatCurrency(day.actualRevenue, currencyCode)}
                              </Text>
                            ) : (
                              <Text size="2" color="gray">—</Text>
                            )}
                          </Table.Cell>
                          <Table.Cell justify="end">
                            {isFuture ? (
                              <Text size="2" weight="medium" style={{ color: "var(--amber-11)" }}>
                                {formatCurrency(day.forecastedRevenue, currencyCode)}
                              </Text>
                            ) : (
                              <Text size="2" color="gray">—</Text>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            <Badge
                              size="1"
                              color={isFuture ? "amber" : "indigo"}
                              variant="soft"
                            >
                              {isFuture ? "Forecast" : "Actual"}
                            </Badge>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Root>
              </ScrollArea>
            </Box>
          </Card>
        </motion.div>

        <Text as="div" size="1" color="gray" mt="3" style={{ fontStyle: "italic" }}>
          Forecasts generated {new Date(forecast.generatedAt).toLocaleString()} ·{" "}
          {forecast.isAiGenerated ? "AI analysis of historical patterns" : "Statistical trend analysis"}
        </Text>

      </Box>

      {/* ── Print Preview ── */}
      <PrintPreviewDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        title={`Sales Forecast · ${formatShortDate(forecast.forecastWeekStart)} – ${formatShortDate(forecast.forecastWeekEnd)}`}
      >
        <SalesForecastPrintable
          forecast={forecast}
          currencyCode={currencyCode}
          businessName={businessName}
          logoUrl={logoUrl}
        />
      </PrintPreviewDialog>
    </>
  );
};
