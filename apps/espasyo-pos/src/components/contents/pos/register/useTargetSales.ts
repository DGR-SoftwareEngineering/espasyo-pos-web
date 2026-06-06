import { usePublicSettings } from "core-lib";
import { getDailySalesGross } from "core-lib/business";
import { useApi } from "core-lib/core/hooks";

export interface UseTargetSalesResult {
  enabled: boolean;
  targetAmount: number;
  currentAmount: number;
  progressPct: number;
  reached: boolean;
  confettiEnabled: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

export const useTargetSales = (): UseTargetSalesResult => {
  const { pos } = usePublicSettings();
  const summary = useApi((api) => api.commons.salesDailySummary(), []);

  const currentAmount = getDailySalesGross(summary.result?.data?.response);
  const targetAmount = pos.targetSalesAmountPerDay;

  const progressPct = targetAmount > 0
    ? Math.min((currentAmount / targetAmount) * 100, 100)
    : 0;

  const reached = targetAmount > 0 && currentAmount >= targetAmount;

  const refresh = async () => {
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
    refresh,
  };
};
