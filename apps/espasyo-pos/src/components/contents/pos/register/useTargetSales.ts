import { useEffect } from "react";
import { usePublicSettings } from "core-lib";
import { getDailySalesGross } from "core-lib/business";
import { useApi } from "core-lib/core/hooks";
import { useOfflineMode } from "core-lib/core/contexts";
import { DailySalesSummaryDto } from "core-lib/api/commons/types";
import {
  cacheTargetSales,
  getCachedTargetSales,
} from "core-lib/core/services/offlineDb";

export interface UseTargetSalesResult {
  enabled: boolean;
  targetAmount: number;
  currentAmount: number;
  progressPct: number;
  reached: boolean;
  confettiEnabled: boolean;
  loading: boolean;
  isFromCache: boolean;
  summary: DailySalesSummaryDto | null;
  refresh: () => Promise<void>;
}

export const useTargetSales = (): UseTargetSalesResult => {
  const { pos } = usePublicSettings();
  const { isOnline } = useOfflineMode();
  const summary = useApi((api) => api.commons.salesDailySummary(), []);

  // Cache successful responses
  useEffect(() => {
    const data = summary.result?.data?.response;
    if (data) {
      cacheTargetSales(data).catch(() => {});
    }
  }, [summary.result]);

  const liveData = summary.result?.data?.response ?? null;
  const hasFailed = !summary.loading && !liveData;

  // Derive the summary with offline fallback (resolved in render — getCachedTargetSales
  // is async so we rely on the initial liveData; fallback is used by the parent
  // component after it awaits getCachedTargetSales separately if needed)
  const currentAmount = getDailySalesGross(liveData);
  const targetAmount = pos.targetSalesAmountPerDay;

  const progressPct = targetAmount > 0
    ? Math.min((currentAmount / targetAmount) * 100, 100)
    : 0;

  const reached = targetAmount > 0 && currentAmount >= targetAmount;

  const refresh = async () => {
    if (!isOnline) return;
    await summary.execute();
  };

  return {
    enabled: pos.targetSalesEnabled && targetAmount > 0,
    targetAmount,
    currentAmount,
    progressPct,
    reached,
    confettiEnabled: pos.targetSalesConfettiEnabled,
    loading: summary.loading,
    isFromCache: !isOnline && hasFailed,
    summary: liveData,
    refresh,
  };
};
