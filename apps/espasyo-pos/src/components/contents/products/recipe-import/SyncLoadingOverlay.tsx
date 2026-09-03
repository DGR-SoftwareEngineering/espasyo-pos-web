import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Card,
  Spinner,
} from "@radix-ui/themes";;

const SYNC_MESSAGES = [
  "Syncing your data...",
  "Creating products...",
  "Building recipes...",
  "Linking ingredients...",
  "Almost there...",
  "Finalizing your import...",
  "Saving to the system...",
];

interface SyncLoadingOverlayProps {
  visible: boolean;
  progress?: { done: number; total: number } | null;
}

export const SyncLoadingOverlay: React.FC<SyncLoadingOverlayProps> = ({ visible, progress }) => {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    if (!visible) {
      setMsgIdx(0);
      return;
    }
    const id = setInterval(() => {
      setMsgIdx((i) => (i + 1) % SYNC_MESSAGES.length);
    }, 2000);
    return () => clearInterval(id);
  }, [visible]);

  if (!visible) return null;

  const pct = progress && progress.total > 0
    ? Math.round((progress.done / progress.total) * 100)
    : null;

  return (
    <Box
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <Card style={{ padding: "2.5rem", minWidth: 360, textAlign: "center" }}>
        <Flex direction="column" align="center" gap="4">
          <Spinner size="3" />
          <Heading size="4">Syncing...</Heading>
          <Text size="3" color="gray" style={{ minHeight: "1.5em" }}>
            {SYNC_MESSAGES[msgIdx]}
          </Text>

          {progress && progress.total > 0 && (
            <Flex direction="column" align="center" gap="2" style={{ width: "100%" }}>
              {/* Progress bar */}
              <Box
                style={{
                  width: "100%",
                  height: 8,
                  background: "var(--gray-a4)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <Box
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: "var(--green-9)",
                    borderRadius: 4,
                    transition: "width 0.4s ease",
                  }}
                />
              </Box>
              <Text size="2" color="gray">
                {progress.done} of {progress.total} products synced ({pct}%)
              </Text>
            </Flex>
          )}

          <Text size="1" color="gray">
            Please do not close this window
          </Text>
        </Flex>
      </Card>
    </Box>
  );
};
