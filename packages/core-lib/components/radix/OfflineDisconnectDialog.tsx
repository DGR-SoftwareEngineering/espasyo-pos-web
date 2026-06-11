import React from "react";
import { Dialog, Flex, Text, Button } from "@radix-ui/themes";
import { useOfflineMode } from "../../core/contexts/OfflineModeContext";

export const OfflineDisconnectDialog: React.FC = () => {
  const { disconnectDialogOpen, closeDisconnectDialog } = useOfflineMode();

  return (
    <Dialog.Root open={disconnectDialogOpen} onOpenChange={closeDisconnectDialog}>
      <Dialog.Content maxWidth="440px">
        <Dialog.Title>You're Now Working Offline</Dialog.Title>
        <Flex direction="column" gap="2" mt="2">
          <Text size="2">
            Your internet connection was lost. The POS will continue to work:
          </Text>
          <Flex direction="column" gap="1" pl="3">
            <Text size="2">• Sales are saved locally and queued for sync</Text>
            <Text size="2">• Recent orders remain viewable</Text>
            <Text size="2">• <strong>End Shift</strong> is disabled until reconnected</Text>
            <Text size="2">• <strong>Logout</strong> is disabled until all sales are synced</Text>
          </Flex>
          <Text size="2" color="gray" mt="1">
            Once your internet returns, use the <strong>Sync Now</strong> button
            in the indicator bar to upload queued sales.
          </Text>
        </Flex>
        <Flex justify="end" mt="4">
          <Button onClick={closeDisconnectDialog}>Got It</Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
