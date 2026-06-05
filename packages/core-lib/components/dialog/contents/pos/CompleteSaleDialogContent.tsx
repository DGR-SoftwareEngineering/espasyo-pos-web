import React, { useMemo, useState } from "react";
import {
  Box,
  Callout,
  Flex,
  Heading,
  IconButton,
  Separator,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import {
  Cross2Icon,
  PlusIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import {
  PaymentsOutlined,
  PriceCheckOutlined,
} from "@mui/icons-material";
import { Button } from "../../../radix/buttons/Button";
import { useToastContext, usePublicSettings } from "../../../../core/contexts";
import {
  PosChargeDialogData,
  PosChargePaymentLine,
} from "../../../../api/content/types/common";
import { SalesPaymentMethodDto } from "../../../../api/commons/types";

const PAYMENT_OPTIONS: Array<{
  method: SalesPaymentMethodDto;
  label: string;
  color: "green" | "indigo" | "blue" | "violet" | "iris" | "gray";
  requiresReference: boolean;
}> = [
  {
    method: SalesPaymentMethodDto.Cash,
    label: "Cash",
    color: "green",
    requiresReference: false,
  },
  {
    method: SalesPaymentMethodDto.Card,
    label: "Card",
    color: "indigo",
    requiresReference: true,
  },
  {
    method: SalesPaymentMethodDto.GCash,
    label: "GCash",
    color: "blue",
    requiresReference: true,
  },
  {
    method: SalesPaymentMethodDto.Maya,
    label: "Maya",
    color: "violet",
    requiresReference: true,
  },
  {
    method: SalesPaymentMethodDto.BankTransfer,
    label: "Bank",
    color: "iris",
    requiresReference: true,
  },
  {
    method: SalesPaymentMethodDto.Other,
    label: "Other",
    color: "gray",
    requiresReference: true,
  },
];

interface DraftPayment {
  id: string;
  method: SalesPaymentMethodDto;
  /** For cash this is "cash received"; for non-cash this is "amount applied". */
  inputAmount: string;
  referenceNumber: string;
}

interface DerivedAmounts {
  /** Amount applied to the sale. For cash, clamped to the remaining bill budget. */
  amount: number;
  /** What the customer handed over. Equals amount for non-cash; equals input for cash. */
  tendered: number;
  /** Per-line change to give back. Non-zero only when cash received exceeds amount applied. */
  changeBack: number;
}

const newId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `p-${Math.random().toString(36).slice(2)}`;

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

interface Props {
  data: PosChargeDialogData;
  onClose: () => void;
}

export const CompleteSaleDialogContent: React.FC<Props> = ({
  data,
  onClose,
}) => {
  const { showToast } = useToastContext();
  const { currencyCode } = usePublicSettings();
  const [payments, setPayments] = useState<DraftPayment[]>(() => [
    {
      id: newId(),
      method: SalesPaymentMethodDto.Cash,
      inputAmount: data.totalAmount.toFixed(2),
      referenceNumber: "",
    },
  ]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /**
   * Per-line derivation. Non-cash lines apply their raw input. Cash lines split
   * the remaining bill budget in document order: the first cash line takes as
   * much of the remaining budget as it received, the next takes what's left,
   * and so on. Any cash received above its assigned budget surfaces as
   * per-line change to give back.
   */
  const derived = useMemo<DerivedAmounts[]>(() => {
    const total = data.totalAmount;
    const nonCashTotal = payments
      .filter((p) => p.method !== SalesPaymentMethodDto.Cash)
      .reduce((s, p) => s + Math.max(0, Number(p.inputAmount) || 0), 0);
    let remainingBudget = Math.max(0, total - nonCashTotal);
    return payments.map((p) => {
      const input = Math.max(0, Number(p.inputAmount) || 0);
      if (p.method !== SalesPaymentMethodDto.Cash) {
        return { amount: input, tendered: input, changeBack: 0 };
      }
      const amount = Math.min(input, remainingBudget);
      remainingBudget -= amount;
      return { amount, tendered: input, changeBack: Math.max(0, input - amount) };
    });
  }, [payments, data.totalAmount]);

  const totalPaid = useMemo(
    () => derived.reduce((s, d) => s + d.amount, 0),
    [derived],
  );
  const changeDue = useMemo(
    () => derived.reduce((s, d) => s + d.changeBack, 0),
    [derived],
  );
  const stillOwed = Math.max(0, data.totalAmount - totalPaid);
  const underpaid = stillOwed > 0.005;
  const canSubmit = !underpaid && payments.length > 0 && !submitting;

  const updatePayment = (id: string, patch: Partial<DraftPayment>) =>
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );

  const addPaymentLine = () => {
    const fallback = stillOwed > 0 ? stillOwed.toFixed(2) : "0.00";
    setPayments((prev) => [
      ...prev,
      {
        id: newId(),
        method: SalesPaymentMethodDto.Cash,
        inputAmount: fallback,
        referenceNumber: "",
      },
    ]);
  };

  const removePaymentLine = (id: string) =>
    setPayments((prev) =>
      prev.length === 1 ? prev : prev.filter((p) => p.id !== id),
    );

  const handleSubmit = async () => {
    const built: PosChargePaymentLine[] = [];
    for (let i = 0; i < payments.length; i++) {
      const p = payments[i]!;
      const d = derived[i]!;
      if (!Number.isFinite(d.amount) || d.amount <= 0) {
        showToast(
          p.method === SalesPaymentMethodDto.Cash
            ? "Cash received must be greater than zero (or remove this line)."
            : "Amount must be greater than zero (or remove this line).",
          "error",
        );
        return;
      }
      const opt = PAYMENT_OPTIONS.find((o) => o.method === p.method);
      if (opt?.requiresReference && !p.referenceNumber.trim()) {
        showToast(
          `Reference number is required for ${opt.label} payments`,
          "error",
        );
        return;
      }
      built.push({
        method: p.method,
        amount: d.amount,
        tendered:
          p.method === SalesPaymentMethodDto.Cash ? d.tendered : null,
        referenceNumber:
          opt?.requiresReference && p.referenceNumber.trim()
            ? p.referenceNumber.trim()
            : null,
      });
    }

    if (underpaid) {
      showToast("Payments must cover the full total", "error");
      return;
    }

    setSubmitting(true);
    try {
      await data.onConfirm({
        payments: built,
        notes: notes.trim() || null,
      });
      onClose();
    } catch {
      // Errors are toasted by the caller.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box p="2">
      <Flex
        direction="column"
        gap="1"
        p="3"
        mb="3"
        style={{
          borderRadius: "var(--radius-3)",
          background: "var(--indigo-a2)",
          border: "1px solid var(--indigo-a5)",
        }}
      >
        <Flex justify="between" align="baseline">
          <Text size="2" color="gray">
            Total due
          </Text>
          <Heading size="6" style={{ color: "var(--indigo-11)" }}>
            {formatCurrencyShort(data.totalAmount, currencyCode)}
          </Heading>
        </Flex>
        <Flex gap="3" wrap="wrap" mt="1">
          <MiniStat
            label="Subtotal"
            value={formatCurrencyShort(data.subtotal, currencyCode)}
          />
          {data.discountAmount > 0 && (
            <MiniStat
              label="Discount"
              value={`− ${formatCurrencyShort(data.discountAmount, currencyCode)}`}
              accent="green"
            />
          )}
          <MiniStat
            label={`Tax (${(data.taxRate * 100).toFixed(0)}%)`}
            value={formatCurrencyShort(data.taxAmount, currencyCode)}
          />
          <MiniStat label="Items" value={String(data.itemCount)} />
        </Flex>
      </Flex>

      <Flex justify="between" align="center" mb="2">
        <Heading size="3">Payments</Heading>
        <Button type="Secondary" onClick={addPaymentLine}>
          <Flex align="center" gap="1">
            <PlusIcon /> Split payment
          </Flex>
        </Button>
      </Flex>

      <Flex direction="column" gap="2">
        {payments.map((p, idx) => (
          <PaymentLineCard
            key={p.id}
            index={idx}
            value={p}
            derived={derived[idx]!}
            currencyCode={currencyCode}
            removable={payments.length > 1}
            onChange={(patch) => updatePayment(p.id, patch)}
            onRemove={() => removePaymentLine(p.id)}
          />
        ))}
      </Flex>

      <Separator size="4" my="3" />

      <Flex direction="column" gap="2">
        <SummaryRow
          label="Customer paid"
          value={formatCurrencyShort(totalPaid, currencyCode)}
        />
        {changeDue > 0 && (
          <SummaryRow
            label="Change to give back"
            value={formatCurrencyShort(changeDue, currencyCode)}
            accent="green"
          />
        )}
        {underpaid && (
          <SummaryRow
            label="Still owed"
            value={formatCurrencyShort(stillOwed, currencyCode)}
            accent="red"
          />
        )}
      </Flex>

      {underpaid && (
        <Callout.Root color="amber" variant="surface" mt="3" size="1">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            Add{" "}
            <strong>{formatCurrencyShort(stillOwed, currencyCode)}</strong> more
            to complete the sale.
          </Callout.Text>
        </Callout.Root>
      )}

      <Box mt="3">
        <Text size="2" weight="medium" as="div" mb="1">
          Notes
        </Text>
        <TextArea
          value={notes}
          rows={2}
          placeholder="Optional — e.g. customer name, special request"
          onChange={(e) => setNotes(e.target.value)}
          disabled={submitting}
        />
      </Box>

      <Flex justify="end" gap="3" mt="4">
        <Button type="Secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          type="Primary"
          onClick={handleSubmit}
          loading={submitting}
          disabled={!canSubmit}
        >
          <Flex align="center" gap="2">
            <PriceCheckOutlined fontSize="small" /> Complete sale
          </Flex>
        </Button>
      </Flex>
    </Box>
  );
};

const MiniStat: React.FC<{
  label: string;
  value: string;
  accent?: "green";
}> = ({ label, value, accent }) => (
  <Flex direction="column">
    <Text size="1" color="gray" style={{ textTransform: "uppercase" }}>
      {label}
    </Text>
    <Text
      size="2"
      weight="medium"
      style={accent === "green" ? { color: "var(--green-11)" } : undefined}
    >
      {value}
    </Text>
  </Flex>
);

const SummaryRow: React.FC<{
  label: string;
  value: string;
  accent?: "green" | "red";
}> = ({ label, value, accent }) => (
  <Flex justify="between" align="baseline">
    <Text size="2" color="gray">
      {label}
    </Text>
    <Text
      size="2"
      weight={accent ? "bold" : "medium"}
      style={
        accent === "green"
          ? { color: "var(--green-11)" }
          : accent === "red"
            ? { color: "var(--red-11)" }
            : undefined
      }
    >
      {value}
    </Text>
  </Flex>
);

const PaymentLineCard: React.FC<{
  index: number;
  value: DraftPayment;
  derived: DerivedAmounts;
  currencyCode: string;
  removable: boolean;
  onChange: (patch: Partial<DraftPayment>) => void;
  onRemove: () => void;
}> = ({
  index,
  value,
  derived,
  currencyCode,
  removable,
  onChange,
  onRemove,
}) => {
  const isCash = value.method === SalesPaymentMethodDto.Cash;
  const option = PAYMENT_OPTIONS.find((o) => o.method === value.method);
  const requiresReference = option?.requiresReference ?? false;
  const lineChange = derived.changeBack;
  const inputLabel = isCash ? "Cash received" : "Amount";
  const inputHelp = isCash
    ? "How much cash the customer handed over."
    : null;

  return (
    <Box
      p="3"
      style={{
        borderRadius: "var(--radius-3)",
        background: "var(--gray-a2)",
        border: "1px solid var(--gray-a4)",
      }}
    >
      <Flex justify="between" align="center" mb="2">
        <Flex align="center" gap="2">
          <PaymentsOutlined fontSize="small" style={{ color: "var(--gray-10)" }} />
          <Text size="2" weight="medium">
            Payment {index + 1}
          </Text>
        </Flex>
        {removable && (
          <IconButton
            variant="ghost"
            color="gray"
            size="1"
            onClick={onRemove}
            aria-label="Remove payment"
          >
            <Cross2Icon />
          </IconButton>
        )}
      </Flex>

      <Flex gap="2" wrap="wrap" mb="2">
        {PAYMENT_OPTIONS.map((o) => {
          const active = value.method === o.method;
          return (
            <button
              key={o.method}
              type="button"
              onClick={() => onChange({ method: o.method })}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                border: `1px solid ${
                  active ? `var(--${o.color}-a8)` : "var(--gray-a5)"
                }`,
                background: active
                  ? `var(--${o.color}-a3)`
                  : "var(--color-panel-solid)",
                color: active ? `var(--${o.color}-11)` : "var(--gray-12)",
                transition: "all 0.12s ease",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </Flex>

      <Flex gap="2" wrap="wrap" align="start">
        <Box style={{ flex: 1, minWidth: 160 }}>
          <Text size="1" color="gray" as="div" mb="1">
            {inputLabel}
          </Text>
          <TextField.Root
            size="2"
            type="number"
            min={0}
            step="0.01"
            value={value.inputAmount}
            placeholder="0.00"
            onChange={(e) => onChange({ inputAmount: e.target.value })}
          />
          {lineChange > 0 && (
            <Text
              size="1"
              as="div"
              mt="1"
              weight="medium"
              style={{ color: "var(--green-11)" }}
            >
              Change: {formatCurrencyShort(lineChange, currencyCode)}
            </Text>
          )}
          {!lineChange && inputHelp && (
            <Text size="1" color="gray" as="div" mt="1">
              {inputHelp}
            </Text>
          )}
        </Box>
        {requiresReference && (
          <Box style={{ flex: 2, minWidth: 180 }}>
            <Text size="1" color="gray" as="div" mb="1">
              Reference number
            </Text>
            <TextField.Root
              size="2"
              value={value.referenceNumber}
              placeholder="Card last-4 / GCash ref / …"
              onChange={(e) => onChange({ referenceNumber: e.target.value })}
            />
          </Box>
        )}
      </Flex>
    </Box>
  );
};
