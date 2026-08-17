import React from "react";
import {
  Badge,
  Box,
  Flex,
  Heading,
  Separator,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Card,
  Skeleton,
} from "@radix-ui/themes";;
import {
  GearIcon,
  LockClosedIcon,
  TimerIcon,
  UploadIcon,
} from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { useApi } from "core-lib/core/hooks";
import { usePublicSettings } from "core-lib/core/contexts";

const BYTES = (size: number | null): string => {
  if (!size || size <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(size) / Math.log(1024)),
  );
  return `${(size / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

const TIME_AGO = (iso: string | null): string => {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

interface RowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
}

const HealthRow: React.FC<RowProps> = ({ icon, label, value, hint }) => (
  <Flex align="center" gap="3" py="3">
    <Box
      style={{
        width: 32,
        height: 32,
        borderRadius: "var(--radius-2)",
        background: "var(--gray-a3)",
        color: "var(--gray-11)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box style={{ flex: 1, minWidth: 0 }}>
      <Text size="2" weight="medium" as="div">
        {label}
      </Text>
      {hint && (
        <Text size="1" color="gray" as="div">
          {hint}
        </Text>
      )}
    </Box>
    <Box style={{ flexShrink: 0 }}>{value}</Box>
  </Flex>
);

export const AdminSystemHealth: React.FC = () => {
  const { ready, maintenance, security, features } = usePublicSettings();
  const backupCb = useApi((api) => api.commons.backupHistory(1, 1));

  const latestBackup = backupCb.result?.data?.response?.items?.[0] ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
      style={{ minWidth: 0, height: "100%" }}
    >
      <Card size="3" variant="surface" style={{ height: "100%" }}>
        <Flex align="center" gap="2" mb="3">
          <Box
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-3)",
              background: "var(--accent-a3)",
              color: "var(--accent-11)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GearIcon />
          </Box>
          <Box>
            <Heading size="3" weight="medium">
              System health
            </Heading>
            <Text size="1" color="gray">
              Live from public settings + backup history
            </Text>
          </Box>
        </Flex>

        <HealthRow
          icon={<LockClosedIcon />}
          label="Maintenance mode"
          hint={
            maintenance.pages.length
              ? `${maintenance.pages.length} page${maintenance.pages.length === 1 ? "" : "s"} affected`
              : "No pages flagged"
          }
          value={
            !ready ? (
              <Skeleton width="64px" height="20px" />
            ) : maintenance.enabled ? (
              <Badge color="amber" variant="solid" radius="full">
                Enabled
              </Badge>
            ) : (
              <Badge color="green" variant="soft" radius="full">
                Off
              </Badge>
            )
          }
        />
        <Separator size="4" />
        <HealthRow
          icon={<TimerIcon />}
          label="Session timeout"
          hint="Minutes of inactivity before logout"
          value={
            <Text size="2" weight="medium">
              {security.sessionTimeoutMinutes}m
            </Text>
          }
        />
        <Separator size="4" />
        <HealthRow
          icon={<TimerIcon />}
          label="Max login attempts"
          hint="Before rate-limit kicks in"
          value={
            <Text size="2" weight="medium">
              {security.maxLoginAttempts}
            </Text>
          }
        />
        <Separator size="4" />
        <HealthRow
          icon={<UploadIcon />}
          label="Latest backup"
          hint={
            latestBackup
              ? `${latestBackup.operation}${latestBackup.mode ? ` · ${latestBackup.mode}` : ""} · ${BYTES(latestBackup.fileSizeBytes ?? null)}`
              : "No backup recorded"
          }
          value={
            backupCb.loading ? (
              <Skeleton width="64px" height="20px" />
            ) : latestBackup ? (
              <Badge
                color={latestBackup.status === "Success" ? "green" : "red"}
                variant="soft"
                radius="full"
              >
                {TIME_AGO(latestBackup.performedAt)}
              </Badge>
            ) : (
              <Badge color="gray" variant="soft" radius="full">
                —
              </Badge>
            )
          }
        />
        <Separator size="4" />
        <HealthRow
          icon={<GearIcon />}
          label="Loyalty + notifications"
          hint="Feature flags"
          value={
            <Flex gap="2">
              <Badge
                color={features.loyaltyEnabled ? "green" : "gray"}
                variant="soft"
                radius="full"
              >
                Loyalty {features.loyaltyEnabled ? "on" : "off"}
              </Badge>
              <Badge
                color={features.notificationsEnabled ? "green" : "gray"}
                variant="soft"
                radius="full"
              >
                Notif {features.notificationsEnabled ? "on" : "off"}
              </Badge>
            </Flex>
          }
        />
      </Card>
    </motion.div>
  );
};
