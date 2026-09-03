import React, { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Flex,
  Separator,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Spinner,
} from "@radix-ui/themes";;
import { ReceiptLongOutlined } from "@mui/icons-material";
import { DialogBox } from "core-lib/components/radix/dialog/DialogBox";
import { useApi } from "core-lib/core/hooks";
import { useOfflineMode } from "core-lib/core/contexts";
import { usePublicSettings } from "core-lib/core/contexts";
import {
  getPendingOfflineSales,
  type OfflineSaleRecord,
} from "core-lib/core/services/offlineDb";
import type { OrderDto } from "core-lib/api/commons/types";
import { formatCurrency, formatShortDate, todayIsoDate } from "../format";

// ─── Source badge helpers ─────────────────────────────────────────────────────

type SourceType = "Online" | "OfflinePending" | "OfflineSynced";

const SOURCE_BADGE: Record<
  SourceType,
  { label: string; color: "blue" | "orange" | "green" }
> = {
  Online: { label: "Online", color: "blue" },
  OfflinePending: { label: "Offline – Not Synced", color: "orange" },
  OfflineSynced: { label: "Offline – Synced", color: "green" },
};

const resolveSourceType = (source: number | undefined): SourceType => {
  if (source === 2) return "OfflineSynced";
  return "Online";
};

// ─── PosOrdersDialog ─────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

export const PosOrdersDialog: React.FC<Props> = ({ open, onClose }) => {
  const { isOnline, pendingSalesCount } = useOfflineMode();
  const { currencyCode } = usePublicSettings();
  const [pendingRecords, setPendingRecords] = useState<OfflineSaleRecord[]>([]);

  // Load offline-pending sales whenever the dialog opens or pending count changes.
  useEffect(() => {
    if (open) {
      getPendingOfflineSales().then(setPendingRecords);
    }
  }, [open, pendingSalesCount]);

  // Fetch today's recent orders from the server (only when online).
  const todayStr = todayIsoDate();
  const recentOrdersApi = useApi(
    (api) =>
      api.commons.orderList({
        pageNumber: 1,
        pageSize: 15,
        fromDate: todayStr,
        toDate: todayStr,
      }),
    [open, isOnline],
  );
  const serverOrders: OrderDto[] =
    isOnline ? (recentOrdersApi.result?.data?.response?.items ?? []) : [];

  const totalRows = pendingRecords.length + serverOrders.length;

  return (
    <DialogBox
      open={open}
      onClose={() => onClose()}
      title="Recent Orders"
      maxWidth="sm"
    >
      <Flex direction="column" gap="3">
        {!isOnline && (
          <Flex
            align="center"
            gap="2"
            px="3"
            py="2"
            style={{
              background: "var(--amber-a3)",
              borderRadius: "var(--radius-2)",
              border: "1px solid var(--amber-a6)",
            }}
          >
            <Text size="2" color="amber">
              Offline — showing queued sales only. Server orders unavailable.
            </Text>
          </Flex>
        )}

        {/* Pending offline rows */}
        {pendingRecords.length > 0 && (
          <>
            <Text size="1" weight="bold" color="gray" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
              Queued (not yet synced)
            </Text>
            <Flex direction="column" gap="1">
              {pendingRecords.map((record) => (
                <OfflinePendingRow
                  key={record.localId}
                  record={record}
                  currencyCode={currencyCode}
                />
              ))}
            </Flex>
            {serverOrders.length > 0 && <Separator size="4" />}
          </>
        )}

        {/* Server orders */}
        {isOnline && (
          <>
            {serverOrders.length > 0 && (
              <>
                <Text size="1" weight="bold" color="gray" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Today's orders
                </Text>
                <Flex direction="column" gap="1">
                  {serverOrders.map((order) => (
                    <ServerOrderRow
                      key={order.orderID}
                      order={order}
                      currencyCode={currencyCode}
                    />
                  ))}
                </Flex>
              </>
            )}
            {recentOrdersApi.loading && serverOrders.length === 0 && (
              <Flex align="center" gap="2" py="4" justify="center">
                <Spinner size="2" loading />
                <Text size="2" color="gray">Loading today's orders…</Text>
              </Flex>
            )}
          </>
        )}

        {totalRows === 0 && !recentOrdersApi.loading && (
          <Flex direction="column" align="center" justify="center" py="6" gap="2">
            <Box style={{ color: "var(--gray-9)" }}>
              <ReceiptLongOutlined style={{ fontSize: 36 }} />
            </Box>
            <Text size="2" color="gray">
              No orders yet today.
            </Text>
          </Flex>
        )}
      </Flex>
    </DialogBox>
  );
};

// ─── OfflinePendingRow ────────────────────────────────────────────────────────

const OfflinePendingRow: React.FC<{
  record: OfflineSaleRecord;
  currencyCode: string;
}> = ({ record, currencyCode }) => {
  const total = record.payload.payments.reduce((s, p) => s + p.amount, 0);
  const itemCount = record.payload.items.length;
  const badge = SOURCE_BADGE["OfflinePending"];

  return (
    <Flex
      align="center"
      justify="between"
      px="3"
      py="2"
      style={{
        borderRadius: "var(--radius-2)",
        background: "var(--amber-a2)",
        border: "1px solid var(--amber-a4)",
      }}
    >
      <Flex direction="column" gap="1">
        <Text size="2" weight="medium" style={{ fontVariantNumeric: "tabular-nums" }}>
          {record.localId.slice(0, 8).toUpperCase()}…
        </Text>
        <Text size="1" color="gray">
          {formatShortDate(record.createdAt)} · {itemCount} item{itemCount !== 1 ? "s" : ""}
        </Text>
      </Flex>
      <Flex align="center" gap="3">
        <Badge color={badge.color} variant="soft" radius="full" size="1">
          {badge.label}
        </Badge>
        <Text size="2" weight="medium" style={{ fontVariantNumeric: "tabular-nums" }}>
          {formatCurrency(total, currencyCode)}
        </Text>
      </Flex>
    </Flex>
  );
};

// ─── ServerOrderRow ───────────────────────────────────────────────────────────

const ServerOrderRow: React.FC<{
  order: OrderDto;
  currencyCode: string;
}> = ({ order, currencyCode }) => {
  const sourceType = resolveSourceType(order.source);
  const badge = SOURCE_BADGE[sourceType];

  return (
    <Flex
      align="center"
      justify="between"
      px="3"
      py="2"
      style={{
        borderRadius: "var(--radius-2)",
        background: "var(--gray-a2)",
        border: "1px solid var(--gray-a4)",
      }}
    >
      <Flex direction="column" gap="1">
        <Text size="2" weight="medium" style={{ fontVariantNumeric: "tabular-nums" }}>
          {order.orderNumber}
        </Text>
        <Text size="1" color="gray">
          {formatShortDate(order.completedAt)} · {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
        </Text>
      </Flex>
      <Flex align="center" gap="3">
        <Badge color={badge.color} variant="soft" radius="full" size="1">
          {badge.label}
        </Badge>
        <Text size="2" weight="medium" style={{ fontVariantNumeric: "tabular-nums" }}>
          {formatCurrency(order.totalAmount, currencyCode)}
        </Text>
      </Flex>
    </Flex>
  );
};
