import { ChartNumberFormat } from "./types";

/**
 * Formats a numeric chart value using the chart's `numberFormat` spec.
 * Falls back to `Intl.NumberFormat` defaults when nothing is specified.
 *
 * - If `currency` is set, uses currency formatting (overrides prefix/suffix).
 * - Otherwise applies `prefix` + grouped value + `suffix`.
 * - Compact form (e.g. 1.2K, 3.4M) is used when `compact` is true.
 */
export const formatChartValue = (
  value: number | string | null | undefined,
  format?: ChartNumberFormat,
  compact: boolean = false,
): string => {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return "—";

  const decimals = format?.decimals ?? (Math.abs(num) >= 1000 ? 0 : 2);
  const thousands = format?.thousands ?? true;

  if (format?.currency) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: format.currency,
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: decimals,
      minimumFractionDigits: 0,
    }).format(num);
  }

  const formatted = new Intl.NumberFormat(undefined, {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
    useGrouping: thousands,
  }).format(num);

  const prefix = format?.prefix ?? "";
  const suffix = format?.suffix ?? "";
  return `${prefix}${formatted}${suffix}`;
};

/** Short formatter used on axis ticks (always compact, no decimals). */
export const formatAxisTick = (
  value: number,
  format?: ChartNumberFormat,
): string => formatChartValue(value, format, true);
