import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApiCallback } from "../../../core/hooks";
import {
  ChartDataResponseDto,
  ChartQueryParams,
} from "../../../api/commons/types";
import {
  ChartDataResponse,
  ChartGroupBy,
  ChartPeriod,
} from "./types";

const adaptResponse = (dto: ChartDataResponseDto): ChartDataResponse => ({
  chartKey: dto.chartKey,
  chartType: dto.chartType,
  title: dto.title ?? undefined,
  description: dto.description ?? undefined,
  numberFormat: dto.numberFormat
    ? {
        prefix: dto.numberFormat.prefix ?? undefined,
        suffix: dto.numberFormat.suffix ?? undefined,
        decimals: dto.numberFormat.decimals ?? undefined,
        thousands: dto.numberFormat.thousands ?? undefined,
        currency: dto.numberFormat.currency ?? undefined,
      }
    : undefined,
  series: (dto.series ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color ?? undefined,
  })),
  points: (dto.points ?? []).map((p) => ({
    label: p.label,
    timestamp: p.timestamp ?? undefined,
    values: p.values,
  })),
  slices: dto.slices
    ? dto.slices.map((s) => ({
        id: s.id,
        label: s.label,
        value: s.value,
        color: s.color ?? undefined,
      }))
    : undefined,
  meta: dto.meta
    ? {
        total: dto.meta.total ?? undefined,
        trend: dto.meta.trend ?? undefined,
        period: dto.meta.period ?? undefined,
        fromDate: dto.meta.fromDate ?? undefined,
        toDate: dto.meta.toDate ?? undefined,
        stale: dto.meta.stale ?? undefined,
      }
    : undefined,
});

export interface UseChartArgs {
  chartKey: string;
  period?: ChartPeriod;
  fromDate?: string;
  toDate?: string;
  groupBy?: ChartGroupBy;
  productIds?: string[];
  categoryIds?: string[];
  /** Set to false to skip auto-fetch on mount/dep change. */
  enabled?: boolean;
}

export interface UseChartResult {
  data: ChartDataResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Reads a chart by key, optionally with filters. Backend handles
 * stale-while-revalidate transparently; the hook surfaces whatever
 * `response` comes back, plus `meta.stale` when applicable.
 */
export const useChart = ({
  chartKey,
  period,
  fromDate,
  toDate,
  groupBy,
  productIds,
  categoryIds,
  enabled = true,
}: UseChartArgs): UseChartResult => {
  const [data, setData] = useState<ChartDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled && !!chartKey);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef<number>(0);

  const fetchCb = useApiCallback(
    async (api, args: { key: string; query: ChartQueryParams }) =>
      await api.commons.getChartByKey(args.key, args.query),
  );

  const querySignature = useMemo(
    () =>
      JSON.stringify({
        chartKey,
        period,
        fromDate,
        toDate,
        groupBy,
        productIds,
        categoryIds,
      }),
    [chartKey, period, fromDate, toDate, groupBy, productIds, categoryIds],
  );

  const load = useCallback(async () => {
    if (!chartKey) return;
    const generation = ++inFlight.current;
    setLoading(true);
    setError(null);
    try {
      const query: ChartQueryParams = {};
      if (period) query.period = period;
      if (fromDate) query.fromDate = fromDate;
      if (toDate) query.toDate = toDate;
      if (groupBy) query.groupBy = groupBy;
      if (productIds?.length) query.productIds = productIds;
      if (categoryIds?.length) query.categoryIds = categoryIds;

      const result = await fetchCb.execute({ key: chartKey, query });
      if (generation !== inFlight.current) return;
      const payload = result.data?.response ?? null;
      setData(payload ? adaptResponse(payload) : null);
    } catch (err) {
      if (generation !== inFlight.current) return;
      const status = (err as string[] & { status?: number }).status;
      const first =
        Array.isArray(err) && typeof err[0] === "string"
          ? (err[0] as string)
          : null;
      setError(
        status === 404
          ? `Chart "${chartKey}" is not configured yet.`
          : first ?? "Failed to load chart",
      );
      setData(null);
    } finally {
      if (generation === inFlight.current) setLoading(false);
    }
  }, [
    chartKey,
    period,
    fromDate,
    toDate,
    groupBy,
    productIds,
    categoryIds,
    fetchCb,
  ]);

  useEffect(() => {
    if (!enabled || !chartKey) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    void load();
  }, [enabled, querySignature]);

  return { data, loading, error, refresh: load };
};
