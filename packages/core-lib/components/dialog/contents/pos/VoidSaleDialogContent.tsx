import React, { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Callout,
  Flex,
  Heading,
  Select,
  Separator,
  Text,
  TextArea,
} from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  WarningAmberOutlined,
  ReceiptLongOutlined,
  KeyOutlined,
  PersonOutlineOutlined,
  EventOutlined,
} from "@mui/icons-material";
import { Button } from "../../../radix/buttons/Button";
import { MpinInput, isValidMpin } from "../../../radix/security";
import { useApi, useApiCallback } from "../../../../core/hooks";
import { useToastContext, usePublicSettings } from "../../../../core/contexts";
import {
  RoleDto,
  SaleDetailDto,
  SalesPaymentMethodDto,
  UserDto,
  VoidSaleParams,
} from "../../../../api/commons/types";

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
  const composed = parts.join(" ");
  return composed || user.username || user.userID;
};

const codeFromError = (raw: string): string | null => {
  const m = raw.match(/^\[([A-Z][A-Z0-9._]*)\]/);
  return m ? (m[1] ?? null) : null;
};

const messageFromError = (raw: string): string =>
  raw.replace(/^\[[A-Z][A-Z0-9._]*\]\s*/, "");

interface Props {
  data: { sale: SaleDetailDto; onSuccess: (voidedSale: SaleDetailDto) => void };
  onClose: () => void;
}

export const VoidSaleDialogContent: React.FC<Props> = ({ data, onClose }) => {
  const { sale, onSuccess } = data;
  const { showToast } = useToastContext();
  const { currencyCode, pos } = usePublicSettings();
  const requireManager = pos.requireManagerOverrideForRefund;

  const [reason, setReason] = useState("");
  const [reasonTouched, setReasonTouched] = useState(false);
  const [managerUserID, setManagerUserID] = useState<string>("");
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
    return list.filter((u) => u.isActive);
  }, [usersByRoleCb.result, requireManager, adminRoleID]);
  const adminsLoading =
    requireManager && (rolesCb.loading || usersByRoleCb.loading);

  const voidCb = useApiCallback(
    async (api, args: { id: string; params: VoidSaleParams }) =>
      api.commons.voidSale(args.id, args.params),
  );

  const reasonLen = reason.trim().length;
  const reasonInvalid = reasonLen < REASON_MIN || reasonLen > REASON_MAX;
  const managerMissing = requireManager && !managerUserID;
  const mpinInvalid = requireManager && !isValidMpin(managerMpin);
  const canSubmit =
    !reasonInvalid && !managerMissing && !mpinInvalid && !voidCb.loading;

  const itemUnits = useMemo(
    () => sale.items.reduce((s, i) => s + i.quantity, 0),
    [sale.items],
  );
  const paymentMethods = useMemo(() => {
    const seen = new Set<SalesPaymentMethodDto>();
    return sale.payments.filter((p) => {
      if (seen.has(p.method)) return false;
      seen.add(p.method);
      return true;
    });
  }, [sale.payments]);

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
      const result = await voidCb.execute({ id: sale.saleID, params });
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success &&
        result.data.response
      ) {
        const voided = result.data.response;
        showToast(`Sale ${voided.saleNumber} voided`, "success");
        onSuccess(voided);
        onClose();
        return;
      }
      const errors = Array.isArray(result.data.errors)
        ? (result.data.errors as string[])
        : null;
      const first = errors?.[0] ?? result.data.message ?? "Failed to void sale";
      setInlineError(mapVoidError(first));
    } catch (error) {
      const errors =
        Array.isArray(error) && error.every((e) => typeof e === "string")
          ? (error as string[])
          : null;
      const first = errors?.[0] ?? "Failed to void sale";
      setInlineError(mapVoidError(first));
    }
  };

  return (
    <Box p="2">
      {/* Hero */}
      <Flex
        align="center"
        gap="3"
        p="3"
        mb="3"
        style={{
          borderRadius: "var(--radius-3)",
          background:
            "linear-gradient(135deg, var(--red-a3) 0%, var(--red-a2) 100%)",
          border: "1px solid var(--red-a5)",
        }}
      >
        <Box
          style={{
            width: 56,
            height: 56,
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
          <WarningAmberOutlined style={{ fontSize: 32 }} />
        </Box>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Heading size="4" weight="bold" style={{ color: "var(--red-11)" }}>
            Void this sale?
          </Heading>
          <Text size="2" color="gray" as="div" mt="1">
            Reverses every payment, restores deducted ingredient stock, and
            marks the sale as <strong>Voided</strong> in history. There is no
            undo.
          </Text>
        </Box>
      </Flex>

      {/* Sale summary card */}
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
              <Text
                size="1"
                color="gray"
                style={{ textTransform: "uppercase", letterSpacing: 0.6 }}
              >
                Sale number
              </Text>
              <Text
                size="3"
                weight="bold"
                as="div"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {sale.saleNumber}
              </Text>
            </Box>
          </Flex>
          <Heading
            size="6"
            style={{
              background:
                "linear-gradient(135deg, var(--indigo-11) 0%, var(--violet-11) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatCurrencyShort(sale.totalAmount, currencyCode)}
          </Heading>
        </Flex>

        <Separator size="4" my="3" />

        <Flex gap="4" wrap="wrap">
          <SummaryStat
            label="Items"
            value={`${sale.items.length} line${sale.items.length === 1 ? "" : "s"} · ${itemUnits} unit${itemUnits === 1 ? "" : "s"}`}
          />
          <SummaryStat
            label="Cashier"
            icon={<PersonOutlineOutlined fontSize="inherit" />}
            value={sale.cashierName}
          />
          <SummaryStat
            label="Completed"
            icon={<EventOutlined fontSize="inherit" />}
            value={formatLongDate(sale.completedAt)}
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

      {/* Reason field */}
      <Box mb={requireManager ? "3" : "4"}>
        <Flex align="baseline" justify="between" mb="1">
          <Text
            as="label"
            size="2"
            weight="medium"
            style={{
              color:
                reasonTouched && reasonInvalid ? "var(--red-11)" : undefined,
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
          placeholder="Why is this sale being voided? (e.g. wrong items rung, customer cancelled)"
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

      {/* Manager override */}
      {requireManager && (
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
                A manager on shift must authorize this void.
              </Text>
            </Box>
          </Flex>

          <Box mb="3">
            <Text
              as="label"
              size="2"
              weight="medium"
              style={{
                color:
                  managerTouched && managerMissing
                    ? "var(--red-11)"
                    : undefined,
              }}
            >
              Manager on shift <Text color="red">*</Text>
            </Text>
            <Box mt="1">
              <Select.Root
                value={managerUserID || undefined}
                onValueChange={(v) => {
                  setManagerUserID(v);
                  setManagerTouched(true);
                }}
                disabled={
                  voidCb.loading || adminsLoading || adminUsers.length === 0
                }
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
                  color={
                    managerTouched && managerMissing ? "red" : undefined
                  }
                  style={{ width: "100%" }}
                />
                <Select.Content position="popper">
                  {adminUsers.map((u) => (
                    <Select.Item key={u.userID} value={u.userID}>
                      <Flex direction="column">
                        <Text size="2" weight="medium">
                          {fullName(u)}
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
                Pick the manager authorising this void.
              </Text>
            )}
          </Box>

          <MpinInput
            label="Manager MPIN"
            value={managerMpin}
            onChange={(next) => {
              setManagerMpin(next);
              setMpinTouched(true);
            }}
            disabled={voidCb.loading}
            errorMessage={
              mpinTouched && mpinInvalid ? "Enter a 6-digit MPIN." : null
            }
          />
        </Box>
      )}

      {/* Inline error */}
      {inlineError && (
        <Callout.Root color="red" variant="surface" size="1" mb="3">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>{inlineError}</Callout.Text>
        </Callout.Root>
      )}

      {/* Footer */}
      <Flex justify="end" gap="3">
        <Button type="Secondary" onClick={onClose} disabled={voidCb.loading}>
          Cancel
        </Button>
        <Button
          type="Critical"
          onClick={handleSubmit}
          loading={voidCb.loading}
          disabled={!canSubmit}
        >
          <Flex align="center" gap="2">
            <WarningAmberOutlined fontSize="small" /> Void sale
          </Flex>
        </Button>
      </Flex>
    </Box>
  );
};

const mapVoidError = (raw: string): string => {
  const code = codeFromError(raw);
  const msg = messageFromError(raw);
  switch (code) {
    case "POS.MANAGER_OVERRIDE_REQUIRED":
      return "Manager approval is required. Pick the manager on shift and enter their MPIN.";
    case "POS.MANAGER_OVERRIDE_FAILED":
      return "Manager MPIN didn't match. Double-check and try again.";
    case "SALE.INVALID_STATE_FOR_VOID":
      return "This sale can no longer be voided — it may have already been voided or refunded.";
    case "SALE.HAS_REFUNDS":
      return "This sale has active refunds. Reverse those first, then try voiding again.";
    default:
      return msg || "Failed to void sale.";
  }
};

const SummaryStat: React.FC<{
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
