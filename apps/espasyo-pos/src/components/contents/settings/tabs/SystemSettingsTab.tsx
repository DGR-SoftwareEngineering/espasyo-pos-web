import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Flex,
  Heading,
  IconButton,
  Separator,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Callout,
  Card,
  Tabs,
  Tooltip,
} from "@radix-ui/themes";;
import {
  CheckCircleOutlined,
  Restore,
  RestartAltOutlined,
  SettingsOutlined,
  PaletteOutlined,
  PointOfSaleOutlined,
  Inventory2Outlined,
  ShieldOutlined,
  ToggleOnOutlined,
  AutorenewOutlined,
  LocalOfferOutlined,
  PointOfSaleRounded,
  LinkOutlined,
  PlayCircleOutlined,
  CardMembershipOutlined,
  SmartToyOutlined,
} from "@mui/icons-material";
import { useApi, useApiCallback, useMpinStatus, useCashDrawer } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import { usePublicSettings } from "core-lib/core/contexts";
import {
  BulkUpdateSystemSettingParams,
  SystemSettingDto,
} from "core-lib/api/commons/types";
import { AdminConfirmationParams } from "core-lib/api/authentication/types";
import {
  IMAGE_SETTING_KEYS,
  SETTING_CATEGORIES,
  SETTING_KEYS,
} from "core-lib/business/settings";
import { Button } from "core-lib/components/radix/buttons/Button";
import { MessageBlock } from "core-lib/components/radix/blocks/messages";
import { MessageType } from "core-lib/components/topAlertMessages/types";
import { AdminConfirmDialog } from "core-lib/components/radix/security";
import { SettingValueEditor } from "../editors/SettingValueEditor";
import { ImageSettingEditor } from "../editors/ImageSettingEditor";

const HIDDEN_AI_KEYS = new Set<string>([
  SETTING_KEYS.AiTimeoutSeconds,
  SETTING_KEYS.AiMaxTokens,
  SETTING_KEYS.AiProvider,
]);

const CATEGORY_ORDER: string[] = [
  SETTING_CATEGORIES.System,
  SETTING_CATEGORIES.Theme,
  SETTING_CATEGORIES.Loader,
  SETTING_CATEGORIES.POS,
  SETTING_CATEGORIES.Promo,
  SETTING_CATEGORIES.Inventory,
  SETTING_CATEGORIES.Security,
  SETTING_CATEGORIES.Features,
  SETTING_CATEGORIES.Crm,
  SETTING_CATEGORIES.Ai,
];

const CATEGORY_META: Record<
  string,
  { label: string; icon: React.ReactNode; description: string }
> = {
  System: {
    label: "System",
    icon: <SettingsOutlined fontSize="small" />,
    description:
      "Maintenance, operational status, and the public system name.",
  },
  Theme: {
    label: "Theme",
    icon: <PaletteOutlined fontSize="small" />,
    description: "Brand colors, logo, and favicon used across the app.",
  },
  Loader: {
    label: "Loader",
    icon: <AutorenewOutlined fontSize="small" />,
    description:
      "Choose a loader style, customize messages, and tune the animation speed shown on boot and during page transitions.",
  },
  POS: {
    label: "POS",
    icon: <PointOfSaleOutlined fontSize="small" />,
    description:
      "Point-of-sale rules: refunds, discounts, tax, receipt headers.",
  },
  Inventory: {
    label: "Inventory",
    icon: <Inventory2Outlined fontSize="small" />,
    description:
      "Stock alert thresholds and automatic deduction behavior.",
  },
  Security: {
    label: "Security",
    icon: <ShieldOutlined fontSize="small" />,
    description:
      "Session timeout, password rules, MFA enforcement.",
  },
  Features: {
    label: "Features",
    icon: <ToggleOnOutlined fontSize="small" />,
    description: "Feature flags for opt-in modules.",
  },
  Promo: {
    label: "Promo",
    icon: <LocalOfferOutlined fontSize="small" />,
    description:
      "Promotional pricing rules: auto-apply toggle, POS badge display, and viability thresholds.",
  },
  CRM: {
    label: "CRM",
    icon: <CardMembershipOutlined fontSize="small" />,
    description:
      "Loyalty program configuration, including stamp requirements for free drink rewards.",
  },
  AI: {
    label: "AI",
    icon: <SmartToyOutlined fontSize="small" />,
    description:
      "Configure the AI provider, API key, and model. Enable or disable AI-powered features per module.",
  },
};

const humanizeKey = (key: string): string => {
  const tail = key.includes(".") ? key.split(".").slice(1).join(" ") : key;
  return tail
    .replace(/([A-Z])/g, " $1")
    .replace(/\s+/g, " ")
    .trim();
};

export const SystemSettingsTab: React.FC = () => {
  const { showToast } = useToastContext();
  const publicSettings = usePublicSettings();
  const mpinStatus = useMpinStatus();
  const data = useApi((api) => api.commons.settingsList());
  const bulkCb = useApiCallback(
    async (api, args: BulkUpdateSystemSettingParams) =>
      await api.commons.bulkUpdateSettings(args),
  );
  const resetCb = useApiCallback(
    async (api, args: AdminConfirmationParams) =>
      await api.commons.resetAllSettings(args),
  );

  const [settings, setSettings] = useState<SystemSettingDto[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState<string>(
    SETTING_CATEGORIES.System,
  );
  const [resetOpen, setResetOpen] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const hasMpin = mpinStatus.ready && !!mpinStatus.status?.hasMpin;

  const handleResetConfirm = async ({
    password,
    mpin,
  }: AdminConfirmationParams) => {
    setResetError(null);
    try {
      const result = await resetCb.execute({ password, mpin });
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success
      ) {
        const rows = result.data.response ?? 0;
        showToast(
          rows > 0
            ? `Reset ${rows} setting(s) to defaults`
            : "Settings reset to defaults",
          "success",
        );
        setResetOpen(false);
        data.execute();
        publicSettings.refresh();
        return;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to reset settings";
      setResetError(message);
    } catch (error) {
      console.error("Error resetting settings:", error);
      const status = (error as string[] & { status?: number }).status;
      if (status === 401) {
        setResetError("Password or MPIN is incorrect. Try again.");
        return;
      }
      const first =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to reset settings";
      setResetError(first);
    }
  };

  useEffect(() => {
    const list = data.result?.data.response ?? [];
    setSettings(list);
    setDrafts({});
  }, [data.result?.data.response]);

  const byCategory = useMemo(() => {
    const map = new Map<string, SystemSettingDto[]>();
    for (const c of CATEGORY_ORDER) map.set(c, []);
    for (const s of settings) {
      if (HIDDEN_AI_KEYS.has(s.key)) continue;
      const list = map.get(s.category) ?? [];
      list.push(s);
      map.set(s.category, list);
    }
    for (const [c, list] of map.entries()) {
      list.sort((a, b) => a.displayOrder - b.displayOrder);
      map.set(c, list);
    }
    return map;
  }, [settings]);

  const dirtyCount = Object.keys(drafts).length;

  const handleDraftChange = (s: SystemSettingDto, next: string) => {
    setDrafts((prev) => {
      const updated = { ...prev };
      // Secret fields: treat blank as "no change" (keep existing key)
      const isNoChange = s.dataType === 99 ? next === "" : next === s.value;
      if (isNoChange) {
        delete updated[s.systemSettingID];
      } else {
        updated[s.systemSettingID] = next;
      }
      return updated;
    });
  };

  const handleReset = () => setDrafts({});

  const handleImageUploaded = (updated: SystemSettingDto) => {
    setSettings((prev) =>
      prev.map((s) =>
        s.systemSettingID === updated.systemSettingID ? updated : s,
      ),
    );
    publicSettings.refresh();
  };

  const handleSave = async () => {
    if (dirtyCount === 0) {
      showToast("No changes to save", "info");
      return;
    }
    try {
      const payload: BulkUpdateSystemSettingParams = {
        settings: Object.entries(drafts).map(([id, value]) => ({
          systemSettingID: id,
          value,
        })),
      };
      const result = await bulkCb.execute(payload);
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success
      ) {
        showToast(`${dirtyCount} setting(s) saved`, "success");
        setDrafts({});
        data.execute();
        publicSettings.refresh();
        return;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to save settings";
      showToast(message, "error");
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast("Failed to save settings", "error");
    }
  };

  if (data.loading && settings.length === 0) {
    return (
      <Flex align="center" justify="center" py="9">
        <Text color="gray">Loading settings…</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="4">
      <Card variant="surface" size="2">
        <Flex
          align={{ initial: "stretch", md: "center" }}
          justify="between"
          gap="3"
          direction={{ initial: "column", md: "row" }}
        >
          <Box>
            <Heading size="4">System Settings</Heading>
            <Text size="2" color="gray">
              Tweak runtime behavior, theme, and rules. Changes are saved in
              bulk and apply immediately after save.
            </Text>
          </Box>
          <Flex align="center" gap="2" wrap="wrap">
            {dirtyCount > 0 && (
              <Badge color="amber" variant="soft" radius="full">
                {dirtyCount} unsaved
              </Badge>
            )}
            <Button
              type="Secondary"
              onClick={handleReset}
              disabled={dirtyCount === 0 || bulkCb.loading}
            >
              <Flex align="center" gap="2">
                <Restore fontSize="small" />
                Discard
              </Flex>
            </Button>
            <Button
              type="Primary"
              onClick={handleSave}
              disabled={dirtyCount === 0 || bulkCb.loading}
              loading={bulkCb.loading}
            >
              <Flex align="center" gap="2">
                <CheckCircleOutlined fontSize="small" />
                Save changes
              </Flex>
            </Button>
            <Separator orientation="vertical" size="2" />
            <Tooltip
              content={
                !hasMpin
                  ? "Set up an MPIN under Profile → MPIN Security to enable this action."
                  : "Reset all settings to their seeded defaults."
              }
            >
              <Box>
                <IconButton
                  color="red"
                  variant="soft"
                  size="2"
                  disabled={!hasMpin || resetCb.loading}
                  onClick={() => {
                    setResetError(null);
                    setResetOpen(true);
                  }}
                  aria-label="Reset all settings to defaults"
                >
                  <RestartAltOutlined fontSize="small" />
                </IconButton>
              </Box>
            </Tooltip>
          </Flex>
        </Flex>
      </Card>

      <AdminConfirmDialog
        open={resetOpen}
        onOpenChange={(open) => {
          setResetOpen(open);
          if (!open) setResetError(null);
        }}
        title="Reset all settings?"
        description="This rewrites every system setting to its seeded default. Theme, maintenance, security thresholds, feature flags — everything."
        warning="There is no undo. Existing audit log rows are preserved, but every value above will be replaced."
        confirmLabel="Reset to defaults"
        confirmColor="Critical"
        loading={resetCb.loading}
        errorMessage={resetError}
        onConfirm={handleResetConfirm}
      />

      <Tabs.Root
        value={activeCategory}
        onValueChange={(v) => setActiveCategory(v)}
      >
        <Tabs.List>
          {CATEGORY_ORDER.map((c) => {
            const dirtyInCategory =
              byCategory
                .get(c)
                ?.filter((s) => drafts[s.systemSettingID] !== undefined)
                .length ?? 0;
            return (
              <Tabs.Trigger key={c} value={c}>
                <Flex align="center" gap="2">
                  {CATEGORY_META[c]?.icon}
                  {CATEGORY_META[c]?.label ?? c}
                  {dirtyInCategory > 0 && (
                    <Badge
                      color="amber"
                      variant="solid"
                      radius="full"
                      size="1"
                    >
                      {dirtyInCategory}
                    </Badge>
                  )}
                </Flex>
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>

        {CATEGORY_ORDER.map((c) => (
          <Tabs.Content key={c} value={c}>
            <CategorySection
              category={c}
              settings={byCategory.get(c) ?? []}
              drafts={drafts}
              onChange={handleDraftChange}
              onImageUploaded={handleImageUploaded}
            />
          </Tabs.Content>
        ))}
      </Tabs.Root>

      <CashDrawerSection />
    </Flex>
  );
};

interface CategorySectionProps {
  category: string;
  settings: SystemSettingDto[];
  drafts: Record<string, string>;
  onChange: (setting: SystemSettingDto, next: string) => void;
  onImageUploaded: (updated: SystemSettingDto) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  settings,
  drafts,
  onChange,
  onImageUploaded,
}) => {
  const meta = CATEGORY_META[category];

  if (settings.length === 0) {
    return (
      <Box mt="3">
        <MessageBlock
          type={MessageType.Info}
          header={`No ${category} settings`}
          text="The backend has not seeded any settings for this category yet."
        />
      </Box>
    );
  }

  return (
    <Box mt="3">
      <Card variant="surface" size="3">
        <Flex align="center" gap="2" mb="3">
          <Box style={{ color: "var(--accent-11)" }}>{meta?.icon}</Box>
          <Heading size="4">{meta?.label ?? category}</Heading>
        </Flex>
        {meta?.description && (
          <Text size="2" color="gray">
            {meta.description}
          </Text>
        )}

        <Box mt="4">
          <Flex direction="column" gap="0">
            {settings.map((s, idx) => (
              <React.Fragment key={s.systemSettingID}>
                {idx > 0 && <Separator size="4" my="3" />}
                <SettingRow
                  setting={s}
                  draftValue={drafts[s.systemSettingID]}
                  onChange={onChange}
                  onImageUploaded={onImageUploaded}
                />
              </React.Fragment>
            ))}
          </Flex>
        </Box>
      </Card>
    </Box>
  );
};

interface SettingRowProps {
  setting: SystemSettingDto;
  draftValue?: string;
  onChange: (setting: SystemSettingDto, next: string) => void;
  onImageUploaded: (updated: SystemSettingDto) => void;
}

const SettingRow: React.FC<SettingRowProps> = ({
  setting,
  draftValue,
  onChange,
  onImageUploaded,
}) => {
  const isImage = IMAGE_SETTING_KEYS.includes(setting.key);
  const value = draftValue ?? setting.value ?? "";
  const isDirty = draftValue !== undefined;

  return (
    <Flex
      direction={{ initial: "column", md: "row" }}
      align={{ initial: "stretch", md: "start" }}
      gap="4"
      style={{ width: "100%" }}
    >
      <Box style={{ flex: "0 0 320px" }}>
        <Flex align="center" gap="2">
          <Text size="2" weight="bold">
            {humanizeKey(setting.key)}
          </Text>
          {isDirty && (
            <Badge color="amber" variant="soft" radius="full" size="1">
              Dirty
            </Badge>
          )}
          {!setting.isEditable && (
            <Badge color="gray" variant="soft" radius="full" size="1">
              Read-only
            </Badge>
          )}
        </Flex>
        <Text
          size="1"
          color="gray"
          as="div"
          style={{ fontFamily: "monospace", marginTop: 2 }}
        >
          {setting.key}
        </Text>
        {setting.description && (
          <Text size="1" color="gray" as="div" mt="1">
            {setting.description}
          </Text>
        )}
      </Box>

      <Box style={{ flex: 1, minWidth: 0 }}>
        {isImage ? (
          <ImageSettingEditor
            setting={setting}
            onUploaded={onImageUploaded}
          />
        ) : (
          <SettingValueEditor
            setting={setting}
            value={value}
            onChange={(next) => onChange(setting, next)}
          />
        )}
      </Box>
    </Flex>
  );
};

// ─── Cash Drawer ──────────────────────────────────────────────────────────────

const CashDrawerSection: React.FC = () => {
  const {
    isSupported,
    isConnected,
    isConnecting,
    isGloballyEnabled,
    connect,
    testKick,
  } = useCashDrawer();

  return (
    <Box mt="2">
      <Card variant="surface" size="3">
        <Flex align="center" gap="2" mb="3">
          <Box style={{ color: "var(--accent-11)" }}>
            <PointOfSaleRounded fontSize="small" />
          </Box>
          <Heading size="4">Cash Drawer</Heading>
        </Flex>
        <Text size="2" color="gray">
          Automatically open a connected cash drawer when a cash payment is
          confirmed. Uses the Web Serial API — requires Chrome or Edge.
        </Text>

        {!isSupported ? (
          <Box mt="4">
            <Callout.Root color="gray" variant="surface" size="1">
              <Callout.Text>
                Web Serial is not supported in this browser. Use Chrome or
                Microsoft Edge to enable cash drawer integration.
              </Callout.Text>
            </Callout.Root>
          </Box>
        ) : (
          <Box mt="4">
            <Flex direction="column" gap="4">
              {!isGloballyEnabled && (
                <Callout.Root color="amber" variant="surface" size="1">
                  <Callout.Text>
                    Cash Drawer Integration is globally disabled by admin
                    settings. Enable it in Settings → System Settings → POS →
                    <strong> Cash Drawer Integration</strong>.
                  </Callout.Text>
                </Callout.Root>
              )}

              {/* Connection status + controls */}
              <Flex
                align={{ initial: "stretch", sm: "center" }}
                direction={{ initial: "column", sm: "row" }}
                justify="between"
                gap="3"
              >
                <Flex align="center" gap="2">
                  <Box
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: isConnected
                        ? "var(--green-9)"
                        : "var(--gray-7)",
                      boxShadow: isConnected
                        ? "0 0 0 3px var(--green-a4)"
                        : undefined,
                      flexShrink: 0,
                    }}
                  />
                  <Text size="2" weight="medium">
                    {isConnected ? "Connected" : "Not connected"}
                  </Text>
                  <Text size="1" color="gray">
                    {isConnected
                      ? "Port is open and ready to kick."
                      : "Select a port to connect the cash drawer."}
                  </Text>
                </Flex>

                <Flex gap="2" wrap="wrap">
                  <Button
                    type="Secondary"
                    onClick={connect}
                    disabled={isConnecting}
                    loading={isConnecting}
                  >
                    <Flex align="center" gap="2">
                      <LinkOutlined fontSize="small" />
                      {isConnected ? "Change port" : "Connect port"}
                    </Flex>
                  </Button>
                  {isConnected && (
                    <Button type="Primary" onClick={testKick}>
                      <Flex align="center" gap="2">
                        <PlayCircleOutlined fontSize="small" />
                        Test kick
                      </Flex>
                    </Button>
                  )}
                </Flex>
              </Flex>

              <Callout.Root color="blue" variant="soft" size="1">
                <Callout.Text>
                  Connect your receipt printer (USB) or use a USB-to-serial
                  adapter. The drawer must be plugged into the printer&apos;s
                  RJ11 kick port or connected directly via serial. Click
                  &quot;Connect port&quot; to grant browser access — this is a
                  one-time step per device.
                </Callout.Text>
              </Callout.Root>
            </Flex>
          </Box>
        )}
      </Card>
    </Box>
  );
};
