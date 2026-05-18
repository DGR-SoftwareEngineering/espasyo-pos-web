/**
 * Canonical chart data shape consumed by every chart view in this folder.
 *
 * Backend speaks this shape. UI layer never touches FusionCharts-style
 * `{ data: [...], datasets: [...] }` envelopes — only `series` + `points`
 * (for cartesian charts) or `slices` (for donut).
 */

export type ChartType = "line" | "area" | "bar" | "donut";

/** Time-window presets the dashboard offers. */
export type ChartPeriod =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "90d"
  | "ytd"
  | "year"
  | "all"
  | "custom";

/** How the backend aggregates raw rows when computing the chart. */
export type ChartGroupBy = "hour" | "day" | "week" | "month" | "quarter" | "year";

export interface ChartSeries {
  /** Stable key used inside `ChartPoint.values`. */
  id: string;
  /** Display name for legend + tooltip. */
  name: string;
  /** Optional hex/CSS color override. */
  color?: string;
}

export interface ChartPoint {
  /** X-axis display label. */
  label: string;
  /** Optional underlying timestamp (ISO 8601) — kept for tooltip + sort. */
  timestamp?: string;
  /** Series values keyed by `ChartSeries.id`. */
  values: Record<string, number>;
}

export interface DonutSlice {
  id: string;
  label: string;
  value: number;
  color?: string;
}

export interface ChartNumberFormat {
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** Whether to render thousands separators (e.g. 1,250). */
  thousands?: boolean;
  /** Currency code for Intl.NumberFormat (overrides prefix/suffix if provided). */
  currency?: string;
}

export interface ChartTrend {
  /** Percentage change vs. previous comparable window. */
  value: number;
  direction: "up" | "down" | "flat";
}

export interface ChartMeta {
  /** Aggregate over the whole window. */
  total?: number;
  /** Trend vs. previous comparable window. */
  trend?: ChartTrend;
  /** The window covered. */
  period?: ChartPeriod;
  fromDate?: string;
  toDate?: string;
  /** Indicates the data came from cache (stale-while-revalidate). */
  stale?: boolean;
}

export interface ChartDataResponse {
  chartKey: string;
  chartType: ChartType;
  title?: string;
  description?: string;
  numberFormat?: ChartNumberFormat;
  /** Required for line/area/bar. */
  series: ChartSeries[];
  /** Required for line/area/bar. */
  points: ChartPoint[];
  /** Required for donut. */
  slices?: DonutSlice[];
  meta?: ChartMeta;
}

export interface ChartQuery {
  chartKey: string;
  period?: ChartPeriod;
  fromDate?: string;
  toDate?: string;
  groupBy?: ChartGroupBy;
  productIds?: string[];
  categoryIds?: string[];
  /** Open extension for chart-specific filters. */
  extra?: Record<string, string | string[] | number | undefined>;
}

/** Static chart payload for admins seeding sample data via Settings → Charts. */
export interface CreateChartPayload {
  chartKey: string;
  chartType: ChartType;
  title?: string;
  description?: string;
  numberFormat?: ChartNumberFormat;
  series?: ChartSeries[];
  points?: ChartPoint[];
  slices?: DonutSlice[];
  cacheDurationMinutes?: number;
}
