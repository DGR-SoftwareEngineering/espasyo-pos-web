import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Badge,
  Box,
  Callout,
  Flex,
  Heading,
  Select,
  Separator,
  Spinner,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  BlockOutlined,
  CheckCircleOutlineOutlined,
  EventOutlined,
  KeyOutlined,
  MoneyOffOutlined,
  PersonOutlineOutlined,
  PrintOutlined,
  ReceiptLongOutlined,
  ReplayOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import { Button } from "../../../radix/buttons/Button";
import { MpinInput, isValidMpin } from "../../../radix/security";
import { useApi, useApiCallback } from "../../../../core/hooks";
import {
  useToastContext,
  usePublicSettings,
  useAccessContext,
} from "../../../../core/contexts";
import { PRINT_PORTAL_CLASS, PRINT_TARGET_CLASS } from "../../../print";
import type { OrderDetailDialogData } from "../../../../api/content/types/common";
import {
  RoleDto,
  SaleDetailDto,
  SaleItemDto,
  SalesPaymentMethodDto,
  SaleStatusDto,
  UserDto,
  VoidSaleParams,
  RefundSaleParams,
} from "../../../../api/commons/types";

// ─── constants ────────────────────────────────────────────────────────────────

const REASON_MIN = 3;
const REASON_MAX = 500;

const PAYMENT_LABEL: Record<SalesPaymentMethodDto, string> = {
  [SalesPaymentMethodDto.Cash]: "Cash",
  [SalesPaymentMethodDto.Card]: "Card",
  [SalesPaymentMethodDto.GCash]: "GCash",
  [SalesPaymentMethodDto.Maya]: "Maya",
  [SalesPaymentMethodDto.BankTransfer]: "Bank",
  [SalesPaymentMethodDto.StoreCredit]: "Store Credit",
  [SalesPaymentMethodDto.Other]: "Other",
};

const PAYMENT_COLOR: Record<
  SalesPaymentMethodDto,
  "green" | "indigo" | "blue" | "violet" | "iris" | "amber" | "gray"
> = {
  [SalesPaymentMethodDto.Cash]: "green",
  [SalesPaymentMethodDto.Card]: "indigo",
  [SalesPaymentMethodDto.GCash]: "blue",
  [SalesPaymentMethodDto.Maya]: "violet",
  [SalesPaymentMethodDto.BankTransfer]: "iris",
  [SalesPaymentMethodDto.StoreCredit]: "amber",
  [SalesPaymentMethodDto.Other]: "gray",
};

type StatusConfig = {
  color: string;
  bgGradient: string;
  border: string;
  icon: React.ReactNode;
  label: string;
  badgeColor: "green" | "red" | "amber" | "blue";
};

const STATUS_CONFIG: Record<SaleStatusDto, StatusConfig> = {
  [SaleStatusDto.Completed]: {
    color: "var(--green-11)",
    bgGradient: "linear-gradient(135deg, var(--green-a3) 0%, var(--teal-a2) 100%)",
    border: "1px solid var(--green-a5)",
    icon: <CheckCircleOutlineOutlined style={{ fontSize: 26 }} />,
    label: "Completed",
    badgeColor: "green",
  },
  [SaleStatusDto.Voided]: {
    color: "var(--red-11)",
    bgGradient: "var(--red-a2)",
    border: "1px solid var(--red-a4)",
    icon: <BlockOutlined style={{ fontSize: 26 }} />,
    label: "Voided",
    badgeColor: "red",
  },
  [SaleStatusDto.PartiallyRefunded]: {
    color: "var(--amber-11)",
    bgGradient: "linear-gradient(135deg, var(--amber-a3) 0%, var(--orange-a2) 100%)",
    border: "1px solid var(--amber-a5)",
    icon: <ReplayOutlined style={{ fontSize: 26 }} />,
    label: "Partially Refunded",
    badgeColor: "amber",
  },
  [SaleStatusDto.FullyRefunded]: {
    color: "var(--blue-11)",
    bgGradient: "linear-gradient(135deg, var(--blue-a3) 0%, var(--indigo-a2) 100%)",
    border: "1px solid var(--blue-a5)",
    icon: <MoneyOffOutlined style={{ fontSize: 26 }} />,
    label: "Fully Refunded",
    badgeColor: "blue",
  },
};

// ─── helpers ──────────────────────────────────────────────────────────────────

const formatCurrencyShort = (n: number, code: string): string => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${code} ${n.toFixed(2)}`;
  }
};

const formatLongDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const fullName = (user: UserDto): string => {
  const info = user.userInfo;
  const parts = [info?.firstName, info?.middleName, info?.lastName]
    .map((s) => (s ?? "").trim())
    .filter(Boolean);
  return parts.join(" ") || user.username || user.userID;
};

const extractError = (raw: string): string =>
  raw.replace(/^\[[A-Z][A-Z0-9._]*\]\s*/, "");

const mapVoidError = (raw: string): string => {
  const code = raw.match(/^\[([A-Z][A-Z0-9._]*)\]/)?.[1] ?? null;
  const msg = extractError(raw);
  switch (code) {
    case "POS.MANAGER_OVERRIDE_REQUIRED":
      return "Manager approval is required. Pick the manager on shift and enter their MPIN.";
    case "POS.MANAGER_OVERRIDE_FAILED":
      return "Manager MPIN didn't match. Double-check and try again.";
    case "SALE.INVALID_STATE_FOR_VOID":
      return "This order can no longer be voided — it may have already been voided or refunded.";
    case "SALE.HAS_REFUNDS":
      return "This order has active refunds. Reverse those first, then try voiding again.";
    default:
      return msg || "Failed to void order.";
  }
};

const mapRefundError = (raw: string): string => {
  const code = raw.match(/^\[([A-Z][A-Z0-9._]*)\]/)?.[1] ?? null;
  const msg = extractError(raw);
  switch (code) {
    case "POS.REFUNDS_DISABLED":
      return "Refunds are currently disabled by the administrator.";
    case "POS.MANAGER_OVERRIDE_REQUIRED":
      return "Manager approval is required. Pick the manager on shift and enter their MPIN.";
    case "POS.MANAGER_OVERRIDE_FAILED":
      return "Manager MPIN didn't match. Double-check and try again.";
    case "SALE.INVALID_STATE_FOR_REFUND":
      return "This order cannot be refunded in its current state.";
    case "REFUND.INVALID_LINE":
      return "One or more selected items are not on this order.";
    case "REFUND.QUANTITY_EXCEEDED":
      return msg || "Refund quantity exceeds the remaining refundable amount.";
    default:
      return msg || "Failed to process refund.";
  }
};

// ─── OrderDetailDialogContent ─────────────────────────────────────────────────

type View = "receipt" | "voiding" | "refunding";

interface Props {
  data: OrderDetailDialogData;
  onClose: () => void;
}

export const OrderDetailDialogContent: React.FC<Props> = ({ data, onClose }) => {
  const { currencyCode, pos } = usePublicSettings();
  const { permissions } = useAccessContext();
  const [view, setView] = useState<View>("receipt");
  const [overrideOrder, setOverrideOrder] = useState<SaleDetailDto | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const orderApi = useApi(
    (api) => api.commons.getOrderById(data.orderID),
    [data.orderID],
  );

  const currentOrder: SaleDetailDto | null =
    overrideOrder ?? orderApi.result?.data?.response ?? null;

  const isSameDay = !!currentOrder &&
    (currentOrder.completedAt ?? currentOrder.saleDate ?? "").slice(0, 10) ===
      new Date().toISOString().slice(0, 10);

  const allItemsHaveStockMovements = !!currentOrder &&
    currentOrder.items.length > 0 &&
    currentOrder.items.every((item) => item.stockMovementIDs.length > 0);

  const canVoid =
    !!currentOrder &&
    isSameDay &&
    (permissions["orders"]?.edit ?? false) &&
    currentOrder.status === SaleStatusDto.Completed;

  const canRefund =
    !!currentOrder &&
    (permissions["orders"]?.delete ?? false) &&
    pos.allowRefund &&
    (currentOrder.status === SaleStatusDto.Completed ||
      currentOrder.status === SaleStatusDto.PartiallyRefunded);

  const handleStateChange = useCallback(
    (updated: SaleDetailDto) => {
      setOverrideOrder(updated);
      setView("receipt");
      data.onStateChange?.(updated);
    },
    [data],
  );

  const handlePrint = useCallback(() => {
    setTimeout(() => window.print(), 0);
  }, []);

  if (orderApi.loading && !currentOrder) {
    return (
      <Flex align="center" justify="center" p="6" gap="3">
        <Spinner size="3" loading />
        <Text color="gray" size="2">
          Loading order…
        </Text>
      </Flex>
    );
  }

  if (orderApi.error && !currentOrder) {
    return (
      <Box p="4">
        <Callout.Root color="red" variant="surface">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            Failed to load order. Please close and try again.
          </Callout.Text>
        </Callout.Root>
        <Flex justify="end" mt="3">
          <Button type="Secondary" onClick={onClose}>
            Close
          </Button>
        </Flex>
      </Box>
    );
  }

  if (!currentOrder) return null;

  return (
    <>
      {view === "receipt" && (
        <ReceiptView
          order={currentOrder}
          currencyCode={currencyCode}
          canVoid={canVoid}
          canRefund={canRefund}
          hasUntrackedItems={!allItemsHaveStockMovements}
          onPrint={handlePrint}
          onVoid={() => setView("voiding")}
          onRefund={() => setView("refunding")}
          receiptContent={data.renderReceipt(currentOrder)}
        />
      )}

      {view === "voiding" && (
        <VoidView
          order={currentOrder}
          currencyCode={currencyCode}
          onSuccess={handleStateChange}
          onCancel={() => setView("receipt")}
        />
      )}

      {view === "refunding" && (
        <RefundView
          order={currentOrder}
          currencyCode={currencyCode}
          onSuccess={handleStateChange}
          onCancel={() => setView("receipt")}
        />
      )}

      {mounted &&
        view === "receipt" &&
        createPortal(
          <div className={PRINT_PORTAL_CLASS}>
            <div className={PRINT_TARGET_CLASS}>
              {data.renderReceipt(currentOrder)}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

// ─── ReceiptView ──────────────────────────────────────────────────────────────

const ReceiptView: React.FC<{
  order: SaleDetailDto;
  currencyCode: string;
  canVoid: boolean;
  canRefund: boolean;
  hasUntrackedItems: boolean;
  onPrint: () => void;
  onVoid: () => void;
  onRefund: () => void;
  receiptContent: React.ReactNode;
}> = ({
  order,
  currencyCode,
  canVoid,
  canRefund,
  hasUntrackedItems,
  onPrint,
  onVoid,
  onRefund,
  receiptContent,
}) => {
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG[SaleStatusDto.Completed];
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  const paymentMethods = useMemo(() => {
    const seen = new Set<SalesPaymentMethodDto>();
    return order.payments.filter((p) => {
      if (seen.has(p.method)) return false;
      seen.add(p.method);
      return true;
    });
  }, [order.payments]);

  const isVoided = order.status === SaleStatusDto.Voided;
  const hasRefunds = order.refunds.length > 0;

  return (
    <Box>
      {/* Status banner */}
      <Flex
        align="center"
        gap="3"
        p="3"
        mb="3"
        style={{
          borderRadius: "var(--radius-3)",
          background: cfg.bgGradient,
          border: cfg.border,
        }}
      >
        <Box
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: isVoided ? "var(--red-a4)" : "var(--color-surface)",
            color: cfg.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: `inset 0 0 0 1px ${isVoided ? "var(--red-a6)" : "var(--gray-a5)"}`,
          }}
        >
          {cfg.icon}
        </Box>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Flex align="center" gap="2">
            <Heading size="4" weight="bold" style={{ color: cfg.color }}>
              {cfg.label}
            </Heading>
          </Flex>
          <Text size="2" color="gray" as="div" mt="1">
            {order.saleNumber} · {formatLongDate(order.completedAt)}
          </Text>
        </Box>

        <Box style={{ textAlign: "right", flexShrink: 0 }}>
          <Heading
            size="6"
            style={{
              fontVariantNumeric: "tabular-nums",
              color: cfg.color,
            }}
          >
            {formatCurrencyShort(order.totalAmount, currencyCode)}
          </Heading>
          <Text size="1" color="gray" as="div">
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </Text>
        </Box>
      </Flex>

      {/* Meta row */}
      <Flex gap="3" align="center" wrap="wrap" mb="3">
        <Flex align="center" gap="2">
          <PersonOutlineOutlined fontSize="small" style={{ color: "var(--gray-9)" }} />
          <Text size="2" color="gray">
            {order.cashierName}
          </Text>
        </Flex>
        {paymentMethods.length > 0 && (
          <Flex gap="2" wrap="wrap" align="center">
            {paymentMethods.map((p) => (
              <Badge
                key={p.salePaymentID}
                color={PAYMENT_COLOR[p.method] ?? "gray"}
                variant="soft"
                radius="full"
                size="1"
              >
                {PAYMENT_LABEL[p.method] ?? p.methodName}
              </Badge>
            ))}
          </Flex>
        )}
        {order.refundedAmount > 0 && (
          <Badge color="red" variant="soft" radius="full" size="1">
            − {formatCurrencyShort(order.refundedAmount, currencyCode)} refunded
          </Badge>
        )}
      </Flex>

      {/* Void metadata */}
      {isVoided && order.voidedAt && (
        <Box
          p="3"
          mb="3"
          style={{
            borderRadius: "var(--radius-3)",
            background: "var(--red-a2)",
            border: "1px solid var(--red-a4)",
          }}
        >
          <Flex gap="4" wrap="wrap">
            <StatCell
              label="Voided at"
              value={formatLongDate(order.voidedAt)}
            />
            {order.voidedByUserName && (
              <StatCell label="Voided by" value={order.voidedByUserName} />
            )}
            {order.voidReason && (
              <StatCell label="Reason" value={order.voidReason} />
            )}
          </Flex>
        </Box>
      )}

      {/* Refunds summary */}
      {hasRefunds && (
        <Box
          p="3"
          mb="3"
          style={{
            borderRadius: "var(--radius-3)",
            background: "var(--amber-a2)",
            border: "1px solid var(--amber-a4)",
          }}
        >
          <Text
            size="1"
            weight="bold"
            as="div"
            mb="2"
            style={{ textTransform: "uppercase", letterSpacing: 0.6, color: "var(--amber-11)" }}
          >
            Refunds ({order.refunds.length})
          </Text>
          <Flex direction="column" gap="2">
            {order.refunds.map((r) => (
              <Flex key={r.refundID} justify="between" align="baseline">
                <Box>
                  <Text size="2" weight="medium">
                    {r.refundNumber}
                  </Text>
                  <Text size="1" color="gray" as="div">
                    {formatLongDate(r.createdAt ?? "")} · by {r.refundedByUserName}
                  </Text>
                  <Text size="1" color="gray" as="div">
                    {r.reason}
                  </Text>
                </Box>
                <Text size="2" weight="bold" style={{ color: "var(--red-11)" }}>
                  − {formatCurrencyShort(r.totalAmount, "")}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      )}

      {/* Warning: Untracked items won't have inventory adjusted on void */}
      {hasUntrackedItems && (
        <Callout.Root color="amber" mb="4">
          <Callout.Icon>
            <WarningAmberOutlined />
          </Callout.Icon>
          <Callout.Text>
            This order contains items sold without recipe/stock tracking. If voided, inventory will not be adjusted for these items.
          </Callout.Text>
        </Callout.Root>
      )}

      {/* Actions */}
      <Flex gap="2" mb="4" wrap="wrap">
        <Button type="Primary" onClick={onPrint}>
          <Flex align="center" gap="2">
            <PrintOutlined fontSize="small" /> Print / Save PDF
          </Flex>
        </Button>
        {canVoid && (
          <Button type="Critical" onClick={onVoid}>
            <Flex align="center" gap="2">
              <BlockOutlined fontSize="small" /> Void order
            </Flex>
          </Button>
        )}
        {canRefund && (
          <Button type="Secondary" onClick={onRefund}>
            <Flex align="center" gap="2">
              <ReplayOutlined fontSize="small" /> Refund
            </Flex>
          </Button>
        )}
      </Flex>

      <Separator size="4" mb="4" />

      {/* Receipt content */}
      {receiptContent}
    </Box>
  );
};

// ─── VoidView ─────────────────────────────────────────────────────────────────

const VoidView: React.FC<{
  order: SaleDetailDto;
  currencyCode: string;
  onSuccess: (updated: SaleDetailDto) => void;
  onCancel: () => void;
}> = ({ order, currencyCode, onSuccess, onCancel }) => {
  const { showToast } = useToastContext();
  const { pos } = usePublicSettings();
  const requireManager = pos.requireManagerOverrideForRefund;

  const [reason, setReason] = useState("");
  const [reasonTouched, setReasonTouched] = useState(false);
  const [managerUserID, setManagerUserID] = useState("");
  const [managerMpin, setManagerMpin] = useState("");
  const [managerTouched, setManagerTouched] = useState(false);
  const [mpinTouched, setMpinTouched] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const rolesCb = useApi((api) => api.commons.roleList());
  const adminRoleID = useMemo<string | null>(() => {
    const roles: RoleDto[] = rolesCb.result?.data.response ?? [];
    const adminRole = roles.find((r) =>
      (r.roleName ?? "").toLowerCase().includes("admin"),
    );
    return adminRole?.roleID ?? null;
  }, [rolesCb.result]);

  const usersByRoleCb = useApi(
    (api) =>
      adminRoleID
        ? api.commons.getUsersByRole(adminRoleID)
        : Promise.resolve(null),
    [adminRoleID],
  );
  const adminUsers = useMemo<UserDto[]>(() => {
    if (!requireManager || !adminRoleID) return [];
    const list = usersByRoleCb.result?.data?.response ?? [];
    return list.filter((u: UserDto) => u.isActive);
  }, [usersByRoleCb.result, requireManager, adminRoleID]);
  const adminsLoading =
    requireManager && (rolesCb.loading || usersByRoleCb.loading);

  const voidCb = useApiCallback(
    async (api, args: { id: string; params: VoidSaleParams }) =>
      api.commons.voidOrder(args.id, args.params),
  );

  const reasonLen = reason.trim().length;
  const reasonInvalid = reasonLen < REASON_MIN || reasonLen > REASON_MAX;
  const managerMissing = requireManager && !managerUserID;
  const mpinInvalid = requireManager && !isValidMpin(managerMpin);
  const canSubmit =
    !reasonInvalid && !managerMissing && !mpinInvalid && !voidCb.loading;

  const paymentMethods = useMemo(() => {
    const seen = new Set<SalesPaymentMethodDto>();
    return order.payments.filter((p) => {
      if (seen.has(p.method)) return false;
      seen.add(p.method);
      return true;
    });
  }, [order.payments]);

  const handleSubmit = async () => {
    setReasonTouched(true);
    setManagerTouched(true);
    setMpinTouched(true);
    setInlineError(null);
    if (!canSubmit) return;

    const params: VoidSaleParams = {
      reason: reason.trim(),
      managerUserID: requireManager ? managerUserID : null,
      managerMpin: requireManager ? managerMpin : null,
    };

    try {
      const result = await voidCb.execute({ id: order.saleID, params });
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success &&
        result.data.response
      ) {
        showToast(`Order ${result.data.response.saleNumber} voided`, "success");
        onSuccess(result.data.response);
        return;
      }
      const errors = Array.isArray(result.data.errors)
        ? (result.data.errors as string[])
        : null;
      const first = errors?.[0] ?? result.data.message ?? "Failed to void order";
      setInlineError(mapVoidError(first));
    } catch (error) {
      const errors =
        Array.isArray(error) && error.every((e) => typeof e === "string")
          ? (error as string[])
          : null;
      const first = errors?.[0] ?? "Failed to void order";
      setInlineError(mapVoidError(first));
    }
  };

  return (
    <Box>
      <Box mb="3">
        <Button type="Secondary" onClick={onCancel} disabled={voidCb.loading}>
          ← Back to receipt
        </Button>
      </Box>

      <Flex
        align="center"
        gap="3"
        p="3"
        mb="3"
        style={{
          borderRadius: "var(--radius-3)",
          background: "linear-gradient(135deg, var(--red-a3) 0%, var(--red-a2) 100%)",
          border: "1px solid var(--red-a5)",
        }}
      >
        <Box
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "var(--red-a5)",
            color: "var(--red-11)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "inset 0 0 0 1px var(--red-a6)",
          }}
        >
          <WarningAmberOutlined style={{ fontSize: 28 }} />
        </Box>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Heading size="4" weight="bold" style={{ color: "var(--red-11)" }}>
            Void this order?
          </Heading>
          <Text size="2" color="gray" as="div" mt="1">
            Reverses every payment, restores deducted ingredient stock, and
            marks the order as <strong>Voided</strong>. There is no undo.
          </Text>
        </Box>
      </Flex>

      {/* Order summary card */}
      <Box
        p="3"
        mb="3"
        style={{
          borderRadius: "var(--radius-3)",
          background: "var(--gray-a2)",
          border: "1px solid var(--gray-a4)",
        }}
      >
        <Flex align="center" justify="between" gap="3" wrap="wrap">
          <Flex align="center" gap="2">
            <Box
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--indigo-a3)",
                color: "var(--indigo-11)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ReceiptLongOutlined fontSize="small" />
            </Box>
            <Box>
              <Text size="1" color="gray" style={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
                Order number
              </Text>
              <Text size="3" weight="bold" as="div" style={{ fontVariantNumeric: "tabular-nums" }}>
                {order.saleNumber}
              </Text>
            </Box>
          </Flex>
          <Heading
            size="6"
            style={{
              background: "linear-gradient(135deg, var(--indigo-11) 0%, var(--violet-11) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatCurrencyShort(order.totalAmount, currencyCode)}
          </Heading>
        </Flex>

        <Separator size="4" my="3" />

        <Flex gap="4" wrap="wrap">
          <StatCell
            label="Cashier"
            icon={<PersonOutlineOutlined fontSize="inherit" />}
            value={order.cashierName}
          />
          <StatCell
            label="Completed"
            icon={<EventOutlined fontSize="inherit" />}
            value={formatLongDate(order.completedAt)}
          />
        </Flex>

        {paymentMethods.length > 0 && (
          <Flex gap="2" mt="3" wrap="wrap">
            {paymentMethods.map((p) => (
              <Badge
                key={p.salePaymentID}
                color={PAYMENT_COLOR[p.method] ?? "gray"}
                variant="soft"
                radius="full"
                size="1"
              >
                {PAYMENT_LABEL[p.method] ?? p.methodName}
              </Badge>
            ))}
          </Flex>
        )}
      </Box>

      <Box mb={requireManager ? "3" : "4"}>
        <Flex align="baseline" justify="between" mb="1">
          <Text
            as="label"
            size="2"
            weight="medium"
            style={{
              color: reasonTouched && reasonInvalid ? "var(--red-11)" : undefined,
            }}
          >
            Reason <Text color="red">*</Text>
          </Text>
          <Text
            size="1"
            color={reasonLen > REASON_MAX ? "red" : "gray"}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {reasonLen} / {REASON_MAX}
          </Text>
        </Flex>
        <TextArea
          value={reason}
          rows={3}
          placeholder="Why is this order being voided?"
          color={reasonTouched && reasonInvalid ? "red" : undefined}
          disabled={voidCb.loading}
          onChange={(e) => setReason(e.target.value)}
          onBlur={() => setReasonTouched(true)}
        />
        {reasonTouched && reasonInvalid && (
          <Text size="1" color="red" as="div" mt="1">
            {reasonLen < REASON_MIN
              ? `At least ${REASON_MIN} characters required.`
              : `Reason must be ${REASON_MAX} characters or less.`}
          </Text>
        )}
      </Box>

      {requireManager && (
        <ManagerOverrideSection
          adminUsers={adminUsers}
          adminsLoading={adminsLoading}
          adminRoleID={adminRoleID}
          managerUserID={managerUserID}
          managerMpin={managerMpin}
          managerTouched={managerTouched}
          managerMissing={managerMissing}
          mpinTouched={mpinTouched}
          mpinInvalid={mpinInvalid}
          disabled={voidCb.loading}
          onManagerChange={(v) => {
            setManagerUserID(v);
            setManagerTouched(true);
          }}
          onMpinChange={(v) => {
            setManagerMpin(v);
            setMpinTouched(true);
          }}
        />
      )}

      {inlineError && (
        <Callout.Root color="red" variant="surface" size="1" mb="3">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>{inlineError}</Callout.Text>
        </Callout.Root>
      )}

      <Flex justify="end" gap="3">
        <Button type="Secondary" onClick={onCancel} disabled={voidCb.loading}>
          Cancel
        </Button>
        <Button
          type="Critical"
          onClick={handleSubmit}
          loading={voidCb.loading}
          disabled={!canSubmit}
        >
          <Flex align="center" gap="2">
            <WarningAmberOutlined fontSize="small" /> Void order
          </Flex>
        </Button>
      </Flex>
    </Box>
  );
};

// ─── RefundView ───────────────────────────────────────────────────────────────

const RefundView: React.FC<{
  order: SaleDetailDto;
  currencyCode: string;
  onSuccess: (updated: SaleDetailDto) => void;
  onCancel: () => void;
}> = ({ order, currencyCode, onSuccess, onCancel }) => {
  const { showToast } = useToastContext();
  const { pos } = usePublicSettings();
  const requireManager = pos.requireManagerOverrideForRefund;

  const [refundQtys, setRefundQtys] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const item of order.items) {
      init[item.saleItemID] = "0";
    }
    return init;
  });
  const [reason, setReason] = useState("");
  const [reasonTouched, setReasonTouched] = useState(false);
  const [managerUserID, setManagerUserID] = useState("");
  const [managerMpin, setManagerMpin] = useState("");
  const [managerTouched, setManagerTouched] = useState(false);
  const [mpinTouched, setMpinTouched] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const rolesCb = useApi((api) => api.commons.roleList());
  const adminRoleID = useMemo<string | null>(() => {
    const roles: RoleDto[] = rolesCb.result?.data.response ?? [];
    const adminRole = roles.find((r) =>
      (r.roleName ?? "").toLowerCase().includes("admin"),
    );
    return adminRole?.roleID ?? null;
  }, [rolesCb.result]);

  const usersByRoleCb = useApi(
    (api) =>
      adminRoleID
        ? api.commons.getUsersByRole(adminRoleID)
        : Promise.resolve(null),
    [adminRoleID],
  );
  const adminUsers = useMemo<UserDto[]>(() => {
    if (!requireManager || !adminRoleID) return [];
    const list = usersByRoleCb.result?.data?.response ?? [];
    return list.filter((u: UserDto) => u.isActive);
  }, [usersByRoleCb.result, requireManager, adminRoleID]);
  const adminsLoading =
    requireManager && (rolesCb.loading || usersByRoleCb.loading);

  const refundCb = useApiCallback(
    async (api, args: { id: string; params: RefundSaleParams }) =>
      api.commons.refundOrder(args.id, args.params),
  );

  const refundableItems = useMemo(
    () =>
      order.items.filter(
        (item) => item.quantity - item.quantityRefunded > 0,
      ),
    [order.items],
  );

  const refundTotal = useMemo(() => {
    return order.items.reduce((sum, item) => {
      const qty = Math.max(0, Number(refundQtys[item.saleItemID]) || 0);
      if (qty <= 0) return sum;
      const discountShare = item.discount * (qty / item.quantity);
      return sum + qty * item.unitPrice - discountShare;
    }, 0);
  }, [order.items, refundQtys]);

  const selectedLines = useMemo(
    () =>
      order.items.filter(
        (item) => (Number(refundQtys[item.saleItemID]) || 0) > 0,
      ),
    [order.items, refundQtys],
  );

  const reasonLen = reason.trim().length;
  const reasonInvalid = reasonLen < REASON_MIN || reasonLen > REASON_MAX;
  const managerMissing = requireManager && !managerUserID;
  const mpinInvalid = requireManager && !isValidMpin(managerMpin);

  const qtyErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    for (const item of order.items) {
      const qty = Number(refundQtys[item.saleItemID]) || 0;
      const maxRefundable = item.quantity - item.quantityRefunded;
      if (qty > maxRefundable) {
        errs[item.saleItemID] = `Max ${maxRefundable}`;
      }
    }
    return errs;
  }, [order.items, refundQtys]);

  const hasQtyErrors = Object.keys(qtyErrors).length > 0;

  const canSubmit =
    selectedLines.length > 0 &&
    !reasonInvalid &&
    !managerMissing &&
    !mpinInvalid &&
    !hasQtyErrors &&
    !refundCb.loading;

  const handleSubmit = async () => {
    setReasonTouched(true);
    setManagerTouched(true);
    setMpinTouched(true);
    setInlineError(null);
    if (selectedLines.length === 0) {
      setInlineError("Select at least one item to refund.");
      return;
    }
    if (!canSubmit) return;

    const params: RefundSaleParams = {
      reason: reason.trim(),
      items: selectedLines.map((item) => ({
        saleItemID: item.saleItemID,
        quantity: Number(refundQtys[item.saleItemID]) || 0,
      })),
      managerUserID: requireManager ? managerUserID : null,
      managerMpin: requireManager ? managerMpin : null,
    };

    try {
      const result = await refundCb.execute({ id: order.saleID, params });
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success &&
        result.data.response
      ) {
        showToast("Refund processed successfully", "success");
        onSuccess(result.data.response);
        return;
      }
      const errors = Array.isArray(result.data.errors)
        ? (result.data.errors as string[])
        : null;
      const first = errors?.[0] ?? result.data.message ?? "Failed to process refund";
      setInlineError(mapRefundError(first));
    } catch (error) {
      const errors =
        Array.isArray(error) && error.every((e) => typeof e === "string")
          ? (error as string[])
          : null;
      const first = errors?.[0] ?? "Failed to process refund";
      setInlineError(mapRefundError(first));
    }
  };

  return (
    <Box>
      <Box mb="3">
        <Button type="Secondary" onClick={onCancel} disabled={refundCb.loading}>
          ← Back to receipt
        </Button>
      </Box>

      {/* Hero */}
      <Flex
        align="center"
        gap="3"
        p="3"
        mb="3"
        style={{
          borderRadius: "var(--radius-3)",
          background: "linear-gradient(135deg, var(--amber-a3) 0%, var(--orange-a2) 100%)",
          border: "1px solid var(--amber-a5)",
        }}
      >
        <Box
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "var(--amber-a5)",
            color: "var(--amber-11)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "inset 0 0 0 1px var(--amber-a6)",
          }}
        >
          <ReplayOutlined style={{ fontSize: 28 }} />
        </Box>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Heading size="4" weight="bold" style={{ color: "var(--amber-11)" }}>
            Refund items
          </Heading>
          <Text size="2" color="gray" as="div" mt="1">
            Select items and quantities to refund. Ingredient stock for refunded
            items will be restored at the proportional ratio.
          </Text>
        </Box>
      </Flex>

      {/* Item picker */}
      <Box mb="3">
        <Text size="2" weight="medium" as="div" mb="2">
          Select items to refund
        </Text>
        <Flex direction="column" gap="2">
          {order.items.map((item) => {
            const maxRefundable = item.quantity - item.quantityRefunded;
            const disabled = maxRefundable === 0;
            const qty = Number(refundQtys[item.saleItemID]) || 0;
            const hasErr = !!qtyErrors[item.saleItemID];

            return (
              <Box
                key={item.saleItemID}
                p="3"
                style={{
                  borderRadius: "var(--radius-3)",
                  background: disabled ? "var(--gray-a1)" : "var(--gray-a2)",
                  border: `1px solid ${hasErr ? "var(--red-a5)" : "var(--gray-a4)"}`,
                  opacity: disabled ? 0.5 : 1,
                }}
              >
                <Flex align="center" justify="between" gap="3" wrap="wrap">
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text size="2" weight="medium" as="div" truncate>
                      {item.productName}
                    </Text>
                    <Text size="1" color="gray" as="div">
                      {formatCurrencyShort(item.unitPrice, currencyCode)} ×{" "}
                      {item.quantity}
                      {item.quantityRefunded > 0 &&
                        ` · ${item.quantityRefunded} already refunded`}
                    </Text>
                  </Box>

                  <Box style={{ minWidth: 120, textAlign: "right" }}>
                    <Text size="1" color="gray" as="div" mb="1">
                      {disabled ? "Fully refunded" : `Max ${maxRefundable}`}
                    </Text>
                    <TextField.Root
                      size="2"
                      type="number"
                      min={0}
                      max={maxRefundable}
                      step={1}
                      disabled={disabled || refundCb.loading}
                      value={refundQtys[item.saleItemID] ?? "0"}
                      color={hasErr ? "red" : undefined}
                      style={{ width: 80 }}
                      onChange={(e) =>
                        setRefundQtys((prev) => ({
                          ...prev,
                          [item.saleItemID]: e.target.value,
                        }))
                      }
                    />
                    {hasErr && (
                      <Text size="1" color="red" as="div" mt="1">
                        {qtyErrors[item.saleItemID]}
                      </Text>
                    )}
                  </Box>
                </Flex>
              </Box>
            );
          })}
        </Flex>
      </Box>

      {/* Live refund total */}
      {refundTotal > 0 && (
        <Box
          p="3"
          mb="3"
          style={{
            borderRadius: "var(--radius-3)",
            background: "var(--red-a2)",
            border: "1px solid var(--red-a4)",
          }}
        >
          <Flex justify="between" align="baseline">
            <Text size="2" color="gray">
              Refund total
            </Text>
            <Heading size="5" style={{ color: "var(--red-11)", fontVariantNumeric: "tabular-nums" }}>
              − {formatCurrencyShort(refundTotal, currencyCode)}
            </Heading>
          </Flex>
        </Box>
      )}

      {/* Reason */}
      <Box mb={requireManager ? "3" : "4"}>
        <Flex align="baseline" justify="between" mb="1">
          <Text
            as="label"
            size="2"
            weight="medium"
            style={{
              color: reasonTouched && reasonInvalid ? "var(--red-11)" : undefined,
            }}
          >
            Reason <Text color="red">*</Text>
          </Text>
          <Text
            size="1"
            color={reasonLen > REASON_MAX ? "red" : "gray"}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {reasonLen} / {REASON_MAX}
          </Text>
        </Flex>
        <TextArea
          value={reason}
          rows={3}
          placeholder="Why are these items being refunded?"
          color={reasonTouched && reasonInvalid ? "red" : undefined}
          disabled={refundCb.loading}
          onChange={(e) => setReason(e.target.value)}
          onBlur={() => setReasonTouched(true)}
        />
        {reasonTouched && reasonInvalid && (
          <Text size="1" color="red" as="div" mt="1">
            {reasonLen < REASON_MIN
              ? `At least ${REASON_MIN} characters required.`
              : `Reason must be ${REASON_MAX} characters or less.`}
          </Text>
        )}
      </Box>

      {requireManager && (
        <ManagerOverrideSection
          adminUsers={adminUsers}
          adminsLoading={adminsLoading}
          adminRoleID={adminRoleID}
          managerUserID={managerUserID}
          managerMpin={managerMpin}
          managerTouched={managerTouched}
          managerMissing={managerMissing}
          mpinTouched={mpinTouched}
          mpinInvalid={mpinInvalid}
          disabled={refundCb.loading}
          onManagerChange={(v) => {
            setManagerUserID(v);
            setManagerTouched(true);
          }}
          onMpinChange={(v) => {
            setManagerMpin(v);
            setMpinTouched(true);
          }}
        />
      )}

      {inlineError && (
        <Callout.Root color="red" variant="surface" size="1" mb="3">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>{inlineError}</Callout.Text>
        </Callout.Root>
      )}

      <Flex justify="end" gap="3">
        <Button type="Secondary" onClick={onCancel} disabled={refundCb.loading}>
          Cancel
        </Button>
        <Button
          type="Primary"
          onClick={handleSubmit}
          loading={refundCb.loading}
          disabled={!canSubmit}
        >
          <Flex align="center" gap="2">
            <ReplayOutlined fontSize="small" /> Process refund
          </Flex>
        </Button>
      </Flex>
    </Box>
  );
};

// ─── ManagerOverrideSection ───────────────────────────────────────────────────

const ManagerOverrideSection: React.FC<{
  adminUsers: UserDto[];
  adminsLoading: boolean;
  adminRoleID: string | null;
  managerUserID: string;
  managerMpin: string;
  managerTouched: boolean;
  managerMissing: boolean;
  mpinTouched: boolean;
  mpinInvalid: boolean;
  disabled: boolean;
  onManagerChange: (v: string) => void;
  onMpinChange: (v: string) => void;
}> = ({
  adminUsers,
  adminsLoading,
  adminRoleID,
  managerUserID,
  managerMpin,
  managerTouched,
  managerMissing,
  mpinTouched,
  mpinInvalid,
  disabled,
  onManagerChange,
  onMpinChange,
}) => (
  <Box
    p="3"
    mb="4"
    style={{
      borderRadius: "var(--radius-3)",
      background: "var(--amber-a2)",
      border: "1px solid var(--amber-a5)",
    }}
  >
    <Flex align="center" gap="2" mb="3">
      <Box
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: "var(--amber-a4)",
          color: "var(--amber-11)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <KeyOutlined fontSize="small" />
      </Box>
      <Box>
        <Text size="2" weight="bold" as="div">
          Manager approval required
        </Text>
        <Text size="1" color="gray" as="div">
          A manager on shift must authorize this action.
        </Text>
      </Box>
    </Flex>

    <Box mb="3">
      <Text
        as="label"
        size="2"
        weight="medium"
        style={{
          color: managerTouched && managerMissing ? "var(--red-11)" : undefined,
        }}
      >
        Manager on shift <Text color="red">*</Text>
      </Text>
      <Box mt="1">
        <Select.Root
          value={managerUserID || undefined}
          onValueChange={onManagerChange}
          disabled={disabled || adminsLoading || adminUsers.length === 0}
        >
          <Select.Trigger
            placeholder={
              adminsLoading
                ? "Loading managers…"
                : !adminRoleID
                  ? "No admin role configured"
                  : adminUsers.length === 0
                    ? "No active managers found"
                    : "Select a manager…"
            }
            color={managerTouched && managerMissing ? "red" : undefined}
            style={{ width: "100%" }}
          />
          <Select.Content position="popper">
            {adminUsers.map((u) => (
              <Select.Item key={u.userID} value={u.userID}>
                <Flex direction="column">
                  <Text size="2" weight="medium">
                    {[u.userInfo?.firstName, u.userInfo?.lastName]
                      .filter(Boolean)
                      .join(" ") || u.username || u.userID}
                  </Text>
                  {u.username && (
                    <Text size="1" color="gray">
                      @{u.username}
                    </Text>
                  )}
                </Flex>
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Box>
      {managerTouched && managerMissing && (
        <Text size="1" color="red" as="div" mt="1">
          Pick the manager authorising this action.
        </Text>
      )}
    </Box>

    <MpinInput
      label="Manager MPIN"
      value={managerMpin}
      onChange={onMpinChange}
      disabled={disabled}
      errorMessage={mpinTouched && mpinInvalid ? "Enter a 6-digit MPIN." : null}
    />
  </Box>
);

// ─── sub-components ───────────────────────────────────────────────────────────

const StatCell: React.FC<{
  label: string;
  value: string;
  icon?: React.ReactNode;
}> = ({ label, value, icon }) => (
  <Box style={{ minWidth: 120 }}>
    <Text
      size="1"
      color="gray"
      as="div"
      style={{ textTransform: "uppercase", letterSpacing: 0.6 }}
    >
      {label}
    </Text>
    <Flex align="center" gap="1" mt="1">
      {icon && (
        <Text size="2" color="gray" style={{ display: "inline-flex" }}>
          {icon}
        </Text>
      )}
      <Text size="2" weight="medium" as="div" truncate>
        {value}
      </Text>
    </Flex>
  </Box>
);
