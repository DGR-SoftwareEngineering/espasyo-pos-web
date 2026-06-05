import { ChartGroupBy, ChartPeriod } from "./types";

export interface PeriodPreset {
  value: ChartPeriod;
  label: string;
  shortLabel: string;
  /** Default groupBy for this period. */
  defaultGroupBy: ChartGroupBy;
}

export const PERIOD_PRESETS: PeriodPreset[] = [
  { value: "today", label: "Today", shortLabel: "Today", defaultGroupBy: "hour" },
  {
    value: "yesterday",
    label: "Yesterday",
    shortLabel: "Yesterday",
    defaultGroupBy: "hour",
  },
  { value: "7d", label: "Last 7 days", shortLabel: "7d", defaultGroupBy: "day" },
  { value: "30d", label: "Last 30 days", shortLabel: "30d", defaultGroupBy: "day" },
  { value: "90d", label: "Last 90 days", shortLabel: "90d", defaultGroupBy: "week" },
  { value: "ytd", label: "Year to date", shortLabel: "YTD", defaultGroupBy: "month" },
  { value: "year", label: "Last 12 months", shortLabel: "12m", defaultGroupBy: "month" },
  { value: "all", label: "All time", shortLabel: "All", defaultGroupBy: "month" },
  { value: "custom", label: "Custom range", shortLabel: "Custom", defaultGroupBy: "day" },
];

export const GROUP_BY_OPTIONS: Array<{ value: ChartGroupBy; label: string }> = [
  { value: "hour", label: "Hourly" },
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
  { value: "quarter", label: "Quarterly" },
  { value: "year", label: "Yearly" },
];

/**
 * Default palette — tuned to read clearly against both light and dark Radix
 * surfaces. Picked from the Radix color scale's `9` step (solid bg) so each
 * series stays distinguishable.
 */
export const DEFAULT_PALETTE: string[] = [
  "var(--indigo-9)",
  "var(--teal-9)",
  "var(--amber-9)",
  "var(--crimson-9)",
  "var(--violet-9)",
  "var(--cyan-9)",
  "var(--orange-9)",
  "var(--grass-9)",
  "var(--pink-9)",
  "var(--sky-9)",
];

/** Default chart height when the container doesn't dictate one. */
export const DEFAULT_CHART_HEIGHT = 280;
