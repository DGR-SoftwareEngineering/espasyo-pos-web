import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Card,
} from "@radix-ui/themes";;
import { BackupTableOutlined } from "@mui/icons-material";
import { BackupExportPanel } from "./backup/BackupExportPanel";
import { BackupImportPanel } from "./backup/BackupImportPanel";
import { BackupHistoryPanel } from "./backup/BackupHistoryPanel";

export const BackupRestoreTab: React.FC = () => {
  const [refreshToken, setRefreshToken] = useState(0);
  const bumpHistory = () => setRefreshToken((n) => n + 1);

  return (
    <Flex direction="column" gap="4">
      <Card variant="surface" size="2">
        <Flex align="center" gap="3" wrap="wrap">
          <Box
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--radius-3)",
              background: "var(--teal-a3)",
              color: "var(--teal-11)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <BackupTableOutlined fontSize="medium" />
          </Box>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Heading size="4">Backup &amp; Restore</Heading>
            <Text size="2" color="gray">
              Snapshot the entire operational database to an Excel workbook —
              settings, products, recipes, inventory, users, suppliers, roles,
              menu items, and more — then restore from any past export.
            </Text>
          </Box>
        </Flex>
      </Card>

      <BackupExportPanel onExported={bumpHistory} />
      <BackupImportPanel onImported={bumpHistory} />
      <BackupHistoryPanel refreshToken={refreshToken} />
    </Flex>
  );
};
