import React from "react";
import { Box, Container } from "@radix-ui/themes";
import { useAuthContext } from "core-lib";
import { usePublicSettings } from "core-lib/core/contexts";
import { AdminHero } from "./AdminHero";
import { AdminKpiRow } from "./AdminKpiRow";
import { AdminChartsRow } from "./AdminChartsRow";
import { AdminRecentActivity } from "./AdminRecentActivity";
import { AdminSystemHealth } from "./AdminSystemHealth";

export const AdminDashboard: React.FC = () => {
  const { role, initials } = useAuthContext();
  const { systemName, operationalStatus, maintenance } = usePublicSettings();

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
    </Box>
  );
};
