import { ChartSeries, DonutSlice } from "./types";
import { DEFAULT_PALETTE } from "./constants";

/** Resolve a stable color for each series in order. */
export const resolveSeriesColors = (
  series: ChartSeries[],
  customColors?: string[],
): Map<string, string> => {
  const palette = customColors?.length ? customColors : DEFAULT_PALETTE;
  const map = new Map<string, string>();
  series.forEach((s, idx) => {
    map.set(s.id, s.color ?? palette[idx % palette.length]);
  });
  return map;
};

/** Resolve colors for donut slices. */
export const resolveSliceColors = (
  slices: DonutSlice[],
  customColors?: string[],
): Map<string, string> => {
  const palette = customColors?.length ? customColors : DEFAULT_PALETTE;
  const map = new Map<string, string>();
  slices.forEach((s, idx) => {
    map.set(s.id, s.color ?? palette[idx % palette.length]);
  });
  return map;
};
