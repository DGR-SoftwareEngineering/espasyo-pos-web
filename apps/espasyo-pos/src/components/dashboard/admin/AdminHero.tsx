import React from "react";
import { Avatar, Badge, Box, Flex, Heading, Text } from "@radix-ui/themes";
import {
  PersonIcon,
  LightningBoltIcon,
  ActivityLogIcon,
} from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { OperationalStatus, OPERATIONAL_STATUSES } from "core-lib/business/settings";

interface Props {
  name: string;
  role: string;
  systemName: string;
  operationalStatus: OperationalStatus;
  maintenanceEnabled: boolean;
}

const STATUS_LABEL: Record<OperationalStatus, { label: string; color: "green" | "amber" | "red" | "gray" }> = {
  [OPERATIONAL_STATUSES.Operational]: { label: "All systems operational", color: "green" },
  [OPERATIONAL_STATUSES.Degraded]: { label: "Degraded performance", color: "amber" },
  [OPERATIONAL_STATUSES.Outage]: { label: "Outage", color: "red" },
  [OPERATIONAL_STATUSES.Maintenance]: { label: "Maintenance window", color: "amber" },
};

export const AdminHero: React.FC<Props> = ({
  name,
  role,
  systemName,
  operationalStatus,
  maintenanceEnabled,
}) => {
  const status =
    STATUS_LABEL[operationalStatus] ?? STATUS_LABEL[OPERATIONAL_STATUSES.Operational];
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Box
        p="5"
        style={{
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
          borderRadius: "var(--radius-4)",
          background:
            "linear-gradient(120deg, var(--accent-11) 0%, var(--accent-9) 55%, var(--accent-8) 100%)",
          color: "var(--accent-contrast)",
          border: "1px solid var(--accent-a6)",
          boxShadow: "var(--shadow-3)",
        }}
      >
        <Box
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18) 0, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.10) 0, transparent 35%)",
            pointerEvents: "none",
          }}
        />
        <Flex
          justify="between"
          align={{ initial: "start", sm: "center" }}
          gap="4"
          wrap="wrap"
          style={{ position: "relative" }}
        >
          <Flex align="center" gap="4">
            <Avatar
              size="5"
              radius="full"
              fallback={<PersonIcon width="22" height="22" />}
              style={{
                background: "rgba(255,255,255,0.18)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.35)",
              }}
            />
            <Box>
              <Flex align="center" gap="2" mb="1">
                <Badge color="amber" variant="solid" radius="full">
                  <LightningBoltIcon /> {role}
                </Badge>
                <Text size="2" style={{ color: "inherit", opacity: 0.85 }}>
                  {systemName}
                </Text>
              </Flex>
              <Heading size="7" weight="bold" style={{ color: "inherit" }}>
                Welcome back, {name}
              </Heading>
              <Text size="2" style={{ color: "inherit", opacity: 0.85 }}>
                {today}
              </Text>
            </Box>
          </Flex>

          <Flex direction="column" align="end" gap="2">
            <Badge color={status.color} variant="solid" radius="full" size="2">
              <ActivityLogIcon /> {status.label}
            </Badge>
            {maintenanceEnabled && (
              <Badge color="amber" variant="soft" radius="full">
                Maintenance mode enabled
              </Badge>
            )}
          </Flex>
        </Flex>
      </Box>
    </motion.div>
  );
};
