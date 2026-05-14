import {
  Box,
  Container,
  Flex,
  IconButton,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import { MagicWandIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { useAuthContext } from "core-lib";
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

const MotionIconButton = motion(IconButton);

const DashboardHome = () => {
  const { timeOfDay } = useGreeting();
  const { currentMessage, isVisible, nextMessage } = useMotivation();
  const { role, loading, initials } = useAuthContext();

  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: 240 }}>
        <Text color="gray">Loading…</Text>
      </Flex>
    );
  }

  return (
    <Box style={{ minHeight: "100%", background: "var(--gray-2)" }}>
      <Container size="4" px="4" py="4">
        <WelcomeHeader
          name={initials}
          role={role ?? "Staff"}
          timeOfDay={timeOfDay}
        />

        <MotivationMessage message={currentMessage} isVisible={isVisible} />
        <StatsGrid />

        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 24,
          }}
        >
          <QuickActions />
          <Achievements />
        </Box>

        <Tooltip content="New motivation">
          <MotionIconButton
            size="4"
            radius="full"
            variant="solid"
            color="indigo"
            onClick={nextMessage}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            style={{
              position: "fixed",
              bottom: 28,
              right: 28,
              boxShadow: "0 8px 24px var(--accent-a8)",
            }}
          >
            <MagicWandIcon />
          </MotionIconButton>
        </Tooltip>
      </Container>
    </Box>
  );
};

export default DashboardHome;
