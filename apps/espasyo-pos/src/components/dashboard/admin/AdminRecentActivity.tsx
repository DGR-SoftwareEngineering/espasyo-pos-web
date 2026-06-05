import React, { useMemo } from "react";
import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  ScrollArea,
  Skeleton,
  Text,
} from "@radix-ui/themes";
import { ActivityLogIcon, ClockIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { useApi } from "core-lib/core/hooks";
import { AuditLogDto } from "core-lib/api/commons/types";

const RELATIVE = (iso: string): string => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diffMs = Date.now() - then;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const ACTION_COLOR = (action: string | null): "green" | "amber" | "red" | "indigo" | "gray" => {
  if (!action) return "gray";
  const a = action.toLowerCase();
  if (a.includes("create") || a.includes("add")) return "green";
  if (a.includes("update") || a.includes("modify") || a.includes("change")) return "indigo";
  if (a.includes("delete") || a.includes("remove")) return "red";
  if (a.includes("login") || a.includes("logout")) return "amber";
  return "gray";
};

const Row: React.FC<{ entry: AuditLogDto }> = ({ entry }) => (
  <Flex
    align="start"
    gap="3"
    py="2"
    style={{ borderBottom: "1px solid var(--gray-a3)" }}
  >
    <Box
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        marginTop: 8,
        background: `var(--${ACTION_COLOR(entry.action)}-9)`,
        flexShrink: 0,
      }}
    />
    <Box style={{ flex: 1, minWidth: 0 }}>
      <Flex align="center" gap="2" wrap="wrap">
        <Badge color={ACTION_COLOR(entry.action)} variant="soft" radius="full">
          {entry.action ?? entry.eventType}
        </Badge>
        {entry.entityName && (
          <Text size="2" weight="medium">
            {entry.entityName}
          </Text>
        )}
      </Flex>
      {entry.message && (
        <Text
          size="1"
          color="gray"
          as="div"
          mt="1"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {entry.message}
        </Text>
      )}
    </Box>
    <Flex align="center" gap="1" style={{ flexShrink: 0 }}>
      <ClockIcon style={{ color: "var(--gray-10)" }} />
      <Text size="1" color="gray">
        {RELATIVE(entry.createdAt)}
      </Text>
    </Flex>
  </Flex>
);

export const AdminRecentActivity: React.FC = () => {
  const cb = useApi((api) =>
    api.commons.auditLogList({ pageNumber: 1, pageSize: 8 }),
  );

  const entries = useMemo<AuditLogDto[]>(
    () => cb.result?.data?.response?.items ?? [],
    [cb.result],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{ minWidth: 0, height: "100%" }}
    >
      <Card size="3" variant="surface" style={{ height: "100%" }}>
        <Flex justify="between" align="center" mb="3">
          <Flex align="center" gap="2">
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
              <ActivityLogIcon />
            </Box>
            <Box>
              <Heading size="3" weight="medium">
                Recent activity
              </Heading>
              <Text size="1" color="gray">
                Last 8 audit entries
              </Text>
            </Box>
          </Flex>
        </Flex>
        <ScrollArea style={{ height: 320 }}>
          <Box pr="3">
            {cb.loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Box key={i} py="2">
                  <Skeleton width="100%" height="44px" />
                </Box>
              ))
            ) : entries.length === 0 ? (
              <Text size="2" color="gray">
                No activity yet.
              </Text>
            ) : (
              entries.map((entry) => <Row key={entry.auditLogID} entry={entry} />)
            )}
          </Box>
        </ScrollArea>
      </Card>
    </motion.div>
  );
};
