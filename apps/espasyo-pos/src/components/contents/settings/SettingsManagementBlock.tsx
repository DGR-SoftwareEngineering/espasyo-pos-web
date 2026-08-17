import React, { useMemo } from "react";
import {
  Badge,
  Box,
  Flex,
  Heading,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Card,
} from "@radix-ui/themes";;
import { TuneRounded } from "@mui/icons-material";
import {
  TabsContextProvider,
  TabsHeaderDesktop,
  TabsHeaderMobile,
  TabPanel,
  TabOption,
} from "core-lib/components/radix/tabs";
import { useResolution, useMpinStatus } from "core-lib/core/hooks";
import { usePublicSettings } from "core-lib/core/contexts";
import { OPERATIONAL_STATUS_META } from "core-lib/business/settings";
import { HeaderV2 } from "core-lib/components/radix/header/HeaderV2";
import { SystemSettingsTab } from "./tabs/SystemSettingsTab";
import { LocalizationSettingsTab } from "./tabs/LocalizationSettingsTab";
import { ContentBlocksTab } from "./tabs/ContentBlocksTab";
import { AuditLogTab } from "./tabs/AuditLogTab";
import { AccessControlTab } from "./tabs/AccessControlTab";
import { BackupRestoreTab } from "./tabs/BackupRestoreTab";

export const SettingsManagementBlock: React.FC = () => {
  const { isMobile } = useResolution();
  const { operationalStatus, maintenance, systemName, theme } =
    usePublicSettings();
  const { status: mpinStatus, ready: mpinReady } = useMpinStatus();

  const statusMeta = OPERATIONAL_STATUS_META[operationalStatus];
  const hasMpin = !!mpinStatus?.hasMpin;

  const tabs = useMemo<TabOption[]>(
    () => [
      {
        key: "settings_system",
        label: "System Settings",
        content: <SystemSettingsTab />,
      },
      {
        key: "settings_localization",
        label: "Localization",
        content: <LocalizationSettingsTab />,
      },
      {
        key: "settings_access",
        label: "Access Control",
        content: <AccessControlTab />,
      },
      {
        key: "settings_content",
        label: "Content Blocks",
        content: <ContentBlocksTab />,
      },
      {
        key: "settings_backup",
        label: "Backup & Restore",
        content: <BackupRestoreTab />,
      },
      {
        key: "settings_audit",
        label: "Audit Log",
        content: <AuditLogTab />,
      },
    ],
    [],
  );

  return (
    <Box style={{ width: "100%" }}>
      <Card variant="surface" size="3" mb="4">
        <HeaderV2
          title="Settings"
          subtitle="Runtime configuration, editable copy, and system audit trail."
          icon={<TuneRounded />}
        />

        <Flex
          align="center"
          justify="between"
          gap="3"
          mt="4"
          wrap="wrap"
          style={{
            padding: 12,
            borderRadius: "var(--radius-3)",
            border: "1px solid var(--gray-a4)",
            background: "var(--gray-a2)",
          }}
        >
          <Flex align="center" gap="3" wrap="wrap">
            <Box
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: `var(--${statusMeta.color}-9)`,
                boxShadow: `0 0 0 4px var(--${statusMeta.color}-a5)`,
              }}
            />
            <Box>
              <Text size="2" weight="bold">
                {statusMeta.label}
              </Text>
              <Text size="1" color="gray" as="div">
                Status: <strong>{operationalStatus}</strong> · Public name:{" "}
                <strong>{systemName}</strong>
              </Text>
            </Box>
          </Flex>
          <Flex gap="2" align="center" wrap="wrap">
            <Badge
              color={!mpinReady ? "gray" : hasMpin ? "green" : "amber"}
              variant="soft"
              radius="full"
              title={
                !mpinReady
                  ? "Checking your MPIN status…"
                  : hasMpin
                    ? "Destructive admin actions are unlocked."
                    : "Set an MPIN under Profile → MPIN Security to unlock Reset / Clear logs."
              }
            >
              {!mpinReady
                ? "Checking MPIN…"
                : hasMpin
                  ? "MPIN ready"
                  : "MPIN not set"}
            </Badge>
            {maintenance.enabled && (
              <Badge color="amber" variant="soft" radius="full">
                Maintenance ON
              </Badge>
            )}
            {maintenance.pages.length > 0 && (
              <Badge color="amber" variant="surface" radius="full">
                {maintenance.pages.length} page(s) gated
              </Badge>
            )}
            {theme.primaryColor && (
              <Flex align="center" gap="2">
                <Box
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: theme.primaryColor,
                    border: "1px solid var(--gray-a4)",
                  }}
                />
                <Text size="1" color="gray">
                  Primary {theme.primaryColor}
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Card>

      <TabsContextProvider>
        {isMobile ? (
          <TabsHeaderMobile id="settings_mobile" tabs={tabs} />
        ) : (
          <TabsHeaderDesktop id="settings_desktop" tabs={tabs} />
        )}
        {tabs.map((tab, index) => (
          <TabPanel
            index={index}
            id={`${tab.key}_tabpanel_${index}`}
            aria-labelledby={`${tab.key}_tab_${index}`}
            key={`${tab.key}_${index}`}
          >
            <Box pt="4">{tab.content}</Box>
          </TabPanel>
        ))}
      </TabsContextProvider>

      <Heading size="1" style={{ visibility: "hidden", height: 0 }}>
        Settings
      </Heading>
    </Box>
  );
};
