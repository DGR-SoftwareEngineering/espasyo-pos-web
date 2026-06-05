import React from "react";
import { Box, Callout, Flex, Text } from "@radix-ui/themes";
import { Build } from "@mui/icons-material";
import { usePublicSettings } from "../../core/contexts";

export const MaintenanceBanner: React.FC = () => {
  const { maintenance } = usePublicSettings();
  if (!maintenance.enabled) return null;

  return (
    <Box
      data-layout="maintenance-banner"
      style={{
        background: "var(--amber-a3)",
        borderBottom: "1px solid var(--amber-a6)",
        padding: "10px 16px",
      }}
    >
      <Flex align="center" gap="3" justify="center" wrap="wrap">
        <Build style={{ fontSize: 18, color: "var(--amber-11)" }} />
        <Text size="2" weight="bold" style={{ color: "var(--amber-11)" }}>
          Maintenance Mode
        </Text>
        <Text size="2" color="gray">
          {maintenance.message || "We are currently performing maintenance."}
        </Text>
      </Flex>
    </Box>
  );
};

export const MaintenancePageBlock: React.FC<{ pageKey: string }> = ({
  pageKey,
}) => {
  const { maintenance } = usePublicSettings();
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      style={{ minHeight: 360, padding: 24 }}
      gap="4"
    >
      <Box
        style={{
          width: 88,
          height: 88,
          borderRadius: "50%",
          background: "var(--amber-a3)",
          color: "var(--amber-11)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Build style={{ fontSize: 48 }} />
      </Box>
      <Text size="6" weight="bold" align="center">
        “{pageKey}” is in maintenance
      </Text>
      <Callout.Root
        color="amber"
        variant="surface"
        style={{ maxWidth: 480 }}
      >
        <Callout.Text>
          {maintenance.message ||
            "This page is temporarily unavailable while we make some improvements. Please check back soon."}
        </Callout.Text>
      </Callout.Root>
    </Flex>
  );
};
