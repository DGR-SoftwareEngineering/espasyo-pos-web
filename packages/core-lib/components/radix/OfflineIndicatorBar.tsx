import React from "react";
import { Flex, Text, Button } from "@radix-ui/themes";
import { useOfflineMode } from "../../core/contexts/OfflineModeContext";

export const OfflineIndicatorBar: React.FC = () => {
  const { isOnline, pendingSalesCount, isSyncing, openSyncDialog } =
    useOfflineMode();

  if (isOnline && pendingSalesCount === 0) return null;

  const canSync = isOnline && pendingSalesCount > 0 && !isSyncing;

  return (
    <Flex
      align="center"
      justify="between"
      px="4"
      py="1"
      style={{
        background: isOnline ? "var(--amber-9)" : "var(--red-9)",
        color: "white",
        fontSize: 13,
        flexShrink: 0,
      }}
    >
      <Text size="2" weight="medium" style={{ color: "white" }}>
        {isOnline
          ? `Back online — ${pendingSalesCount} sale(s) pending sync`
          : `Working offline — ${pendingSalesCount} sale(s) queued`}
      </Text>
      <Button
        size="1"
        variant="solid"
        color="gray"
        highContrast
        disabled={!canSync}
        onClick={openSyncDialog}
        style={{ cursor: canSync ? "pointer" : "not-allowed" }}
      >
        {isSyncing ? "Syncing…" : "Sync Now"}
      </Button>
    </Flex>
  );
};
