import React, { useRef, useState, useEffect } from "react";
import {
  Box,
} from "core-lib/components/radix/proxies";;
import { useAuthContext } from "core-lib";
import { usePublicSettings } from "core-lib/core/contexts";
import { getDailySalesGross } from "core-lib/business";
import { useApi, useResolution } from "core-lib/core/hooks";
import { AdminHero } from "./AdminHero";
import { AdminKpiRow } from "./AdminKpiRow";
import { AdminChartsRow } from "./AdminChartsRow";
import { AdminRecentActivity } from "./AdminRecentActivity";
import { AdminSystemHealth } from "./AdminSystemHealth";
import { AdminSalesInsight } from "./AdminSalesInsight";
import { SalesCelebrationModal } from "./SalesCelebrationModal";

// The ".v2" suffix is a one-time cache-buster: it invalidates any stale flag
// set before the open/flag ordering below was corrected.
const CELEBRATION_FIRED_TODAY_KEY = "espasyo.targetSales.celebrationFiredToday.v2";

const getCelebrationFiredToday = (): boolean => {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(CELEBRATION_FIRED_TODAY_KEY);
  if (!stored) return false;
  const [firedDate, firedAmount] = stored.split("|");
  const today = new Date().toISOString().split("T")[0];
  return firedDate === today && firedAmount !== null;
};

const setCelebrationFiredToday = () => {
  if (typeof window !== "undefined") {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(CELEBRATION_FIRED_TODAY_KEY, `${today}|1`);
  }
};

interface Props {
  initials: string
  role: string;
}

export const AdminDashboard: React.FC<Props> = ({ initials, role }) => {
  const { isSmallMobile } = useResolution();
  const { systemName, operationalStatus, maintenance, pos, currencyCode } = usePublicSettings();
  const [showCelebration, setShowCelebration] = useState(false);
  const dailySummary = useApi((api) => api.commons.salesDailySummary(), []);

  const response = dailySummary.result?.data?.response;
  const todaySales = getDailySalesGross(response);
  const byCashierCount = (response?.byCashier ?? []).reduce(
    (sum, c) => sum + c.salesCount,
    0,
  );
  const todayTxCount = byCashierCount > 0 ? byCashierCount : (response?.salesCount ?? 0);

  useEffect(() => {
    if (
      !getCelebrationFiredToday() &&
      pos.targetSalesEnabled &&
      pos.targetSalesConfettiEnabled &&
      pos.targetSalesAmountPerDay > 0 &&
      todaySales >= pos.targetSalesAmountPerDay
    ) {
      setShowCelebration(true);
      setCelebrationFiredToday();
    }
  }, [todaySales, pos]);

  return (
    <Box style={{ minHeight: "100%", background: "var(--gray-2)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}>
      <Box pt="4">
        <AdminHero
          name={initials || "Admin"}
          role={role ?? "Admin"}
          systemName={systemName}
          operationalStatus={operationalStatus}
          maintenanceEnabled={maintenance.enabled}
        />
      </Box>

      <AdminSalesInsight />
      <AdminKpiRow />
      <AdminChartsRow />

      <Box
        pb="4"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fit, minmax(${isSmallMobile ? "280px" : "320px"}, 1fr))`,
          gap: 16,
        }}
      >
        <AdminRecentActivity />
        <AdminSystemHealth />
      </Box>
      
      <SalesCelebrationModal
        open={showCelebration}
        onClose={() => setShowCelebration(false)}
        targetAmount={pos.targetSalesAmountPerDay}
        currentAmount={todaySales}
        transactionCount={todayTxCount}
        currencyCode={currencyCode}
      />
    </Box>
  );
};