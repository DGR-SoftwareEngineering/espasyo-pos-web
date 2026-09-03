import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Flex,
  Heading,
  Separator,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Button,
  Card,
  Callout,
  Grid,
  RadioGroup,
  Select,
  Skeleton,
  Switch,
  TextArea,
  TextField,
} from "@radix-ui/themes";;
import {
  AccessTimeOutlined,
  CalendarTodayOutlined,
  CheckCircleOutlined,
  DateRangeOutlined,
  InfoOutlined,
  LayersOutlined,
  PublicOutlined,
  RouterOutlined,
  SaveOutlined,
  ScheduleOutlined,
  TravelExploreOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import { useApi, useApiCallback } from "core-lib/core/hooks";
import { usePublicSettings } from "core-lib/core/contexts";
import { useToastContext } from "core-lib";
import { BulkUpdateSystemSettingParams, SystemSettingDto } from "core-lib/api/commons/types";
import { SETTING_KEYS } from "core-lib/business/settings";

// ─── Timezone reference data ───────────────────────────────────────────────

const COMMON_TIMEZONES = [
  { id: "Asia/Manila", label: "Asia/Manila — Philippines (UTC+8)" },
  { id: "Asia/Singapore", label: "Asia/Singapore — Singapore (UTC+8)" },
  { id: "Asia/Hong_Kong", label: "Asia/Hong_Kong — Hong Kong (UTC+8)" },
  { id: "Asia/Tokyo", label: "Asia/Tokyo — Japan (UTC+9)" },
  { id: "Asia/Bangkok", label: "Asia/Bangkok — Thailand (UTC+7)" },
  { id: "Asia/Dubai", label: "Asia/Dubai — UAE (UTC+4)" },
  { id: "Europe/London", label: "Europe/London — UK (UTC+0/+1)" },
  { id: "Europe/Paris", label: "Europe/Paris — France (UTC+1/+2)" },
  { id: "America/New_York", label: "America/New_York — Eastern Time (UTC-5/-4)" },
  { id: "America/Chicago", label: "America/Chicago — Central Time (UTC-6/-5)" },
  { id: "America/Los_Angeles", label: "America/Los_Angeles — Pacific Time (UTC-8/-7)" },
  { id: "Australia/Sydney", label: "Australia/Sydney — AEST (UTC+10/+11)" },
  { id: "UTC", label: "UTC — Coordinated Universal Time (UTC+0)" },
];

const DATE_FORMAT_OPTIONS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY", example: "Day-first" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY", example: "Month-first" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD", example: "ISO 8601" },
];

const TIME_FORMAT_OPTIONS = [
  { value: "12h", label: "12-hour", example: "2:30 PM" },
  { value: "24h", label: "24-hour", example: "14:30" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function getUtcOffsetBadge(tzId: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tzId,
      timeZoneName: "short",
    });
    const parts = formatter.formatToParts(now);
    const tzName = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    return tzName || tzId;
  } catch {
    return tzId;
  }
}

function formatPreviewDate(format: string): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = now.getFullYear();
  switch (format) {
    case "DD/MM/YYYY": return `${d}/${m}/${y}`;
    case "MM/DD/YYYY": return `${m}/${d}/${y}`;
    case "YYYY-MM-DD": return `${y}-${m}-${d}`;
    default: return `${d}/${m}/${y}`;
  }
}

function formatPreviewTime(format: string): string {
  const now = new Date();
  const h24 = now.getHours();
  const min = String(now.getMinutes()).padStart(2, "0");
  if (format === "24h") return `${String(h24).padStart(2, "0")}:${min}`;
  const h12 = h24 % 12 || 12;
  const ampm = h24 < 12 ? "AM" : "PM";
  return `${h12}:${min} ${ampm}`;
}

function isValidJson(str: string): boolean {
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed);
  } catch {
    return false;
  }
}

function isValidApiUrl(url: string): boolean {
  if (!url) return true;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// ─── Main Component ────────────────────────────────────────────────────────

export const LocalizationSettingsTab: React.FC = () => {
  const { showToast } = useToastContext();
  const publicSettings = usePublicSettings();

  const settingsData = useApi(
    (api) => api.commons.settingsByCategory("Localization"),
    [],
  );

  const saveCb = useApiCallback(async (api, args: BulkUpdateSystemSettingParams) =>
    api.commons.bulkUpdateSettings(args),
  );

  const settings: SystemSettingDto[] = settingsData.result?.data?.response ?? [];

  const getSettingByKey = useCallback(
    (key: string) => settings.find((s) => s.key === key),
    [settings],
  );

  // ─── Draft state ────────────────────────────────────────────────────────
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [tzInput, setTzInput] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [apiUrlError, setApiUrlError] = useState<string | null>(null);

  // Sync drafts from fetched settings (on first load)
  useEffect(() => {
    if (!settings.length) return;
    const initial: Record<string, string> = {};
    settings.forEach((s) => {
      initial[s.systemSettingID] = s.value;
    });
    setDrafts(initial);
    const tzSetting = settings.find((s) => s.key === SETTING_KEYS.LocalizationTimezone);
    if (tzSetting) setTzInput(tzSetting.value);
  }, [settings.length]);

  const getValue = useCallback(
    (key: string): string => {
      const setting = getSettingByKey(key);
      if (!setting) return "";
      return drafts[setting.systemSettingID] ?? setting.value;
    },
    [getSettingByKey, drafts],
  );

  const setValue = useCallback(
    (key: string, value: string) => {
      const setting = getSettingByKey(key);
      if (!setting) return;
      setDrafts((prev) => ({ ...prev, [setting.systemSettingID]: value }));
    },
    [getSettingByKey],
  );

  // ─── Derived values ─────────────────────────────────────────────────────
  const tzValue = getValue(SETTING_KEYS.LocalizationTimezone);
  const multiEnabled = getValue(SETTING_KEYS.LocalizationTimezoneMultiEnabled) === "true";
  const dateFormat = getValue(SETTING_KEYS.LocalizationDateFormat) || "DD/MM/YYYY";
  const timeFormat = getValue(SETTING_KEYS.LocalizationTimeFormat) || "12h";
  const tzListValue = getValue(SETTING_KEYS.LocalizationTimezoneList);
  const dateTimeSource = getValue(SETTING_KEYS.LocalizationDateTimeSource) || "system";
  const apiUrlValue = getValue(SETTING_KEYS.LocalizationDateTimeApiUrl);

  const utcBadge = useMemo(() => (tzValue ? getUtcOffsetBadge(tzValue) : ""), [tzValue]);

  const lastUpdated = useMemo(() => {
    if (!settings.length) return null;
    const dates = settings.map((s) => s.updatedAt).filter(Boolean) as string[];
    if (!dates.length) return null;
    const latest = dates.sort().at(-1)!;
    return new Date(latest).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }, [settings]);

  const hasDrafts = useMemo(() => {
    return settings.some((s) => drafts[s.systemSettingID] !== undefined && drafts[s.systemSettingID] !== s.value);
  }, [settings, drafts]);

  // ─── Save ────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    // Validate JSON list if multi-tz is enabled
    if (multiEnabled && !isValidJson(tzListValue)) {
      setJsonError("Must be a valid JSON array, e.g. [\"Asia/Manila\", \"UTC\"]");
      return;
    }
    setJsonError(null);

    // Validate external API URL
    if (dateTimeSource === "external" && apiUrlValue && !isValidApiUrl(apiUrlValue)) {
      setApiUrlError("Must be a valid http/https URL");
      return;
    }
    setApiUrlError(null);

    const payload: BulkUpdateSystemSettingParams = {
      settings: Object.entries(drafts).map(([id, value]) => ({
        systemSettingID: id,
        value,
      })),
    };

    try {
      const result = await saveCb.execute(payload);
      if (result?.data?.success) {
        showToast("Localization settings saved", "success");
        settingsData.execute();
        publicSettings.refresh();
      } else {
        const msg = (result?.data as any)?.message ?? "Failed to save settings";
        showToast(msg, "error");
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Failed to save settings";
      showToast(msg, "error");
    }
  }, [drafts, saveCb, showToast, settingsData, publicSettings, multiEnabled, tzListValue, dateTimeSource, apiUrlValue]);

  // ─── Loading state ────────────────────────────────────────────────────────
  if (settingsData.loading) {
    return (
      <Box pt="4">
        <Flex direction="column" gap="4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="120px" />
          ))}
        </Flex>
      </Box>
    );
  }

  if (!settings.length) {
    return (
      <Box pt="4">
        <Callout.Root color="amber">
          <WarningAmberOutlined style={{ fontSize: 16 }} />
          <Callout.Text>
            Localization settings are not available. Ensure the backend migration has run and the
            Localization category settings exist in the database.
          </Callout.Text>
        </Callout.Root>
      </Box>
    );
  }

  return (
    <Box pt="4">
      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <Card
        mb="5"
        style={{
          background: "linear-gradient(135deg, var(--indigo-a3) 0%, var(--violet-a3) 60%, var(--blue-a2) 100%)",
          border: "1px solid var(--indigo-a5)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Background decoration */}
        <Box
          style={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "var(--indigo-a3)",
            pointerEvents: "none",
          }}
        />
        <Flex align="center" justify="between" gap="4" style={{ position: "relative" }}>
          <Flex align="center" gap="3">
            <Box
              style={{
                background: "var(--indigo-a4)",
                border: "1px solid var(--indigo-a6)",
                borderRadius: "var(--radius-3)",
                padding: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PublicOutlined style={{ fontSize: 28, color: "var(--indigo-11)" }} />
            </Box>
            <Flex direction="column" gap="1">
              <Heading size="5" weight="bold">Localization & Timezone</Heading>
              <Text size="2" color="gray">
                Configure timezone, date format, and regional display preferences
              </Text>
            </Flex>
          </Flex>
          <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
            <TravelExploreOutlined style={{ fontSize: 48, color: "var(--indigo-a6)" }} />
          </Flex>
        </Flex>

        {(utcBadge || dateTimeSource === "external") && (
          <Flex align="center" gap="2" mt="3" wrap="wrap">
            {utcBadge && (
              <Badge color="indigo" variant="soft" size="2" radius="full">
                <ScheduleOutlined style={{ fontSize: 12 }} />
                {utcBadge} · {tzValue}
              </Badge>
            )}
            {dateTimeSource === "external" && (
              <Badge color="orange" variant="soft" size="2" radius="full">
                <RouterOutlined style={{ fontSize: 12 }} />
                External Clock Active
              </Badge>
            )}
            {lastUpdated && (
              <Text size="1" color="gray">Last saved: {lastUpdated}</Text>
            )}
          </Flex>
        )}
      </Card>

      {/* ── Section 1: Primary Timezone ─────────────────────────────────── */}
      <Card mb="4" style={{ border: "1px solid var(--blue-a4)" }}>
        <Flex align="center" gap="2" mb="3">
          <Box
            style={{
              background: "var(--blue-a3)",
              borderRadius: "var(--radius-2)",
              padding: "6px",
              display: "flex",
            }}
          >
            <PublicOutlined style={{ fontSize: 18, color: "var(--blue-11)" }} />
          </Box>
          <Heading size="3" weight="bold">Primary Timezone</Heading>
          {utcBadge && (
            <Badge color="blue" variant="soft" size="1" radius="full">
              {utcBadge}
            </Badge>
          )}
        </Flex>

        <Text size="2" color="gray" as="div" mb="3">
          All business date calculations, reports, and transaction records use this timezone.
        </Text>

        <Grid columns={{ initial: "1", sm: "2" }} gap="3" mb="3">
          {/* Free-text IANA input */}
          <Flex direction="column" gap="1">
            <Text size="1" weight="medium" color="gray">IANA Timezone ID</Text>
            <TextField.Root
              value={tzInput}
              onChange={(e) => {
                setTzInput(e.target.value);
                setValue(SETTING_KEYS.LocalizationTimezone, e.target.value);
              }}
              placeholder="e.g. Asia/Manila"
              style={{ fontFamily: "monospace" }}
            />
            <Text size="1" color="gray">
              Use a valid IANA ID (e.g. Asia/Manila, UTC, America/New_York)
            </Text>
          </Flex>

          {/* Quick-select dropdown */}
          <Flex direction="column" gap="1">
            <Text size="1" weight="medium" color="gray">Quick Select</Text>
            <Select.Root
              value={COMMON_TIMEZONES.some((t) => t.id === tzValue) ? tzValue : ""}
              onValueChange={(v) => {
                setTzInput(v);
                setValue(SETTING_KEYS.LocalizationTimezone, v);
              }}
            >
              <Select.Trigger placeholder="Choose a common timezone…" style={{ width: "100%" }} />
              <Select.Content>
                {COMMON_TIMEZONES.map((tz) => (
                  <Select.Item key={tz.id} value={tz.id}>
                    {tz.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            <Text size="1" color="gray">Updates the IANA ID field above</Text>
          </Flex>
        </Grid>

        <Callout.Root color="amber" variant="surface" size="1">
          <InfoOutlined style={{ fontSize: 14 }} />
          <Callout.Text size="1">
            Changes take effect within <strong>~30 seconds</strong> after saving (backend cache TTL).
            All existing sales data is stored using Asia/Manila dates.
          </Callout.Text>
        </Callout.Root>
      </Card>

      {/* ── Section 2: Date & Time Format ─────────────────────────────────── */}
      <Card mb="4" style={{ border: "1px solid var(--green-a4)" }}>
        <Flex align="center" gap="2" mb="3">
          <Box
            style={{
              background: "var(--green-a3)",
              borderRadius: "var(--radius-2)",
              padding: "6px",
              display: "flex",
            }}
          >
            <DateRangeOutlined style={{ fontSize: 18, color: "var(--green-11)" }} />
          </Box>
          <Heading size="3" weight="bold">Date & Time Format</Heading>
        </Flex>

        <Text size="2" color="gray" as="div" mb="3">
          Controls how dates and times are displayed throughout the application. The backend always
          stores dates in ISO 8601 format; these settings apply at the display layer.
        </Text>

        <Grid columns={{ initial: "1", md: "2" }} gap="4">
          {/* Date Format */}
          <Box>
            <Flex align="center" gap="2" mb="2">
              <CalendarTodayOutlined style={{ fontSize: 14, color: "var(--gray-11)" }} />
              <Text size="2" weight="medium">Date Format</Text>
            </Flex>
            <RadioGroup.Root
              value={dateFormat}
              onValueChange={(v) => setValue(SETTING_KEYS.LocalizationDateFormat, v)}
            >
              <Flex direction="column" gap="2">
                {DATE_FORMAT_OPTIONS.map((opt) => (
                  <Card
                    key={opt.value}
                    variant="surface"
                    style={{
                      cursor: "pointer",
                      border: dateFormat === opt.value
                        ? "1.5px solid var(--green-9)"
                        : "1px solid var(--gray-a4)",
                      background: dateFormat === opt.value ? "var(--green-a2)" : undefined,
                      transition: "all 0.15s ease",
                    }}
                    onClick={() => setValue(SETTING_KEYS.LocalizationDateFormat, opt.value)}
                  >
                    <Flex align="center" justify="between">
                      <Flex align="center" gap="2">
                        <RadioGroup.Item value={opt.value} />
                        <Flex direction="column" gap="0">
                          <Text size="2" weight="medium" style={{ fontFamily: "monospace" }}>
                            {opt.label}
                          </Text>
                          <Text size="1" color="gray">{opt.example}</Text>
                        </Flex>
                      </Flex>
                      <Badge
                        color={dateFormat === opt.value ? "green" : "gray"}
                        variant="soft"
                        size="1"
                        style={{ fontFamily: "monospace" }}
                      >
                        {formatPreviewDate(opt.value)}
                      </Badge>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            </RadioGroup.Root>
          </Box>

          {/* Time Format */}
          <Box>
            <Flex align="center" gap="2" mb="2">
              <AccessTimeOutlined style={{ fontSize: 14, color: "var(--gray-11)" }} />
              <Text size="2" weight="medium">Time Format</Text>
            </Flex>
            <RadioGroup.Root
              value={timeFormat}
              onValueChange={(v) => setValue(SETTING_KEYS.LocalizationTimeFormat, v)}
            >
              <Flex direction="column" gap="2">
                {TIME_FORMAT_OPTIONS.map((opt) => (
                  <Card
                    key={opt.value}
                    variant="surface"
                    style={{
                      cursor: "pointer",
                      border: timeFormat === opt.value
                        ? "1.5px solid var(--green-9)"
                        : "1px solid var(--gray-a4)",
                      background: timeFormat === opt.value ? "var(--green-a2)" : undefined,
                      transition: "all 0.15s ease",
                    }}
                    onClick={() => setValue(SETTING_KEYS.LocalizationTimeFormat, opt.value)}
                  >
                    <Flex align="center" justify="between">
                      <Flex align="center" gap="2">
                        <RadioGroup.Item value={opt.value} />
                        <Flex direction="column" gap="0">
                          <Text size="2" weight="medium">{opt.label}</Text>
                          <Text size="1" color="gray">{opt.example}</Text>
                        </Flex>
                      </Flex>
                      <Badge
                        color={timeFormat === opt.value ? "green" : "gray"}
                        variant="soft"
                        size="1"
                        style={{ fontFamily: "monospace" }}
                      >
                        {formatPreviewTime(opt.value)}
                      </Badge>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            </RadioGroup.Root>
          </Box>
        </Grid>
      </Card>

      {/* ── Section 3: Multi-Timezone Display ─────────────────────────────── */}
      <Card mb="5" style={{ border: "1px solid var(--violet-a4)" }}>
        <Flex align="center" gap="2" mb="3">
          <Box
            style={{
              background: "var(--violet-a3)",
              borderRadius: "var(--radius-2)",
              padding: "6px",
              display: "flex",
            }}
          >
            <LayersOutlined style={{ fontSize: 18, color: "var(--violet-11)" }} />
          </Box>
          <Heading size="3" weight="bold">Multi-Timezone Display</Heading>
          <Badge
            color={multiEnabled ? "violet" : "gray"}
            variant="soft"
            size="1"
            radius="full"
          >
            {multiEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </Flex>

        <Text size="2" color="gray" as="div" mb="3">
          When enabled, additional timezones can be displayed alongside primary times in reports.
          Business data is always stored using the primary timezone only.
        </Text>

        <Flex align="center" gap="3" mb={multiEnabled ? "3" : "0"}>
          <Switch
            checked={multiEnabled}
            onCheckedChange={(checked) =>
              setValue(SETTING_KEYS.LocalizationTimezoneMultiEnabled, String(checked))
            }
            color="violet"
          />
          <Text size="2" weight="medium">
            Enable Multiple Timezone Display
          </Text>
        </Flex>

        {multiEnabled && (
          <>
            <Separator size="4" my="3" />
            <Flex direction="column" gap="2">
              <Flex align="center" justify="between">
                <Text size="2" weight="medium">Timezone Display List</Text>
                <Badge
                  color={isValidJson(tzListValue) ? "green" : "red"}
                  variant="soft"
                  size="1"
                >
                  {isValidJson(tzListValue) ? "Valid JSON" : "Invalid JSON"}
                </Badge>
              </Flex>
              <TextArea
                value={tzListValue}
                onChange={(e) => {
                  setValue(SETTING_KEYS.LocalizationTimezoneList, e.target.value);
                  setJsonError(null);
                }}
                placeholder='["Asia/Manila", "UTC", "America/New_York"]'
                rows={4}
                style={{ fontFamily: "monospace", fontSize: 13 }}
              />
              {jsonError ? (
                <Text size="1" style={{ color: "var(--red-11)" }}>{jsonError}</Text>
              ) : (
                <Text size="1" color="gray">
                  JSON array of IANA timezone IDs. Must include the primary timezone. Max 50 entries.
                </Text>
              )}
              <Text size="1" color="gray">
                Example:{" "}
                <code style={{ fontFamily: "monospace" }}>
                  {`["Asia/Manila", "UTC", "America/New_York"]`}
                </code>
              </Text>
            </Flex>
          </>
        )}
      </Card>

      {/* ── Section 4: Clock Source ─────────────────────────────────────── */}
      <Card mb="5" style={{ border: "1px solid var(--orange-a4)" }}>
        <Flex align="center" gap="2" mb="3">
          <Box
            style={{
              background: "var(--orange-a3)",
              borderRadius: "var(--radius-2)",
              padding: "6px",
              display: "flex",
            }}
          >
            <RouterOutlined style={{ fontSize: 18, color: "var(--orange-11)" }} />
          </Box>
          <Heading size="3" weight="bold">Clock Source</Heading>
          <Badge
            color={dateTimeSource === "external" ? "orange" : "gray"}
            variant="soft"
            size="1"
            radius="full"
          >
            {dateTimeSource === "external" ? "External API" : "System Clock"}
          </Badge>
        </Flex>

        <Text size="2" color="gray" as="div" mb="3">
          Controls which UTC time source the server uses for all date calculations, reports, and
          transaction records. Falls back to system clock silently if the external API fails.
        </Text>

        <RadioGroup.Root
          value={dateTimeSource}
          onValueChange={(v) => setValue(SETTING_KEYS.LocalizationDateTimeSource, v)}
        >
          <Flex direction="column" gap="2" mb="3">
            <Card
              variant="surface"
              style={{
                cursor: "pointer",
                border: dateTimeSource === "system"
                  ? "1.5px solid var(--orange-9)"
                  : "1px solid var(--gray-a4)",
                background: dateTimeSource === "system" ? "var(--orange-a2)" : undefined,
                transition: "all 0.15s ease",
              }}
              onClick={() => setValue(SETTING_KEYS.LocalizationDateTimeSource, "system")}
            >
              <Flex align="center" gap="3">
                <RadioGroup.Item value="system" />
                <Flex direction="column" gap="0">
                  <Text size="2" weight="medium">System Clock</Text>
                  <Text size="1" color="gray">Use the server's built-in clock. No external API overhead.</Text>
                </Flex>
                <Badge color="gray" variant="soft" size="1" style={{ marginLeft: "auto" }}>default</Badge>
              </Flex>
            </Card>
            <Card
              variant="surface"
              style={{
                cursor: "pointer",
                border: dateTimeSource === "external"
                  ? "1.5px solid var(--orange-9)"
                  : "1px solid var(--gray-a4)",
                background: dateTimeSource === "external" ? "var(--orange-a2)" : undefined,
                transition: "all 0.15s ease",
              }}
              onClick={() => setValue(SETTING_KEYS.LocalizationDateTimeSource, "external")}
            >
              <Flex align="center" gap="3">
                <RadioGroup.Item value="external" />
                <Flex direction="column" gap="0">
                  <Text size="2" weight="medium">External API</Text>
                  <Text size="1" color="gray">
                    Fetch UTC time from a trusted external service (e.g. timeapi.io). Prevents clock drift errors.
                  </Text>
                </Flex>
                <Badge color="orange" variant="soft" size="1" style={{ marginLeft: "auto" }}>recommended</Badge>
              </Flex>
            </Card>
          </Flex>
        </RadioGroup.Root>

        {dateTimeSource === "external" && (
          <>
            <Separator size="4" my="3" />
            <Flex direction="column" gap="2">
              <Flex align="center" justify="between">
                <Text size="2" weight="medium">External Time API URL</Text>
                {apiUrlValue && (
                  <Badge
                    color={isValidApiUrl(apiUrlValue) ? "green" : "red"}
                    variant="soft"
                    size="1"
                  >
                    {isValidApiUrl(apiUrlValue) ? "Valid URL" : "Invalid URL"}
                  </Badge>
                )}
              </Flex>
              <TextField.Root
                value={apiUrlValue}
                onChange={(e) => {
                  setValue(SETTING_KEYS.LocalizationDateTimeApiUrl, e.target.value);
                  setApiUrlError(null);
                }}
                placeholder="https://timeapi.io/api/Time/current/zone?timeZone=UTC"
                style={{ fontFamily: "monospace" }}
              />
              {apiUrlError ? (
                <Text size="1" style={{ color: "var(--red-11)" }}>{apiUrlError}</Text>
              ) : (
                <Text size="1" color="gray">
                  Full URL of the external time API. Response must include a <code>dateTime</code> field (ISO 8601).
                </Text>
              )}
              <Callout.Root color="blue" variant="surface" size="1">
                <InfoOutlined style={{ fontSize: 14 }} />
                <Callout.Text size="1">
                  Recommended:{" "}
                  <code style={{ fontFamily: "monospace" }}>
                    https://timeapi.io/api/Time/current/zone?timeZone=UTC
                  </code>{" "}
                  — free, no auth required.
                </Callout.Text>
              </Callout.Root>
            </Flex>
          </>
        )}

        <Callout.Root color="amber" variant="surface" size="1" mt="3">
          <InfoOutlined style={{ fontSize: 14 }} />
          <Callout.Text size="1">
            Changes take effect within <strong>~35 seconds</strong> (30s settings cache + 5s external
            clock cache). If the external API fails, the server silently falls back to the system clock.
          </Callout.Text>
        </Callout.Root>
      </Card>

      {/* ── Save Footer ───────────────────────────────────────────────────── */}
      <Card
        style={{
          background: hasDrafts
            ? "linear-gradient(90deg, var(--indigo-a2) 0%, var(--violet-a2) 100%)"
            : "var(--gray-a1)",
          border: hasDrafts ? "1px solid var(--indigo-a4)" : "1px solid var(--gray-a3)",
          transition: "all 0.2s ease",
        }}
      >
        <Flex align="center" justify="between" gap="3" wrap="wrap">
          <Flex direction="column" gap="1">
            <Text size="2" weight="medium">
              {hasDrafts ? "You have unsaved changes" : "All settings saved"}
            </Text>
            {lastUpdated && (
              <Text size="1" color="gray">Last saved: {lastUpdated}</Text>
            )}
          </Flex>
          <Flex gap="2" align="center">
            {hasDrafts && (
              <Button
                variant="soft"
                color="gray"
                size="2"
                onClick={() => {
                  setDrafts({});
                  const tzSetting = settings.find(
                    (s) => s.key === SETTING_KEYS.LocalizationTimezone,
                  );
                  if (tzSetting) setTzInput(tzSetting.value);
                  setJsonError(null);
                }}
                disabled={saveCb.loading}
              >
                Discard
              </Button>
            )}
            <Button
              variant="solid"
              color="indigo"
              size="2"
              onClick={handleSave}
              loading={saveCb.loading}
              disabled={!hasDrafts && !saveCb.loading}
            >
              {hasDrafts ? (
                <>
                  <SaveOutlined style={{ fontSize: 14 }} />
                  Save Changes
                </>
              ) : (
                <>
                  <CheckCircleOutlined style={{ fontSize: 14 }} />
                  Saved
                </>
              )}
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Box>
  );
};
