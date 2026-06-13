import React, { useState, useEffect } from "react";
import { Box, Card, Flex, Heading, Text, Spinner } from "@radix-ui/themes";

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
}

export const SyncLoadingOverlay: React.FC<SyncLoadingOverlayProps> = ({ visible }) => {
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
      <Card style={{ padding: "2.5rem", minWidth: 340, textAlign: "center" }}>
        <Flex direction="column" align="center" gap="4">
          <Spinner size="3" />
          <Heading size="4">Syncing...</Heading>
          <Text size="3" color="gray" style={{ minHeight: "1.5em" }}>
            {SYNC_MESSAGES[msgIdx]}
          </Text>
          <Text size="1" color="gray">
            Please do not close this window
          </Text>
        </Flex>
      </Card>
    </Box>
  );
};
