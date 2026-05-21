import React, { useRef, useState, useEffect } from "react";
import { Box, Container } from "@radix-ui/themes";
import { useAuthContext } from "core-lib";
import { usePublicSettings } from "core-lib/core/contexts";
import { AdminHero } from "./AdminHero";
import { AdminKpiRow } from "./AdminKpiRow";
import { AdminChartsRow } from "./AdminChartsRow";
import { AdminRecentActivity } from "./AdminRecentActivity";
import { AdminSystemHealth } from "./AdminSystemHealth";
import { SalesCelebrationModal } from "./SalesCelebrationModal";
import { useApi } from "core-lib/core/hooks";

const CELEBRATION_FIRED_TODAY_KEY = "espasyo.targetSales.celebrationFiredToday";

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

export const AdminDashboard: React.FC = () => {
  const { role, initials } = useAuthContext();
  const { systemName, operationalStatus, maintenance, pos, currencyCode } = usePublicSettings();
  const [showCelebration, setShowCelebration] = useState(false);
  const dailySummary = useApi((api) => api.commons.salesDailySummary(), []);

  const todaySales = dailySummary.result?.data?.response?.totalAmount ?? 0;
  const todayTxCount = dailySummary.result?.data?.response?.salesCount ?? 0;

  useEffect(() => {
    if (
      !getCelebrationFiredToday() &&
      pos.targetSalesEnabled &&
      pos.targetSalesConfettiEnabled &&
      pos.targetSalesAmountPerDay > 0 &&
      todaySales >= pos.targetSalesAmountPerDay
    ) {
      setCelebrationFiredToday();
      setShowCelebration(true);
    }
  }, [todaySales, pos]);

  return (
    <Box style={{ minHeight: "100%", background: "var(--gray-2)" }}>
      <Container size="4" px="4" py="4">
        <AdminHero
          name={initials || "Admin"}
          role={role ?? "Admin"}
          systemName={systemName}
          operationalStatus={operationalStatus}
          maintenanceEnabled={maintenance.enabled}
        />
        <AdminKpiRow />
        <AdminChartsRow />
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          <AdminRecentActivity />
          <AdminSystemHealth />
        </Box>
      </Container>
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
