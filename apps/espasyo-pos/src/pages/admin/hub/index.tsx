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
import { Card, useAuthContext } from "core-lib";
import { useEffect, useState } from "react";
import { EndpointRegistry } from "core-lib/api/commons/types";

const MotionFab = motion(Fab);

const DashboardHome = () => {
  const [state, setState] = useState<EndpointRegistry>();
  const { timeOfDay } = useGreeting();
  const { currentMessage, isVisible, nextMessage } = useMotivation();
  const { role, loading, initials } = useAuthContext();
  const endpointByKey = useApi((api) =>
    api.commons.findEndpointByKey("sales-2026"),
  );

  useEffect(() => {
    if (endpointByKey.result?.data) {
      setState(endpointByKey.result.data.response);
    }
  }, [endpointByKey.result]);

  if (loading || endpointByKey.loading)
    return <Container>Loading...</Container>;

  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "grey.50" }}>
      <Container maxWidth="xl">
        <WelcomeHeader
          name={initials}
          role={role ?? "Staff"}
          timeOfDay={timeOfDay}
        />

        <MotivationMessage message={currentMessage} isVisible={isVisible} />
        <StatsGrid />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { md: "1fr 1fr" },
            gap: 3,
          }}
        >
          <QuickActions />
          <Achievements />
        </Box>
        {/* Example usage @rendy... */}
        {/* <Card
          elevation={3}
          text="Monthly Sales"
          showChart={true}
          chartProps={{
            id: "sales-chart",
            chartKey: state?.keyUrl || "",
            sourceUrl: state?.sourceUrl || "",
            xAxisName: "Months",
            yAxisName: "Sales Amount",
            hideLegend: false,
            heightToWidthRatio: 0.6,
            customColors: ["#FF6B6B", "#4ECDC4", "#45B7D1"],
          }}
        /> */}
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
