import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Callout,
  Flex,
  Heading,
  IconButton,
  Select,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import {
  BlockOutlined,
  CheckCircleOutlineOutlined,
  MoneyOffOutlined,
  ReceiptLongOutlined,
  ReplayOutlined,
} from "@mui/icons-material";
import { useRouter } from "next/router";
import { HeaderV2 } from "core-lib/components/radix/header/HeaderV2";
import { Button } from "core-lib/components/radix/buttons/Button";
import { useApi } from "core-lib/core/hooks";
import { useDialogContext } from "core-lib";
import { usePublicSettings, useOfflineMode } from "core-lib/core/contexts";
import {
  getPendingOfflineSales,
  type OfflineSaleRecord,
} from "core-lib/core/services/offlineDb";
import type { OrderDetailDialogData } from "core-lib/api/content/types/common";
import {
  OrderDto,
  OrderQueryParams,
  SaleDetailDto,
  SaleStatusDto,
} from "core-lib/api/commons/types";
import { SaleReceiptPrintable } from "../printables/SaleReceiptPrintable";
import { formatCurrency, formatShortDate, todayIsoDate } from "../format";

// ─── types ────────────────────────────────────────────────────────────────────

type StatusFilter = "all" | SaleStatusDto;

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: SaleStatusDto.Completed, label: "Completed" },
  { value: SaleStatusDto.Voided, label: "Voided" },
  { value: SaleStatusDto.PartiallyRefunded, label: "Partially Refunded" },
  { value: SaleStatusDto.FullyRefunded, label: "Fully Refunded" },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50];

// ─── helpers ──────────────────────────────────────────────────────────────────

type BadgeColor = "green" | "red" | "amber" | "blue" | "gray";

const STATUS_BADGE: Record<SaleStatusDto, { color: BadgeColor; label: string; icon: React.ReactNode }> = {
  [SaleStatusDto.Completed]: {
    color: "green",
    label: "Completed",
    icon: <CheckCircleOutlineOutlined style={{ fontSize: 12 }} />,
  },
  [SaleStatusDto.Voided]: {
    color: "red",
    label: "Voided",
    icon: <BlockOutlined style={{ fontSize: 12 }} />,
  },
  [SaleStatusDto.PartiallyRefunded]: {
    color: "amber",
    label: "Partial Refund",
    icon: <ReplayOutlined style={{ fontSize: 12 }} />,
  },
  [SaleStatusDto.FullyRefunded]: {
    color: "blue",
    label: "Fully Refunded",
    icon: <MoneyOffOutlined style={{ fontSize: 12 }} />,
  },
};

// ─── Source badge ─────────────────────────────────────────────────────────────

type SourceType = "Online" | "OfflinePending" | "OfflineSynced";

const SOURCE_BADGE: Record<
  SourceType,
  { label: string; color: "blue" | "orange" | "green" }
> = {
  Online: { label: "Online", color: "blue" },
  OfflinePending: { label: "Offline – Not Yet Synced", color: "orange" },
  OfflineSynced: { label: "Offline – Synced", color: "green" },
};

const resolveSourceType = (source: number | undefined): SourceType => {
  if (source === 2) return "OfflineSynced";
  return "Online";
};

// ─── OrdersBlock ──────────────────────────────────────────────────────────────

export const OrdersBlock: React.FC = () => {
  const { currencyCode, pos, systemName, theme } = usePublicSettings();
  const { openDialog } = useDialogContext();
  const router = useRouter();
  const { pendingSalesCount } = useOfflineMode();

  const [pendingOfflineSales, setPendingOfflineSales] = useState<
    OfflineSaleRecord[]
  >([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  // Load pending offline sales from IndexedDB; refresh when count changes (e.g. after sync).
  useEffect(() => {
    getPendingOfflineSales().then(setPendingOfflineSales);
  }, [pendingSalesCount]);

  // Pre-fill date filter from URL query params (e.g. ?fromDate=2026-06-09&toDate=2026-06-09).
  // Runs once on mount so direct links from the POS target sales dialog land filtered.
  useEffect(() => {
    const { fromDate: qFrom, toDate: qTo } = router.query;
    if (typeof qFrom === "string" && qFrom) setFromDate(qFrom);
    if (typeof qTo === "string" && qTo) setToDate(qTo);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const queryParams = useMemo<OrderQueryParams>(
    () => ({
      pageNumber,
      pageSize,
      ...(statusFilter !== "all" && { status: statusFilter }),
      ...(search.trim() && { search: search.trim() }),
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
    }),
    [pageNumber, pageSize, statusFilter, search, fromDate, toDate],
  );

  const listApi = useApi(
    (api) => api.commons.orderList(queryParams),
    [queryParams, reloadToken],
  );

  const orders: OrderDto[] = useMemo(
    () => listApi.result?.data?.response?.items ?? [],
    [listApi.result],
  );
  const pagination = listApi.result?.data?.response;
  const totalItems = pagination?.totalItems ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  const handleSearch = useCallback(() => {
    setSearch(searchInput);
    setPageNumber(1);
  }, [searchInput]);

  const handleRefresh = useCallback(() => {
    setReloadToken((n) => n + 1);
    setPageNumber(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setStatusFilter("all");
    setSearch("");
    setSearchInput("");
    setFromDate("");
    setToDate("");
    setPageNumber(1);
    setReloadToken((n) => n + 1);
  }, []);

  const renderReceipt = useCallback(
    (sale: SaleDetailDto) => (
      <SaleReceiptPrintable
        sale={sale}
        businessName={systemName}
        logoUrl={theme?.logoUrl ?? null}
        currencyCode={currencyCode}
        receiptHeader={pos.receiptHeader}
        receiptFooter={pos.receiptFooter}
      />
    ),
    [systemName, theme, currencyCode, pos],
  );

  const handleRowClick = useCallback(
    (order: OrderDto) => {
      openDialog({
        title: `Order · ${order.orderNumber}`,
        dialogContentType: "OrderDetail",
        data: {
          orderID: order.orderID,
          renderReceipt,
          onStateChange: () => setReloadToken((n) => n + 1),
        } as OrderDetailDialogData,
      });
    },
    [openDialog, renderReceipt],
  );

  const hasFilters =
    statusFilter !== "all" || !!search || !!fromDate || !!toDate;

  return (
    <Box p="4">
      <HeaderV2
        title="Orders"
        subtitle="View, reprint, void and refund transactions."
        icon={<ReceiptLongOutlined />}
      />

      {/* Filter bar */}
      <Box
        p="3"
        mb="4"
        style={{
          borderRadius: "var(--radius-3)",
          background: "var(--gray-a2)",
          border: "1px solid var(--gray-a4)",
        }}
      >
        <Flex gap="2" wrap="wrap" align="end">
          {/* Search */}
          <Box style={{ flex: "2 1 180px", minWidth: 160 }}>
            <Text size="1" color="gray" as="div" mb="1">
              Search
            </Text>
            <TextField.Root
              size="2"
              placeholder="Order # or cashier name…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            >
              <TextField.Slot>
                <MagnifyingGlassIcon />
              </TextField.Slot>
            </TextField.Root>
          </Box>

          {/* Status */}
          <Box style={{ flex: "1 1 150px", minWidth: 140 }}>
            <Text size="1" color="gray" as="div" mb="1">
              Status
            </Text>
            <Select.Root
              size="2"
              value={String(statusFilter)}
              onValueChange={(v) => {
                setStatusFilter(v === "all" ? "all" : (Number(v) as SaleStatusDto));
                setPageNumber(1);
              }}
            >
              <Select.Trigger style={{ width: "100%" }} />
              <Select.Content position="popper">
                {STATUS_OPTIONS.map((o) => (
                  <Select.Item key={String(o.value)} value={String(o.value)}>
                    {o.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>

          {/* From date */}
          <Box style={{ flex: "1 1 130px", minWidth: 120 }}>
            <Text size="1" color="gray" as="div" mb="1">
              From date
            </Text>
            <TextField.Root
              size="2"
              type="date"
              value={fromDate}
              max={toDate || todayIsoDate()}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPageNumber(1);
              }}
            />
          </Box>

          {/* To date */}
          <Box style={{ flex: "1 1 130px", minWidth: 120 }}>
            <Text size="1" color="gray" as="div" mb="1">
              To date
            </Text>
            <TextField.Root
              size="2"
              type="date"
              value={toDate}
              min={fromDate || undefined}
              max={todayIsoDate()}
              onChange={(e) => {
                setToDate(e.target.value);
                setPageNumber(1);
              }}
            />
          </Box>

          {/* Actions */}
          <Flex gap="2" align="center" style={{ paddingTop: 20 }}>
            <Button type="Primary" onClick={handleSearch}>
              Search
            </Button>
            <IconButton
              variant="soft"
              color="gray"
              onClick={handleRefresh}
              disabled={listApi.loading}
              title="Refresh"
            >
              <ReloadIcon />
            </IconButton>
            {hasFilters && (
              <Button type="Secondary" onClick={handleClearFilters}>
                Clear
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* Error */}
      {listApi.error && (
        <Callout.Root color="red" variant="surface" mb="4">
          <Callout.Text>Failed to load orders. Try refreshing.</Callout.Text>
        </Callout.Root>
      )}

      {/* Table header */}
      <Box
        style={{
          borderRadius: "var(--radius-3)",
          border: "1px solid var(--gray-a4)",
          overflow: "hidden",
        }}
      >
        {/* Column headers */}
        <Box
          px="3"
          py="2"
          style={{
            background: "var(--gray-a2)",
            borderBottom: "1px solid var(--gray-a4)",
          }}
        >
          <Flex gap="3" align="center">
            <Text size="1" weight="bold" color="gray" style={{ flex: "2 1 100px", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Order #
            </Text>
            <Text size="1" weight="bold" color="gray" style={{ flex: "1 1 80px", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Date
            </Text>
            <Text size="1" weight="bold" color="gray" style={{ flex: "1 1 100px", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Cashier
            </Text>
            <Text size="1" weight="bold" color="gray" style={{ flex: "1 1 100px", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Payment
            </Text>
            <Text size="1" weight="bold" color="gray" style={{ flex: "1 1 80px", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Status
            </Text>
            <Text size="1" weight="bold" color="gray" style={{ flex: "1 1 90px", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Source
            </Text>
            <Text
              size="1"
              weight="bold"
              color="gray"
              style={{ flex: "1 1 80px", textTransform: "uppercase", letterSpacing: 0.5, textAlign: "right" }}
            >
              Total
            </Text>
          </Flex>
        </Box>

        {/* Rows */}
        {listApi.loading && orders.length === 0 && pendingOfflineSales.length === 0 ? (
          <Flex align="center" justify="center" p="6" gap="2">
            <Text color="gray" size="2">
              Loading orders…
            </Text>
          </Flex>
        ) : orders.length === 0 && pendingOfflineSales.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClear={handleClearFilters} />
        ) : (
          <>
            {pendingOfflineSales.map((record, idx) => (
              <OfflinePendingRow
                key={record.localId}
                record={record}
                currencyCode={currencyCode}
                striped={idx % 2 === 1}
              />
            ))}
            {orders.map((order, idx) => (
              <OrderRow
                key={order.orderID}
                order={order}
                currencyCode={currencyCode}
                striped={(pendingOfflineSales.length + idx) % 2 === 1}
                onClick={() => handleRowClick(order)}
              />
            ))}
          </>
        )}

        {/* Pagination footer */}
        {(orders.length > 0 || pendingOfflineSales.length > 0) && (
          <>
            <Separator size="4" />
            <Flex
              align="center"
              justify="between"
              px="3"
              py="2"
              gap="3"
              wrap="wrap"
              style={{ background: "var(--gray-a1)" }}
            >
              <Flex align="center" gap="2">
                <Text size="1" color="gray">
                  Showing {orders.length} of {totalItems} order{totalItems === 1 ? "" : "s"}
                </Text>
                <Select.Root
                  size="1"
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(Number(v));
                    setPageNumber(1);
                  }}
                >
                  <Select.Trigger />
                  <Select.Content position="popper">
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <Select.Item key={n} value={String(n)}>
                        {n} / page
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Flex>

              <Flex align="center" gap="2">
                <IconButton
                  variant="soft"
                  color="gray"
                  size="1"
                  disabled={pageNumber <= 1 || listApi.loading}
                  onClick={() => setPageNumber((p) => p - 1)}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <Text size="1" color="gray" style={{ minWidth: 60, textAlign: "center" }}>
                  {pageNumber} / {totalPages}
                </Text>
                <IconButton
                  variant="soft"
                  color="gray"
                  size="1"
                  disabled={pageNumber >= totalPages || listApi.loading}
                  onClick={() => setPageNumber((p) => p + 1)}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Flex>
            </Flex>
          </>
        )}
      </Box>
    </Box>
  );
};

// ─── OrderRow ─────────────────────────────────────────────────────────────────

const OrderRow: React.FC<{
  order: OrderDto;
  currencyCode: string;
  striped: boolean;
  onClick: () => void;
}> = ({ order, currencyCode, striped, onClick }) => {
  const statusInfo = STATUS_BADGE[order.status] ?? {
    color: "gray" as BadgeColor,
    label: order.statusName,
    icon: null,
  };
  const isVoided = order.status === SaleStatusDto.Voided;
  const hasRefund = order.refundedAmount > 0;

  return (
    <Flex
      gap="3"
      align="center"
      px="3"
      py="3"
      onClick={onClick}
      style={{
        cursor: "pointer",
        background: striped ? "var(--gray-a1)" : undefined,
        borderBottom: "1px solid var(--gray-a3)",
        transition: "background 0.12s ease",
        opacity: isVoided ? 0.65 : 1,
      }}
      className="order-row"
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background =
          "var(--accent-a2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = striped
          ? "var(--gray-a1)"
          : "";
      }}
    >
      {/* Order number */}
      <Box style={{ flex: "2 1 100px", minWidth: 0 }}>
        <Text
          size="2"
          weight="medium"
          as="div"
          truncate
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {order.orderNumber}
        </Text>
        <Text size="1" color="gray" as="div">
          {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
        </Text>
      </Box>

      {/* Date */}
      <Box style={{ flex: "1 1 80px", minWidth: 0 }}>
        <Text size="2" color="gray" as="div" truncate>
          {formatShortDate(order.completedAt)}
        </Text>
      </Box>

      {/* Cashier */}
      <Box style={{ flex: "1 1 100px", minWidth: 0 }}>
        <Text size="2" color="gray" as="div" truncate>
          {order.cashierName}
        </Text>
      </Box>

      {/* Payment summary */}
      <Box style={{ flex: "1 1 100px", minWidth: 0 }}>
        <Text size="2" color="gray" as="div" truncate>
          {order.paymentSummary}
        </Text>
      </Box>

      {/* Status */}
      <Box style={{ flex: "1 1 80px" }}>
        <Badge
          color={statusInfo.color}
          variant="soft"
          radius="full"
          size="1"
        >
          <Flex align="center" gap="1">
            {statusInfo.icon}
            {statusInfo.label}
          </Flex>
        </Badge>
        {hasRefund && (
          <Text size="1" color="red" as="div" mt="1">
            − {formatCurrency(order.refundedAmount, currencyCode)}
          </Text>
        )}
      </Box>

      {/* Source */}
      <Box style={{ flex: "1 1 90px" }}>
        {(() => {
          const st = resolveSourceType(order.source);
          const sb = SOURCE_BADGE[st];
          return (
            <Badge color={sb.color} variant="soft" radius="full" size="1">
              {sb.label}
            </Badge>
          );
        })()}
      </Box>

      {/* Total */}
      <Box style={{ flex: "1 1 80px", textAlign: "right" }}>
        <Text
          size="2"
          weight="medium"
          as="div"
          style={{
            fontVariantNumeric: "tabular-nums",
            ...(isVoided ? { color: "var(--gray-9)", textDecoration: "line-through" } : undefined),
          }}
        >
          {formatCurrency(order.totalAmount, currencyCode)}
        </Text>
      </Box>
    </Flex>
  );
};

// ─── OfflinePendingRow ────────────────────────────────────────────────────────

const OfflinePendingRow: React.FC<{
  record: OfflineSaleRecord;
  currencyCode: string;
  striped: boolean;
}> = ({ record, currencyCode, striped }) => {
  const total = record.payload.payments.reduce((s, p) => s + p.amount, 0);
  const itemCount = record.payload.items.length;
  const sourceBadge = SOURCE_BADGE["OfflinePending"];

  return (
    <Flex
      gap="3"
      align="center"
      px="3"
      py="3"
      style={{
        background: striped ? "var(--amber-a2)" : "var(--amber-a1)",
        borderBottom: "1px solid var(--gray-a3)",
        opacity: 0.9,
      }}
    >
      {/* "Order #" placeholder */}
      <Box style={{ flex: "2 1 100px", minWidth: 0 }}>
        <Text size="2" weight="medium" as="div" truncate style={{ fontVariantNumeric: "tabular-nums", color: "var(--amber-11)" }}>
          {record.localId.slice(0, 8).toUpperCase()}…
        </Text>
        <Text size="1" color="gray" as="div">
          {itemCount} item{itemCount === 1 ? "" : "s"} · Not synced
        </Text>
      </Box>

      {/* Date */}
      <Box style={{ flex: "1 1 80px", minWidth: 0 }}>
        <Text size="2" color="gray" as="div" truncate>
          {formatShortDate(record.createdAt)}
        </Text>
      </Box>

      {/* Cashier */}
      <Box style={{ flex: "1 1 100px", minWidth: 0 }}>
        <Text size="2" color="gray" as="div" truncate>
          —
        </Text>
      </Box>

      {/* Payment */}
      <Box style={{ flex: "1 1 100px", minWidth: 0 }}>
        <Text size="2" color="gray" as="div" truncate>
          —
        </Text>
      </Box>

      {/* Status */}
      <Box style={{ flex: "1 1 80px" }}>
        <Badge color="gray" variant="soft" radius="full" size="1">
          Pending
        </Badge>
      </Box>

      {/* Source */}
      <Box style={{ flex: "1 1 90px" }}>
        <Badge color={sourceBadge.color} variant="soft" radius="full" size="1">
          {sourceBadge.label}
        </Badge>
      </Box>

      {/* Total */}
      <Box style={{ flex: "1 1 80px", textAlign: "right" }}>
        <Text size="2" weight="medium" as="div" style={{ fontVariantNumeric: "tabular-nums" }}>
          {formatCurrency(total, currencyCode)}
        </Text>
      </Box>
    </Flex>
  );
};

// ─── EmptyState ───────────────────────────────────────────────────────────────

const EmptyState: React.FC<{
  hasFilters: boolean;
  onClear: () => void;
}> = ({ hasFilters, onClear }) => (
  <Flex direction="column" align="center" justify="center" p="8" gap="3">
    <Box
      style={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "var(--gray-a3)",
        color: "var(--gray-9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ReceiptLongOutlined style={{ fontSize: 28 }} />
    </Box>
    <Box style={{ textAlign: "center" }}>
      <Heading size="3" color="gray">
        {hasFilters ? "No orders match these filters" : "No orders yet"}
      </Heading>
      <Text size="2" color="gray" as="div" mt="1">
        {hasFilters
          ? "Try adjusting the date range, status, or search term."
          : "Completed transactions will appear here."}
      </Text>
    </Box>
    {hasFilters && (
      <Button type="Secondary" onClick={onClear}>
        Clear filters
      </Button>
    )}
  </Flex>
);
