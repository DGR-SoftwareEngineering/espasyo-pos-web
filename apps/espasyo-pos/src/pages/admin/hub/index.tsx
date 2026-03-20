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

const MotionFab = motion(Fab);

const DashboardHome = () => {
  const { timeOfDay } = useGreeting();
  const { currentMessage, isVisible, nextMessage } = useMotivation();
  const { result, loading } = useApi((api) => api.commons.getUserById());
  const roleID = result?.data?.response?.roleID;
  const roleCb = useApi(
    async (api) => {
      if (!roleID) return null;
      return await api.commons.getRoleById(roleID);
    },
    [roleID],
  );

  const userData = result?.data?.response?.userInfo;
  const role = roleCb.result?.data?.response?.roleName;

  if (loading || roleCb.loading) return <Container>Loading...</Container>;

  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "grey.50" }}>
      <Container maxWidth="xl">
        <WelcomeHeader
          name={userData?.firstName || "Cashier"}
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
