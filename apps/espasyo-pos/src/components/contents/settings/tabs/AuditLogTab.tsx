import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Flex,
  Heading,
  Separator,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Card,
  Code,
  Dialog,
  Select,
  Switch,
  TextField,
  Tooltip,
} from "@radix-ui/themes";;
import {
  Restore,
  Search,
  FactCheckOutlined,
  ManageHistory,
  DeleteForeverOutlined,
} from "@mui/icons-material";
import { useApi, useApiCallback, useMpinStatus, useResolution } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import { usePublicSettings } from "core-lib/core/contexts";
import {
  AuditLogDto,
  AuditLogQueryParams,
  BulkUpdateSystemSettingParams,
} from "core-lib/api/commons/types";
import { AdminConfirmationParams } from "core-lib/api/authentication/types";
import { AUDIT_EVENT_TYPES, SETTING_KEYS } from "core-lib/business/settings";
import { Button } from "core-lib/components/radix/buttons/Button";
import { AdminConfirmDialog } from "core-lib/components/radix/security";
import { formatDateTime } from "core-lib/business/dates";
import { mobileDialogStyle, mobileContentStyle, mobileHeaderStyle, mobileFooterStyle } from "core-lib/components/radix/dialog/mobileFullScreen";

const EVENT_OPTIONS = [
  { value: "all", label: "All events" },
  ...Object.entries(AUDIT_EVENT_TYPES).map(([k, v]) => ({
    value: v,
    label: k.replace(/([A-Z])/g, " $1").trim(),
  })),
];

const ACTION_COLOR: Record<
  string,
  "indigo" | "amber" | "green" | "blue" | "gray" | "purple" | "red"
> = {
  Create: "green",
  Update: "amber",
  Delete: "red",
  Login: "blue",
  Logout: "gray",
};

const eventBadgeColor = (eventType: string) => {
  if (eventType.startsWith("Loader.")) return "jade";
  if (eventType.startsWith("Backup.")) return "teal";
  if (eventType.startsWith("System.")) return "amber";
  if (eventType.startsWith("User.")) return "indigo";
  if (eventType.startsWith("Inventory.") || eventType.startsWith("Stock."))
    return "blue";
  if (eventType.startsWith("Sale.")) return "green";
  if (eventType.startsWith("Setting.")) return "purple";
  if (eventType.startsWith("Product.")) return "cyan";
  if (eventType.startsWith("Role.")) return "iris";
  if (eventType.startsWith("MenuItem.")) return "violet";
  return "gray";
};

interface Filters {
  eventType: string;
  entityName: string;
  userID: string;
  fromDate: string;
  toDate: string;
}

const EMPTY_FILTERS: Filters = {
  eventType: "all",
  entityName: "",
  userID: "",
  fromDate: "",
  toDate: "",
};

export const AuditLogTab: React.FC = () => {
  const { showToast } = useToastContext();
  const mpinStatus = useMpinStatus();
  const publicSettings = usePublicSettings();
  const auditLogsEnabled = publicSettings.features.auditLogsEnabled;
  const settingsData = useApi((api) => api.commons.settingsList());
  const allSettings = settingsData.result?.data.response ?? [];
  const auditSettingDto = allSettings.find(
    (s) => s.key === SETTING_KEYS.FeaturesAuditLogsEnabled,
  );

  const [pendingEnabled, setPendingEnabled] = useState(auditLogsEnabled);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(EMPTY_FILTERS);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selected, setSelected] = useState<AuditLogDto | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setPendingEnabled(auditLogsEnabled);
  }, [auditLogsEnabled]);

  const isDirty = pendingEnabled !== auditLogsEnabled;

  const deleteCb = useApiCallback(
    async (api, args: AdminConfirmationParams) =>
      await api.commons.deleteAllAuditLogs(args),
  );

  const toggleCb = useApiCallback(
    async (api, args: BulkUpdateSystemSettingParams) =>
      await api.commons.bulkUpdateSettings(args),
  );

  const handleToggle = (checked: boolean) => {
    setPendingEnabled(checked);
  };

  const handleSave = async () => {
    if (!auditSettingDto) {
      showToast("Audit logging setting not found", "error");
      return;
    }
    try {
      await toggleCb.execute({
        settings: [
          {
            systemSettingID: auditSettingDto.systemSettingID,
            value: String(pendingEnabled),
          },
        ],
      });
      await publicSettings.refresh();
      showToast(
        pendingEnabled ? "Audit logging enabled" : "Audit logging disabled",
        "success",
      );
    } catch (error) {
      showToast("Failed to update audit logging setting", "error");
    }
  };

  const handleDiscard = () => {
    setPendingEnabled(auditLogsEnabled);
  };

  const hasMpin = mpinStatus.ready && !!mpinStatus.status?.hasMpin;

  const queryParams: AuditLogQueryParams = useMemo(
    () => ({
      eventType:
        appliedFilters.eventType === "all"
          ? undefined
          : appliedFilters.eventType,
      entityName: appliedFilters.entityName || undefined,
      userID: appliedFilters.userID || undefined,
      fromDate: appliedFilters.fromDate || undefined,
      toDate: appliedFilters.toDate || undefined,
      pageNumber,
      pageSize,
    }),
    [appliedFilters, pageNumber, pageSize],
  );

  const data = useApi(
    (api) => api.commons.auditLogList(queryParams),
    [JSON.stringify(queryParams)],
  );

  const page = data.result?.data.response;
  const logs = page?.items ?? [];

  useEffect(() => {
    setPageNumber(1);
  }, [appliedFilters, pageSize]);

  const applyFilters = () => setAppliedFilters(filters);
  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
  };

  const handleDeleteConfirm = async ({
    password,
    mpin,
  }: AdminConfirmationParams) => {
    setDeleteError(null);
    try {
      const result = await deleteCb.execute({ password, mpin });
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success
      ) {
        showToast("Audit logs cleared", "success");
        setDeleteOpen(false);
        setPageNumber(1);
        data.execute();
        return;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to clear audit logs";
      setDeleteError(message);
    } catch (error) {
      console.error("Error clearing audit logs:", error);
      const status = (error as string[] & { status?: number }).status;
      if (status === 401) {
        setDeleteError("Password or MPIN is incorrect. Try again.");
        return;
      }
      const first =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to clear audit logs";
      setDeleteError(first);
    }
  };

  return (
    <Flex direction="column" gap="4">
      <Card variant="surface" size="2">
        <Flex direction="column" gap="3">
          <Flex align="center" justify="between">
            <Box>
              <Heading size="3">Audit Logging</Heading>
              <Text size="2" color="gray">
                When disabled, no new events will be recorded by the system.
              </Text>
            </Box>
            <Flex align="center" gap="2">
              <Text
                size="2"
                color={pendingEnabled ? "jade" : "gray"}
                weight="medium"
              >
                {pendingEnabled ? "Enabled" : "Disabled"}
              </Text>
              <Switch
                checked={pendingEnabled}
                onCheckedChange={handleToggle}
                disabled={toggleCb.loading || settingsData.loading}
                color="jade"
              />
            </Flex>
          </Flex>
          {isDirty && (
            <Flex gap="2" justify="end">
              <Button
                variant="soft"
                onClick={handleDiscard}
                disabled={toggleCb.loading}
              >
                Discard
              </Button>
              <Button onClick={handleSave} loading={toggleCb.loading}>
                Save changes
              </Button>
            </Flex>
          )}
        </Flex>
      </Card>

      {!pendingEnabled ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          py="9"
          gap="2"
        >
          <ManageHistory style={{ fontSize: 56, color: "var(--gray-9)" }} />
          <Text size="3" weight="medium">
            Audit logging is disabled.
          </Text>
          <Text size="2" color="gray">
            Enable audit logging above to start recording system events.
          </Text>
        </Flex>
      ) : (
        <>
          <Card variant="surface" size="2">
            <Flex
              align={{ initial: "stretch", md: "center" }}
              justify="between"
              gap="3"
              direction={{ initial: "column", md: "row" }}
            >
              <Box>
                <Heading size="4">Audit Log</Heading>
                <Text size="2" color="gray">
                  Append-only history of system events. Click a row to view the
                  full change payload.
                </Text>
              </Box>
          <Flex align="center" gap="2" wrap="wrap">
            <Text size="2" color="gray">
              {page?.totalItems ?? logs.length} total
            </Text>
            <Select.Root
              value={String(pageSize)}
              onValueChange={(v) => setPageSize(parseInt(v, 10))}
            >
              <Select.Trigger />
              <Select.Content>
                {[20, 50, 100, 200].map((n) => (
                  <Select.Item key={n} value={String(n)}>
                    {n} / page
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            {!hasMpin ? (
              <Tooltip content="Set up an MPIN under Profile → MPIN Security to enable this action.">
                <Box>
                  <Button type="Critical" disabled>
                    <Flex align="center" gap="2">
                      <DeleteForeverOutlined fontSize="small" />
                      Clear all logs
                    </Flex>
                  </Button>
                </Box>
              </Tooltip>
            ) : (
              <Button
                type="Critical"
                onClick={() => {
                  setDeleteError(null);
                  setDeleteOpen(true);
                }}
                disabled={deleteCb.loading}
              >
                <Flex align="center" gap="2">
                  <DeleteForeverOutlined fontSize="small" />
                  Clear all logs
                </Flex>
              </Button>
            )}
          </Flex>
        </Flex>
      </Card>

      <AdminConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteError(null);
        }}
        title="Clear every audit log row?"
        description="This permanently deletes the entire audit log table. The action itself will be recorded as a single breadcrumb row."
        warning="This cannot be undone. There is no per-row recovery and no separate trash."
        confirmLabel="Clear all logs"
        confirmColor="Critical"
        loading={deleteCb.loading}
        errorMessage={deleteError}
        onConfirm={handleDeleteConfirm}
      />

      <Card variant="surface" size="2">
        <Flex gap="3" align="end" wrap="wrap">
          <Box style={{ minWidth: 220 }}>
            <Text size="1" color="gray" as="div" mb="1">
              Event type
            </Text>
            <Select.Root
              value={filters.eventType}
              onValueChange={(v) => setFilters((p) => ({ ...p, eventType: v }))}
            >
              <Select.Trigger style={{ width: "100%" }} />
              <Select.Content>
                {EVENT_OPTIONS.map((o) => (
                  <Select.Item key={o.value} value={o.value}>
                    {o.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>
          <Box style={{ minWidth: 200 }}>
            <Text size="1" color="gray" as="div" mb="1">
              Entity name
            </Text>
            <TextField.Root
              value={filters.entityName}
              placeholder="e.g. SystemSetting"
              onChange={(e) =>
                setFilters((p) => ({ ...p, entityName: e.target.value }))
              }
            />
          </Box>
          <Box style={{ minWidth: 220 }}>
            <Text size="1" color="gray" as="div" mb="1">
              User ID
            </Text>
            <TextField.Root
              value={filters.userID}
              placeholder="GUID"
              onChange={(e) =>
                setFilters((p) => ({ ...p, userID: e.target.value }))
              }
            />
          </Box>
          <Box>
            <Text size="1" color="gray" as="div" mb="1">
              From
            </Text>
            <TextField.Root
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                setFilters((p) => ({ ...p, fromDate: e.target.value }))
              }
            />
          </Box>
          <Box>
            <Text size="1" color="gray" as="div" mb="1">
              To
            </Text>
            <TextField.Root
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters((p) => ({ ...p, toDate: e.target.value }))
              }
            />
          </Box>
          <Flex gap="2">
            <Button type="Primary" onClick={applyFilters}>
              <Flex align="center" gap="2">
                <Search fontSize="small" />
                Apply
              </Flex>
            </Button>
            <Button type="Secondary" onClick={resetFilters}>
              <Flex align="center" gap="2">
                <Restore fontSize="small" />
                Reset
              </Flex>
            </Button>
          </Flex>
        </Flex>
      </Card>

      {data.loading && logs.length === 0 ? (
        <Flex align="center" justify="center" py="9">
          <Text color="gray">Loading audit log…</Text>
        </Flex>
      ) : logs.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          py="9"
          gap="2"
        >
          <ManageHistory style={{ fontSize: 56, color: "var(--gray-9)" }} />
          <Text size="3" weight="medium">
            No audit records match these filters.
          </Text>
          <Text size="2" color="gray">
            Try widening the date range or clearing filters.
          </Text>
        </Flex>
      ) : (
        <Card variant="surface" size="2" style={{ overflow: "hidden" }}>
          <Flex direction="column">
            {logs.map((log, idx) => (
              <React.Fragment key={log.auditLogID}>
                {idx > 0 && <Separator size="4" />}
                <Box
                  p="3"
                  onClick={() => setSelected(log)}
                  style={{ cursor: "pointer" }}
                  className="audit-row"
                >
                  <Flex align="center" gap="3" wrap="wrap">
                    <Badge
                      color={eventBadgeColor(log.eventType)}
                      variant="soft"
                      radius="full"
                    >
                      {log.eventType}
                    </Badge>
                    {log.action && (
                      <Badge
                        color={ACTION_COLOR[log.action] ?? "gray"}
                        variant="soft"
                        radius="full"
                      >
                        {log.action}
                      </Badge>
                    )}
                    {log.entityName && (
                      <Text size="2" color="gray">
                        {log.entityName}
                        {log.entityID ? ` · ${log.entityID.slice(0, 8)}…` : ""}
                      </Text>
                    )}
                    <Box style={{ flex: 1 }} />
                    <Text size="1" color="gray">
                      {formatDateTime(log.createdAt)}
                    </Text>
                  </Flex>
                  {log.message && (
                    <Text size="2" as="div" mt="1" truncate>
                      {log.message}
                    </Text>
                  )}
                </Box>
              </React.Fragment>
            ))}
          </Flex>
        </Card>
      )}

      {page && page.totalPages > 1 && (
        <Flex justify="between" align="center">
          <Text size="2" color="gray">
            Page {page.pageNumber} of {page.totalPages} ·{" "}
            {page.totalItems} total
          </Text>
          <Flex gap="2">
            <Button
              type="Secondary"
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={!page.hasPreviousPage}
            >
              Previous
            </Button>
            <Button
              type="Secondary"
              onClick={() => setPageNumber((p) => p + 1)}
              disabled={!page.hasNextPage}
            >
              Next
            </Button>
          </Flex>
        </Flex>
      )}

      <AuditLogDetailDialog
        log={selected}
        onClose={() => setSelected(null)}
      />
        </>
      )}
    </Flex>
  );
};

const AuditLogDetailDialog: React.FC<{
  log: AuditLogDto | null;
  onClose: () => void;
}> = ({ log, onClose }) => {
  const { isSmallMobile } = useResolution();
  const formatted = useMemo(() => {
    if (!log?.changesJson) return null;
    try {
      const parsed = JSON.parse(log.changesJson);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return log.changesJson;
    }
  }, [log?.changesJson]);

  return (
    <Dialog.Root open={!!log} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content style={isSmallMobile ? mobileDialogStyle : { maxWidth: 720 }}>
        <Flex direction="column" style={{ height: "100%" }}>
          <Box style={isSmallMobile ? mobileHeaderStyle : undefined}>
            <Dialog.Title>
              <Flex align="center" gap="2">
                <FactCheckOutlined fontSize="small" />
                Audit detail
              </Flex>
            </Dialog.Title>
          </Box>
          <Box style={isSmallMobile ? mobileContentStyle : undefined}>
            {log && (
              <Box mt="3">
                <Flex gap="2" wrap="wrap" mb="3">
                  <Badge color={eventBadgeColor(log.eventType)} variant="soft">
                    {log.eventType}
                  </Badge>
                  {log.action && (
                    <Badge color={ACTION_COLOR[log.action] ?? "gray"} variant="soft">
                      {log.action}
                    </Badge>
                  )}
                  <Badge variant="surface" color="gray">
                    {formatDateTime(log.createdAt)}
                  </Badge>
                </Flex>

                <Flex direction="column" gap="2">
                  <DetailRow label="Entity" value={log.entityName} />
                  <DetailRow label="Entity ID" value={log.entityID} />
                  <DetailRow label="User ID" value={log.userID} />
                  <DetailRow label="IP Address" value={log.ipAddress} />
                  <DetailRow label="Message" value={log.message} />
                </Flex>

                {formatted && (
                  <Box mt="3">
                    <Text size="1" color="gray" as="div" mb="1">
                      Changes
                    </Text>
                    <Box
                      style={{
                        background: "var(--gray-a2)",
                        border: "1px solid var(--gray-a4)",
                        borderRadius: "var(--radius-3)",
                        padding: 12,
                        overflow: "auto",
                        maxHeight: 320,
                      }}
                    >
                      <Code
                        size="1"
                        style={{
                          whiteSpace: "pre",
                          fontFamily: "monospace",
                          background: "transparent",
                        }}
                      >
                        {formatted}
                      </Code>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
          <Flex justify="end" mt="4" style={isSmallMobile ? mobileFooterStyle : undefined}>
            <Button type="Secondary" onClick={onClose}>
              Close
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

const DetailRow: React.FC<{ label: string; value?: string | null }> = ({
  label,
  value,
}) => (
  <Flex gap="3">
    <Text
      size="2"
      color="gray"
      style={{ width: 96, flexShrink: 0 }}
    >
      {label}
    </Text>
    <Text size="2" weight="medium" style={{ wordBreak: "break-all" }}>
      {value && value.trim() ? value : "—"}
    </Text>
  </Flex>
);
