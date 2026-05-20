import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Callout,
  Flex,
  Heading,
  Separator,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { InfoOutlined } from "@mui/icons-material";
import { useApiCallback } from "../../../../core/hooks";
import { useToastContext, usePublicSettings } from "../../../../core/contexts";
import {
  CreatePaymentParams,
  PaymentMethodDto,
  SupplierInvoiceDetailDto,
} from "../../../../api/commons/types";
import { Button } from "../../../radix/buttons/Button";

const PAYMENT_METHOD_LABELS: Record<
  PaymentMethodDto,
  { label: string; color: "green" | "blue" | "amber" | "teal" | "gray" }
> = {
  [PaymentMethodDto.Cash]: { label: "Cash", color: "green" },
  [PaymentMethodDto.BankTransfer]: { label: "Bank transfer", color: "blue" },
  [PaymentMethodDto.Check]: { label: "Check", color: "amber" },
  [PaymentMethodDto.GCash]: { label: "GCash", color: "teal" },
  [PaymentMethodDto.Other]: { label: "Other", color: "gray" },
};

const REQUIRES_REFERENCE: ReadonlySet<PaymentMethodDto> = new Set([
  PaymentMethodDto.BankTransfer,
  PaymentMethodDto.Check,
  PaymentMethodDto.GCash,
]);

const formatCurrency = (
  value: number | null | undefined,
  currencyCode: string = "PHP",
): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currencyCode} ${value.toFixed(2)}`;
  }
};

const todayIsoDate = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

export const RecordPaymentDialogContent: React.FC<{
  invoice: SupplierInvoiceDetailDto;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ invoice, onSuccess, onClose }) => {
  const { showToast } = useToastContext();
  const { procurement, currencyCode } = usePublicSettings();

  const allowedMethods = useMemo(
    () =>
      procurement.allowedPaymentMethods.filter((m): m is PaymentMethodDto =>
        Object.values(PaymentMethodDto).includes(m as PaymentMethodDto),
      ),
    [procurement.allowedPaymentMethods],
  );

  const [method, setMethod] = useState<PaymentMethodDto>(
    allowedMethods[0] ?? PaymentMethodDto.Cash,
  );
  const [referenceNumber, setReferenceNumber] = useState("");
  const [amount, setAmount] = useState(String(invoice.balanceDue));
  const [paymentDate, setPaymentDate] = useState(todayIsoDate());
  const [notes, setNotes] = useState("");

  const createCb = useApiCallback(
    async (api, args: CreatePaymentParams) =>
      await api.commons.createPayment(args),
  );

  useEffect(() => {
    setMethod(allowedMethods[0] ?? PaymentMethodDto.Cash);
    setReferenceNumber("");
    setAmount(String(invoice.balanceDue));
    setPaymentDate(todayIsoDate());
    setNotes("");
  }, [invoice.balanceDue, allowedMethods]);

  const handleSubmit = async () => {
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      showToast("Amount must be greater than zero", "error");
      return;
    }
    if (amt > invoice.balanceDue) {
      showToast(
        `Amount exceeds outstanding balance of ${formatCurrency(invoice.balanceDue, currencyCode)}`,
        "error",
      );
      return;
    }
    if (REQUIRES_REFERENCE.has(method) && !referenceNumber.trim()) {
      showToast(
        `${PAYMENT_METHOD_LABELS[method].label} payments require a reference number`,
        "error",
      );
      return;
    }
    try {
      const result = await createCb.execute({
        supplierInvoiceID: invoice.supplierInvoiceID,
        method,
        referenceNumber: referenceNumber.trim() || undefined,
        amount: amt,
        paymentDate,
        notes: notes.trim() || undefined,
      });
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data?.success &&
        result.data.response
      ) {
        showToast(
          `Payment ${result.data.response.paymentNumber} recorded`,
          "success",
        );
        onSuccess();
        onClose();
        return;
      }
      const message =
        (Array.isArray(result.data?.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data?.message ??
        "Failed to record payment";
      showToast(message, "error");
    } catch (error) {
      console.error("Payment error:", error);
      const first =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to record payment";
      showToast(first, "error");
    }
  };

  const requiresRef = REQUIRES_REFERENCE.has(method);

  return (
    <Box p="2">
      <Text size="2" color="gray" as="div" mb="3">
        Apply against invoice <strong>{invoice.invoiceNumber}</strong>.
      </Text>

      <Box
        p="3"
        style={{
          borderRadius: "var(--radius-3)",
          background: "var(--gray-a2)",
          border: "1px solid var(--gray-a4)",
        }}
      >
        <Flex justify="between" mb="1">
          <Text size="2" color="gray">
            Invoice total
          </Text>
          <Text size="2">{formatCurrency(invoice.totalAmount, currencyCode)}</Text>
        </Flex>
        <Flex justify="between" mb="1">
          <Text size="2" color="gray">
            Already paid
          </Text>
          <Text size="2">{formatCurrency(invoice.paidAmount, currencyCode)}</Text>
        </Flex>
        <Separator size="4" my="2" />
        <Flex justify="between" align="center">
          <Text size="2" weight="bold">
            Outstanding balance
          </Text>
          <Heading size="5" style={{ color: "var(--red-11)" }}>
            {formatCurrency(invoice.balanceDue, currencyCode)}
          </Heading>
        </Flex>
      </Box>

      <Flex direction="column" gap="3" mt="4">
        <Box>
          <Text size="2" weight="medium" as="div" mb="2">
            Payment method
          </Text>
          <Flex gap="2" wrap="wrap">
            {allowedMethods.map((m) => {
              const meta = PAYMENT_METHOD_LABELS[m];
              const active = method === m;
              return (
                <Badge
                  key={m}
                  color={active ? meta.color : "gray"}
                  variant={active ? "solid" : "soft"}
                  radius="full"
                  onClick={() => setMethod(m)}
                  style={{
                    cursor: "pointer",
                    userSelect: "none",
                    padding: "6px 10px",
                  }}
                >
                  {meta.label}
                </Badge>
              );
            })}
          </Flex>
        </Box>

        <Flex direction={{ initial: "column", sm: "row" }} gap="3">
          <Box style={{ flex: 1 }}>
            <Text size="2" weight="medium" as="div" mb="1">
              Amount
            </Text>
            <TextField.Root
              size="3"
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Flex gap="2" mt="2">
              <Badge
                color="indigo"
                variant="soft"
                radius="full"
                onClick={() => setAmount(String(invoice.balanceDue))}
                style={{ cursor: "pointer", userSelect: "none" }}
              >
                Full balance
              </Badge>
              <Badge
                color="gray"
                variant="soft"
                radius="full"
                onClick={() => setAmount(String(invoice.balanceDue / 2))}
                style={{ cursor: "pointer", userSelect: "none" }}
              >
                50%
              </Badge>
            </Flex>
          </Box>
          <Box style={{ flex: 1 }}>
            <Text size="2" weight="medium" as="div" mb="1">
              Payment date
            </Text>
            <TextField.Root
              size="3"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </Box>
        </Flex>

        <Box>
          <Text size="2" weight="medium" as="div" mb="1">
            Reference number {requiresRef && <Text color="red">*</Text>}
          </Text>
          <TextField.Root
            size="3"
            value={referenceNumber}
            placeholder={
              method === PaymentMethodDto.BankTransfer
                ? "Bank ref number"
                : method === PaymentMethodDto.Check
                  ? "Check number"
                  : method === PaymentMethodDto.GCash
                    ? "GCash reference"
                    : "Optional"
            }
            onChange={(e) => setReferenceNumber(e.target.value)}
          />
        </Box>

        <Box>
          <Text size="2" weight="medium" as="div" mb="1">
            Notes
          </Text>
          <TextArea
            value={notes}
            rows={2}
            placeholder="Anything notable about this payment…"
            onChange={(e) => setNotes(e.target.value)}
          />
        </Box>

        {Number(amount) === invoice.balanceDue && (
          <Callout.Root color="green" variant="surface">
            <Callout.Icon>
              <InfoOutlined fontSize="small" />
            </Callout.Icon>
            <Callout.Text>
              This payment will fully settle the invoice — status will move to{" "}
              <strong>Paid</strong>.
            </Callout.Text>
          </Callout.Root>
        )}
      </Flex>

      <Flex justify="end" gap="3" mt="4">
        <Button type="Secondary" disabled={createCb.loading} onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="Primary"
          onClick={handleSubmit}
          loading={createCb.loading}
          disabled={createCb.loading}
        >
          Record payment
        </Button>
      </Flex>
    </Box>
  );
};
