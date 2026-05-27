import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Badge, Box, Button, Callout, Card, Flex, Separator, Text } from "@radix-ui/themes";
import { InfoCircledIcon, ReloadIcon } from "@radix-ui/react-icons";
import {
  AccessTimeRounded,
  LockOpenOutlined,
  AttachMoneyOutlined,
  ReceiptLongOutlined,
  AccountBalanceWalletOutlined,
} from "@mui/icons-material";
import { useApi, useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import { CashierShiftDto, CloseShiftParams, ShiftSummaryDto } from "core-lib/api/commons/types";
import { HeaderV2 } from "core-lib/components/radix/header/HeaderV2";
import { StatsCard } from "core-lib/components/radix/StatsCard";
import { FilterBar } from "core-lib/components/radix/FilterBar";
import { DialogBox } from "core-lib/components/radix/dialog/DialogBox";
import { formatCurrency } from "core-lib/business/strings";
import { ShiftList } from "./ShiftList";
import { useShiftFilters } from "./hooks";
import { DIALOG_TITLES, STATUS_CONFIG } from "../constants";
import { CloseShiftFormBlock } from "../forms/CloseShiftFormBlock";
import { ShiftDetailView } from "./ShiftDetailView";
import { CloseShiftForm } from "../forms/validation";
import { StatusFilter } from "./types";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Open", label: "Open" },
  { value: "Closed", label: "Closed" },
];

const formatDateTime = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface Props {
  onAfterClose?: () => Promise<void>;
  mode?: "admin" | "cashier";
}

export const ShiftManagementBlock: React.FC<Props> = ({ onAfterClose, mode = "admin" }) => {
  const { showToast } = useToastContext();

  const [shifts, setShifts] = useState<CashierShiftDto[]>([]);
  const [activeShift, setActiveShift] = useState<ShiftSummaryDto | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [closeTarget, setCloseTarget] = useState<{ shift: CashierShiftDto; summary?: ShiftSummaryDto } | null>(null);
  const [viewTarget, setViewTarget] = useState<ShiftSummaryDto | null>(null);
  const [closeLoading, setCloseLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const activeShiftData = useApi((api) => api.commons.getActiveShift(), []);
  const shiftsData = useApi((api) => api.commons.listShifts(), []);
  const closeShiftCb = useApiCallback(
    async (api, params: CloseShiftParams) => api.commons.closeShift(params),
  );
  const shiftDetailCb = useApiCallback(
    async (api, id: string) => api.commons.getShiftById(id),
  );

  useEffect(() => {
    const res = activeShiftData.result?.data?.response ?? null;
    setActiveShift(res ?? null);
  }, [activeShiftData.result]);

  useEffect(() => {
    setShifts(shiftsData.result?.data?.response ?? []);
  }, [shiftsData.result]);

  const handleRefresh = useCallback(() => {
    activeShiftData.execute();
    shiftsData.execute();
    setPageNumber(1);
  }, [activeShiftData, shiftsData]);

  const { filters, filteredShifts, stats, updateFilter, updateStatusFilter, resetFilters } =
    useShiftFilters({ shifts });

  const paginatedData = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return filteredShifts.slice(start, start + pageSize);
  }, [filteredShifts, pageNumber, pageSize]);

  const pagination = useMemo(
    () => ({
      pageNumber,
      totalPages: Math.ceil(filteredShifts.length / pageSize),
      hasNextPage: pageNumber < Math.ceil(filteredShifts.length / pageSize),
      hasPreviousPage: pageNumber > 1,
      pageSize,
    }),
    [filteredShifts.length, pageNumber, pageSize],
  );

  const handleCloseShiftSubmit = useCallback(
    async (values: CloseShiftForm) => {
      setCloseLoading(true);
      try {
        const params: CloseShiftParams = {
          cashierShiftID: values.cashierShiftID,
          actualCash: values.actualCash,
          mpin: values.mpin,
          notes: values.notes || null,
        };
        const result = await closeShiftCb.execute(params);
        if (result?.data?.success) {
          showToast("Shift closed successfully", "success");
          setCloseTarget(null);
          if (onAfterClose) {
            await onAfterClose();
          } else {
            handleRefresh();
          }
          return;
        }
        const errorMsg =
          Array.isArray(result?.data?.errors) && result.data.errors.length > 0
            ? (result.data.errors as string[])[0]
            : result?.data?.message ?? "Failed to close shift";
        showToast(errorMsg, "error");
      } catch {
        showToast("Failed to close shift", "error");
      } finally {
        setCloseLoading(false);
      }
    },
    [closeShiftCb, handleRefresh, onAfterClose, showToast],
  );

  const handleClose = useCallback(
    (shift: CashierShiftDto) => {
      setDetailLoading(true);
      shiftDetailCb.execute(shift.cashierShiftID).then((res) => {
        const summary = res?.data?.response ?? undefined;
        setCloseTarget({ shift, summary });
        setDetailLoading(false);
      });
    },
    [shiftDetailCb],
  );

  const handleView = useCallback(
    (shift: CashierShiftDto) => {
      setDetailLoading(true);
      shiftDetailCb.execute(shift.cashierShiftID).then((res) => {
        const summary = res?.data?.response ?? null;
        if (summary) setViewTarget(summary);
        setDetailLoading(false);
      });
    },
    [shiftDetailCb],
  );

  return (
    <Box style={{ width: "100%" }}>
      {/* Active Shift Banner */}
      {activeShift && (
        <Card
          variant="surface"
          size="3"
          mb="4"
          style={{
            borderColor: "var(--indigo-a6)",
            background: "var(--green-a2)",
          }}
        >
          <Flex justify="between" align="start" gap="4" wrap="wrap">
            <Flex align="center" gap="3">
              <Box
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--radius-3)",
                  background: "var(--indigo-a3)",
                  color: "var(--indigo-11)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AccessTimeRounded />
              </Box>
              <Box>
                <Flex align="center" gap="2" mb="1">
                  <Text size="3" weight="bold">
                    Active Shift
                  </Text>
                  <Badge color={STATUS_CONFIG.Open.color} variant="soft" size="1">
                    {STATUS_CONFIG.Open.label}
                  </Badge>
                </Flex>
                <Text size="2" color="gray" as="div">
                  {activeShift.shiftNumber} · {activeShift.cashierName}
                </Text>
                <Text size="1" color="gray" as="div">
                  Opened {formatDateTime(activeShift.openedAt)}
                </Text>
              </Box>
            </Flex>

            <Flex align="center" gap="4" wrap="wrap">
              <Flex direction="column" align="center" gap="1">
                <Flex align="center" gap="1">
                  <AttachMoneyOutlined style={{ fontSize: 14, color: "var(--green-11)" }} />
                  <Text size="1" color="gray">
                    Cash Sales
                  </Text>
                </Flex>
                <Text size="3" weight="bold" style={{ color: "var(--green-11)" }}>
                  {formatCurrency(activeShift.cashSales)}
                </Text>
              </Flex>
              <Separator orientation="vertical" size="3" />
              <Flex direction="column" align="center" gap="1">
                <Flex align="center" gap="1">
                  <ReceiptLongOutlined style={{ fontSize: 14, color: "var(--blue-11)" }} />
                  <Text size="1" color="gray">
                    Transactions
                  </Text>
                </Flex>
                <Text size="3" weight="bold" style={{ color: "var(--blue-11)" }}>
                  {activeShift.transactionCount}
                </Text>
              </Flex>
              <Separator orientation="vertical" size="3" />
              <Flex direction="column" align="center" gap="1">
                <Flex align="center" gap="1">
                  <AccountBalanceWalletOutlined style={{ fontSize: 14, color: "var(--indigo-11)" }} />
                  <Text size="1" color="gray">
                    Expected Cash
                  </Text>
                </Flex>
                <Text size="3" weight="bold" style={{ color: "var(--indigo-11)" }}>
                  {formatCurrency(activeShift.expectedCash)}
                </Text>
              </Flex>
              <Separator orientation="vertical" size="3" />
              <Button
                color="red"
                variant="soft"
                size="2"
                onClick={() => handleClose(activeShift)}
                loading={detailLoading}
              >
                <LockOpenOutlined style={{ fontSize: 16 }} />
                Close Shift
              </Button>
            </Flex>
          </Flex>
        </Card>
      )}

      {/* History Card */}
      <Card variant="surface" size="3" mb="4">
        <HeaderV2
          title="Shift Management"
          subtitle={mode === "cashier" ? "Your shift history" : "All cashier shift records"}
        />

        <Flex gap="3" mt="4" wrap="wrap">
          <StatsCard label="Total Shifts" value={stats.total} color="primary" />
          <StatsCard label="Open" value={stats.open} color="success" />
          <StatsCard label="Closed" value={stats.closed} color="info" />
        </Flex>

        {mode !== "cashier" && (
          <Callout.Root color="blue" variant="surface" size="1" mt="4">
            <Callout.Icon><InfoCircledIcon /></Callout.Icon>
            <Callout.Text>
              Admin intervention is optional. Cashiers can close their own shift from the Cashier Portal.
              Use this panel to assist or intervene if a cashier forgot to close their shift.
            </Callout.Text>
          </Callout.Root>
        )}

        <Box
          mt="4"
          style={{
            display: "inline-flex",
            borderRadius: 999,
            border: "1px solid var(--gray-a4)",
            background: "var(--gray-a2)",
            padding: 3,
            gap: 2,
          }}
        >
          {STATUS_TABS.map((tab) => {
            const active = filters.statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => {
                  updateStatusFilter(tab.value);
                  setPageNumber(1);
                }}
                style={{
                  padding: "5px 14px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  background: active ? "var(--color-background)" : "transparent",
                  color: active ? "var(--accent-11)" : "var(--gray-11)",
                  boxShadow: active ? "var(--shadow-1)" : "none",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </Box>

        <Flex justify="between" align="center" gap="3" mt="3" wrap="wrap">
          <FilterBar
            searchValue={filters.searchTerm}
            onSearchChange={(value) => {
              updateFilter("searchTerm", value);
              setPageNumber(1);
            }}
            searchPlaceholder="Search by shift # or cashier…"
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPageNumber(1);
            }}
            resultCount={filteredShifts.length}
            resultLabel="shifts"
            pageSize={pageSize}
          />
          <Button
            variant="soft"
            color="gray"
            size="2"
            onClick={handleRefresh}
            disabled={shiftsData.loading || activeShiftData.loading}
          >
            <ReloadIcon />
            Refresh
          </Button>
        </Flex>
      </Card>

      <Card variant="surface" size="2" style={{ overflow: "hidden" }}>
        <ShiftList
          data={paginatedData}
          loading={shiftsData.loading}
          pagination={pagination}
          onNextPage={() => setPageNumber((p) => p + 1)}
          onPreviousPage={() => setPageNumber((p) => p - 1)}
          onView={handleView}
          onClose={handleClose}
          mode={mode}
        />
      </Card>

      {filteredShifts.length > 0 && (
        <Flex justify="between" align="center" mt="3" px="2">
          <Text size="2" color="gray">
            Showing {(pageNumber - 1) * pageSize + 1} to{" "}
            {Math.min(pageNumber * pageSize, filteredShifts.length)} of{" "}
            {filteredShifts.length} entries
          </Text>
        </Flex>
      )}

      {/* Close Shift Dialog */}
      <DialogBox
        open={!!closeTarget}
        onClose={() => setCloseTarget(null)}
        title={DIALOG_TITLES.close}
        maxWidth="sm"
        disableDismiss={closeLoading}
      >
        {closeTarget && (
          <CloseShiftFormBlock
            onSubmit={handleCloseShiftSubmit}
            submitLoading={closeLoading}
            initialValues={{ cashierShiftID: closeTarget.shift.cashierShiftID }}
            isInDialog
            shiftSummary={closeTarget.summary}
          />
        )}
      </DialogBox>

      {/* View Shift Dialog */}
      <DialogBox
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title={DIALOG_TITLES.view}
        maxWidth="sm"
      >
        {viewTarget && <ShiftDetailView summary={viewTarget} />}
      </DialogBox>
    </Box>
  );
};
