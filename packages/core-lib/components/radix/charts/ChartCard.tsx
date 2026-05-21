import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  IconButton,
  Text,
} from "@radix-ui/themes";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { ChartEmpty } from "./ChartEmpty";
import { ChartError } from "./ChartError";
import { ChartFilters, ChartFiltersState, ProductOption } from "./ChartFilters";
import { ChartLegend } from "./ChartLegend";
import { ChartLoader } from "./ChartLoader";
import { formatChartValue } from "./format";
import { resolveSeriesColors, resolveSliceColors } from "./palette";
import { useChart } from "./useChart";
import { ChartPeriod, ChartType } from "./types";
import { DEFAULT_CHART_HEIGHT } from "./constants";

const RechartsCanvas = dynamic(
  () =>
    import("./internals/RechartsCanvas").then((m) => m.RechartsCanvas),
  {
    ssr: false,
    loading: () => <ChartLoader />,
  },
);

const formatWindowDate = (iso: string | null | undefined): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatWindow = (
  fromDate: string | null | undefined,
  toDate: string | null | undefined,
): string | null => {
  const from = formatWindowDate(fromDate);
  const to = formatWindowDate(toDate);
  if (from && to) return from === to ? from : `${from} – ${to}`;
  return from ?? to ?? null;
};

export interface ChartCardProps {
  /** Backend chartKey — also the cache key. */
  chartKey: string;
  /** Override the chart's `chartType` (otherwise uses the backend value). */
  typeOverride?: ChartType;
  /** Card header — falls back to the chart's `title`. */
  title?: string;
  /** Card subtitle — falls back to the chart's `description`. */
  description?: string;
  /** Icon rendered in the card header. */
  icon?: React.ReactNode;
  /** Custom color palette. Each entry maps to a series/slice in order. */
  customColors?: string[];
  /** Plot area height (px). */
  height?: number;
  /** X-axis label. */
  xAxisLabel?: string;
  /** Y-axis label. */
  yAxisLabel?: string;
  /** Show the period / groupBy / product filters. */
  showFilters?: boolean;
  /** Show inline legend in the header row. Default: true. */
  showLegend?: boolean;
  /** Initial filter state. */
  initialFilters?: Partial<ChartFiltersState>;
  /** Enable product-filter popover. */
  productOptions?: ProductOption[];
  /** Quick period chips (defaults to ["today","7d","30d","90d","year"]). */
  quickPeriods?: ChartPeriod[];
}

const DEFAULT_FILTERS: ChartFiltersState = {
  period: "30d",
  groupBy: "day",
};

export const ChartCard: React.FC<ChartCardProps> = ({
  chartKey,
  typeOverride,
  title,
  description,
  icon,
  customColors,
  height = DEFAULT_CHART_HEIGHT,
  xAxisLabel,
  yAxisLabel,
  showFilters = false,
  showLegend = true,
  initialFilters,
  productOptions,
  quickPeriods,
}) => {
  const [filters, setFilters] = useState<ChartFiltersState>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const { data, loading, error, refresh } = useChart({
    chartKey,
    period: showFilters ? filters.period : undefined,
    fromDate: showFilters ? filters.fromDate : undefined,
    toDate: showFilters ? filters.toDate : undefined,
    groupBy: showFilters ? filters.groupBy : undefined,
    productIds: showFilters ? filters.productIds : undefined,
  });

  const chartType: ChartType = typeOverride ?? data?.chartType ?? "line";

  const legendEntries = useMemo(() => {
    if (!data) return [];
    if (chartType === "donut" && data.slices) {
      const colors = resolveSliceColors(data.slices, customColors);
      return data.slices.map((s) => ({
        id: s.id,
        name: s.label,
        color: colors.get(s.id) ?? "var(--gray-9)",
      }));
    }
    const colors = resolveSeriesColors(data.series, customColors);
    return data.series.map((s) => ({
      id: s.id,
      name: s.name,
      color: colors.get(s.id) ?? "var(--gray-9)",
    }));
  }, [data, chartType, customColors]);

  const toggleSeries = (id: string) =>
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const trend = data?.meta?.trend;
  const total = data?.meta?.total;
  const resolvedTitle = title ?? data?.title;
  const resolvedDesc = description ?? data?.description;
  const windowLabel = formatWindow(data?.meta?.fromDate, data?.meta?.toDate);

  const isEmpty =
    !loading &&
    !error &&
    !!data &&
    ((chartType === "donut" && !(data.slices?.length ?? 0)) ||
      (chartType !== "donut" && data.points.length === 0));

  return (
    <Card size="3" variant="surface" style={{ height: "100%" }}>
      <Flex direction="column" gap="3" style={{ height: "100%" }}>
        <Flex
          direction="column"
          gap="2"
        >
          <Flex
            justify="between"
            align="start"
            gap="3"
            wrap="wrap"
          >
            <Flex align="center" gap="3" style={{ minWidth: 0, flex: 1 }}>
              {icon && (
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
                  {icon}
                </Box>
              )}
              <Box style={{ minWidth: 0, flex: 1 }}>
                <Flex align="center" gap="2" wrap="wrap">
                  {resolvedTitle && (
                    <Heading size="3" weight="medium" truncate>
                      {resolvedTitle}
                    </Heading>
                  )}
                  {data?.meta?.stale && (
                    <Badge color="amber" variant="soft" radius="full" size="1">
                      Refreshing
                    </Badge>
                  )}
                </Flex>
                {resolvedDesc && (
                  <Text size="1" color="gray" truncate>
                    {resolvedDesc}
                  </Text>
                )}
              </Box>
            </Flex>
            <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
              <IconButton
                size="1"
                variant="ghost"
                color="gray"
                onClick={refresh}
                disabled={loading}
                aria-label="Refresh chart"
                title="Refresh"
              >
                <ReloadIcon />
              </IconButton>
            </Flex>
          </Flex>
          {showFilters && (
            <Flex align="center" gap="2" wrap="wrap">
              <ChartFilters
                state={filters}
                onChange={setFilters}
                enable={{
                  period: true,
                  groupBy: true,
                  products: !!productOptions?.length,
                }}
                productOptions={productOptions}
                quickPeriods={quickPeriods}
              />
            </Flex>
          )}
        </Flex>

        {(total !== undefined || trend || windowLabel) && (
          <Flex align="baseline" gap="3" wrap="wrap">
            {total !== undefined && (
              <Heading size="6" weight="bold">
                {formatChartValue(total, data?.numberFormat)}
              </Heading>
            )}
            {trend && (
              <Flex align="center" gap="1">
                <Box
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background:
                      trend.direction === "up"
                        ? "var(--green-a3)"
                        : trend.direction === "down"
                          ? "var(--red-a3)"
                          : "var(--gray-a3)",
                    color:
                      trend.direction === "up"
                        ? "var(--green-11)"
                        : trend.direction === "down"
                          ? "var(--red-11)"
                          : "var(--gray-11)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {trend.direction === "up" ? (
                    <ArrowUpIcon width="12" height="12" />
                  ) : trend.direction === "down" ? (
                    <ArrowDownIcon width="12" height="12" />
                  ) : null}
                </Box>
                <Text
                  size="1"
                  weight="medium"
                  color={
                    trend.direction === "up"
                      ? "green"
                      : trend.direction === "down"
                        ? "red"
                        : "gray"
                  }
                >
                  {trend.value > 0 ? "+" : ""}
                  {trend.value.toFixed(1)}%
                </Text>
                <Text size="1" color="gray">
                  vs previous
                </Text>
              </Flex>
            )}
            {windowLabel && (
              <Text size="1" color="gray" style={{ marginLeft: "auto" }}>
                {windowLabel}
              </Text>
            )}
          </Flex>
        )}

        {showLegend && legendEntries.length > 0 && (
          <ChartLegend
            entries={legendEntries}
            hidden={hiddenSeries}
            onToggle={chartType === "donut" ? undefined : toggleSeries}
          />
        )}

        <Box style={{ flex: 1, minHeight: height }}>
          {error ? (
            <ChartError
              height={height}
              message={error}
              onRetry={refresh}
            />
          ) : loading ? (
            <ChartLoader
              height={height}
              variant={chartType === "donut" ? "donut" : "cartesian"}
            />
          ) : isEmpty || !data ? (
            <ChartEmpty
              height={height}
              hint={`chartKey: ${chartKey}`}
            />
          ) : (
            <RechartsCanvas
              type={chartType}
              series={data.series}
              points={data.points}
              slices={data.slices ?? []}
              numberFormat={data.numberFormat}
              customColors={customColors}
              height={height}
              hiddenSeries={hiddenSeries}
              xAxisLabel={xAxisLabel}
              yAxisLabel={yAxisLabel}
            />
          )}
        </Box>
      </Flex>
    </Card>
  );
};
