import { Box, Container, Fab, Tooltip } from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import { useApi } from "core-lib/core/hooks";
import {
  useGreeting,
  useMotivation,
} from "../../../components/dashboard/hooks";

import {
  WelcomeHeader,
  MotivationMessage,
  StatsGrid,
  QuickActions,
  Achievements,
} from "../../../components/dashboard/components";

import { motion } from "framer-motion";
import { RevenueOverview } from "../../../components/dashboard/components/RevenueOverview";
import { Card, useAuthContext } from "core-lib";
import { useEffect, useState } from "react";
import { EndpointRegistry } from "core-lib/api/commons/types";

const MotionFab = motion(Fab);

const DashboardHome = () => {
  const { timeOfDay } = useGreeting();
  const { currentMessage, isVisible, nextMessage } = useMotivation();

  // TL AUTH SYSTEM (preferred)
  const { role, loading, initials } = useAuthContext();

  // fallback API (your original logic preserved)
  const { result, loading: userLoading } = useApi((api) =>
    api.commons.getUserById(),
  );

  const roleID = result?.data?.response?.roleID;

  const roleCb = useApi(
    async (api) => {
      if (!roleID) return null;
      return await api.commons.getRoleById(roleID);
    },
    [roleID],
  );

  const userData = result?.data?.response?.userInfo;
  const apiRole = roleCb.result?.data?.response?.roleName;

  // TL dynamic endpoint (future chart source)
  const [state, setState] = useState<EndpointRegistry>();
  const endpointByKey = useApi((api) =>
    api.commons.findEndpointByKey("sales-2026"),
  );

  useEffect(() => {
    if (endpointByKey.result?.data) {
      setState(endpointByKey.result.data.response);
    }
  }, [endpointByKey.result]);

  const loadingState =
    loading || userLoading || roleCb.loading || endpointByKey.loading;

  if (loadingState) return <Container>Loading...</Container>;

  const transformChartData = (mockData: any) => {
    const categories = mockData.datasets[0].data.map((d: any) => d.label);

    const series = mockData.datasets.map((dataset: any) => ({
      name: dataset.name,
      data: dataset.data.map((d: any) => Number(d.value)),
    }));

    return { categories, series };
  };

  const mockChartData = {
    chartKey: "sales-2026",
    chartType: "Area",
    chart: {
      numberPrefix: "₱",
      numberSuffix: "K",
    },
    datasets: [
      {
        name: "Product A",
        data: [
          { label: "Q1", value: "50" },
          { label: "Q2", value: "75" },
          { label: "Q3", value: "62" },
          { label: "Q4", value: "89" },
        ],
      },
      {
        name: "Product B",
        data: [
          { label: "Q1", value: "30" },
          { label: "Q2", value: "45" },
          { label: "Q3", value: "58" },
          { label: "Q4", value: "72" },
        ],
      },
      {
        name: "Product C",
        data: [
          { label: "Q1", value: "20" },
          { label: "Q2", value: "35" },
          { label: "Q3", value: "48" },
          { label: "Q4", value: "61" },
        ],
      },
    ],
  };

  const { categories, series } = transformChartData(mockChartData);

  const displayName = initials || userData?.firstName || "Cashier";

  const displayRole = role ?? apiRole ?? "Staff";

  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "grey.50" }}>
      <Container maxWidth="xl">
        <WelcomeHeader
          name={displayName}
          role={displayRole}
          timeOfDay={timeOfDay}
        />

        <MotivationMessage message={currentMessage} isVisible={isVisible} />

        <StatsGrid />

        <Card
          elevation={3}
          text="Monthly Sales"
          chartProps={{
            id: "sales-chart",
            categories,
            datasets: series,
            xAxisName: "Months",
            yAxisName: "Sales",
            customColors: ["#64b5f6", "#81c784", "#4dd0e1"],
          }}
        />
        <br />
        <RevenueOverview />

        <br />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1.5fr 1fr",
            },
            gap: 3,
            alignItems: "stretch",
          }}
        >
          <Box sx={{ height: "100%" }}>
            <QuickActions />
          </Box>

          <Box sx={{ height: "100%" }}>
            <Achievements />
          </Box>
        </Box>

        <Tooltip title="New motivation">
          <MotionFab
            color="primary"
            onClick={nextMessage}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            sx={{ position: "fixed", bottom: 24, right: 24 }}
          >
            <AutoAwesome />
          </MotionFab>
        </Tooltip>
      </Container>
    </Box>
  );
};

export default DashboardHome;
