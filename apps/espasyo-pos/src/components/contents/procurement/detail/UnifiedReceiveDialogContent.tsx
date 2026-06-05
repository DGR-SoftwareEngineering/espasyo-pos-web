import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Callout,
  Flex,
  Heading,
  ScrollArea,
  Separator,
  Switch,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import {
  Inventory2Outlined,
  PaymentsOutlined,
  ReceiptLongOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import { useApiCallback } from "core-lib/core/hooks";
import { useToastContext, usePublicSettings } from "core-lib/core/contexts";
import {
  CreatePaymentParams,
  CreateReceiptParams,
  CreateSupplierInvoiceParams,
  PaymentDto,
  PaymentMethodDto,
  PurchaseOrderDetailDto,
  ReceiptDto,
  SupplierInvoiceDetailDto,
} from "core-lib/api/commons/types";
import { Button } from "core-lib/components/radix/buttons/Button";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UnifiedReceiveResult {
  receipt: ReceiptDto;
  invoice?: SupplierInvoiceDetailDto;
  payment?: PaymentDto;
}

interface DraftLine {
  purchaseOrderItemID: string;
  productName: string;
  unitName: string;
  stockUnitName: string;
  conversionFactor: number | null;
  hasConfiguredConversion: boolean;
  ordered: number;
  alreadyReceived: number;
  remaining: number;
  quantity: string;
  unitCost: string;
  qualityNotes: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

const formatQuantity = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return "0";
  const fixed = Math.abs(value) >= 1000 ? 0 : value % 1 === 0 ? 0 : 2;
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: fixed,
    minimumFractionDigits: 0,
    useGrouping: true,
  }).format(value);
};

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
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const addDaysIsoDate = (isoDate: string, days: number): string => {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// ── Component ─────────────────────────────────────────────────────────────────

export const UnifiedReceiveDialogContent: React.FC<{
  purchaseOrder: PurchaseOrderDetailDto;
  onSuccess: (result: UnifiedReceiveResult) => void;
  onClose: () => void;
}> = ({ purchaseOrder, onSuccess, onClose }) => {
  const { showToast } = useToastContext();
  const { procurement, currencyCode } = usePublicSettings();

  const allowedMethods = useMemo(
    () =>
      procurement.allowedPaymentMethods.filter((m): m is PaymentMethodDto =>
        Object.values(PaymentMethodDto).includes(m as PaymentMethodDto),
      ),
    [procurement.allowedPaymentMethods],
  );

  // ── GRN state ──
  const [receivedDate, setReceivedDate] = useState(todayIsoDate());
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState("");
  const [grnNotes, setGrnNotes] = useState("");
  const [lines, setLines] = useState<DraftLine[]>(() =>
    purchaseOrder.items.map((item) => {
      const remaining = Math.max(0, item.quantity - item.quantityReceived);
      return {
        purchaseOrderItemID: item.purchaseOrderItemID,
        productName: item.productName,
        unitName: item.unitName,
        stockUnitName: item.stockUnitName,
        conversionFactor: item.conversionFactor,
        hasConfiguredConversion: item.hasConfiguredConversion,
        ordered: item.quantity,
        alreadyReceived: item.quantityReceived,
        remaining,
        quantity: remaining > 0 ? String(remaining) : "0",
        unitCost: String(item.unitPrice),
        qualityNotes: "",
      };
    }),
  );

  // ── Invoice state ──
  const [includeInvoice, setIncludeInvoice] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(todayIsoDate());
  const [dueDate, setDueDate] = useState(
    addDaysIsoDate(todayIsoDate(), procurement.invoiceDueDaysDefault),
  );
  const [subtotal, setSubtotal] = useState(String(purchaseOrder.subtotal));
  const [taxAmount, setTaxAmount] = useState(
    purchaseOrder.taxAmount ? String(purchaseOrder.taxAmount) : "",
  );
  const [discountAmount, setDiscountAmount] = useState(
    purchaseOrder.discountAmount ? String(purchaseOrder.discountAmount) : "",
  );
  const [shippingFee, setShippingFee] = useState(
    purchaseOrder.shippingFee ? String(purchaseOrder.shippingFee) : "",
  );
  const [invoiceNotes, setInvoiceNotes] = useState("");

  // ── Payment state ──
  const [includePayment, setIncludePayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodDto>(
    allowedMethods[0] ?? PaymentMethodDto.Cash,
  );
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(todayIsoDate());
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // ── API callbacks ──
  const receiptCb = useApiCallback(
    async (api, p: CreateReceiptParams) => api.commons.createReceipt(p),
  );
  const invoiceCb = useApiCallback(
    async (api, p: CreateSupplierInvoiceParams) => api.commons.createSupplierInvoice(p),
  );
  const paymentCb = useApiCallback(
    async (api, p: CreatePaymentParams) => api.commons.createPayment(p),
  );

  // ── Derived ──
  const overReceiptLines = useMemo(
    () => lines.filter((l) => (Number(l.quantity) || 0) > l.remaining),
    [lines],
  );

  const computedInvoiceTotal = useMemo(() => {
    const sub = Number(subtotal) || 0;
    const tax = Number(taxAmount) || 0;
    const disc = Number(discountAmount) || 0;
    const ship = Number(shippingFee) || 0;
    return Math.max(0, sub + tax + ship - disc);
  }, [subtotal, taxAmount, discountAmount, shippingFee]);

  const invoiceVariance = Math.abs(computedInvoiceTotal - purchaseOrder.totalAmount);
  const invoiceVariancePct =
    purchaseOrder.totalAmount > 0
      ? (invoiceVariance / purchaseOrder.totalAmount) * 100
      : 0;
  const hasMaterialVariance = procurement.warnOnInvoiceVariance && invoiceVariancePct > 1;

  const requiresRef = REQUIRES_REFERENCE.has(paymentMethod);

  useEffect(() => {
    if (!invoiceDate) return;
    setDueDate(addDaysIsoDate(invoiceDate, procurement.invoiceDueDaysDefault));
  }, [invoiceDate, procurement.invoiceDueDaysDefault]);

  // ── Toggle handlers ──
  const handleIncludeInvoiceToggle = (checked: boolean) => {
    setIncludeInvoice(checked);
    if (!checked) setIncludePayment(false);
  };

  const handleIncludePaymentToggle = (checked: boolean) => {
    setIncludePayment(checked);
    if (checked) setPaymentAmount(String(computedInvoiceTotal));
  };

  // ── Line helpers ──
  const updateLine = (id: string, field: keyof DraftLine, value: string) =>
    setLines((prev) =>
      prev.map((l) => (l.purchaseOrderItemID === id ? { ...l, [field]: value } : l)),
    );
  const fillRemaining = () =>
    setLines((prev) =>
      prev.map((l) => ({ ...l, quantity: l.remaining > 0 ? String(l.remaining) : "0" })),
    );
  const clearAll = () => setLines((prev) => prev.map((l) => ({ ...l, quantity: "0" })));

  // ── Submit ──
  const handleSubmit = async () => {
    const itemsToReceive = lines
      .filter((l) => (Number(l.quantity) || 0) > 0)
      .map((l) => ({
        purchaseOrderItemID: l.purchaseOrderItemID,
        quantity: Number(l.quantity),
        unitCost: l.unitCost ? Number(l.unitCost) : undefined,
        qualityNotes: l.qualityNotes.trim() || undefined,
      }));

    if (itemsToReceive.length === 0) {
      showToast("Enter a quantity for at least one line", "error");
      return;
    }
    if (overReceiptLines.length > 0 && !procurement.allowOverReceipt) {
      showToast("Over-receipt is disabled. Reduce the over quantities first.", "error");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Receipt
      const receiptResult = await receiptCb.execute({
        purchaseOrderID: purchaseOrder.purchaseOrderID,
        receivedDate,
        deliveryNoteNumber: deliveryNoteNumber.trim() || undefined,
        notes: grnNotes.trim() || undefined,
        items: itemsToReceive,
      });

      if (!receiptResult?.data?.success || !receiptResult.data.response) {
        const msg =
          (Array.isArray(receiptResult?.data?.errors)
            ? (receiptResult.data.errors as string[])[0]
            : null) ??
          receiptResult?.data?.message ??
          "Failed to record receipt";
        showToast(msg, "error");
        return;
      }
      const receipt: ReceiptDto = receiptResult.data.response;

      let invoice: SupplierInvoiceDetailDto | undefined;
      let payment: PaymentDto | undefined;

      // 2. Invoice (optional)
      if (includeInvoice) {
        if (!invoiceNumber.trim()) {
          showToast("Invoice number is required", "error");
          onSuccess({ receipt });
          return;
        }
        const sub = Number(subtotal);
        if (!Number.isFinite(sub) || sub <= 0) {
          showToast("Subtotal must be greater than zero", "error");
          onSuccess({ receipt });
          return;
        }
        if (new Date(dueDate) < new Date(invoiceDate)) {
          showToast("Due date cannot be earlier than invoice date", "error");
          onSuccess({ receipt });
          return;
        }

        const invoiceResult = await invoiceCb.execute({
          purchaseOrderID: purchaseOrder.purchaseOrderID,
          invoiceNumber: invoiceNumber.trim(),
          invoiceDate,
          dueDate,
          subtotal: sub,
          taxAmount: taxAmount ? Number(taxAmount) : undefined,
          discountAmount: discountAmount ? Number(discountAmount) : undefined,
          shippingFee: shippingFee ? Number(shippingFee) : undefined,
          notes: invoiceNotes.trim() || undefined,
        });

        if (!invoiceResult?.data?.success || !invoiceResult.data.response) {
          const msg =
            (Array.isArray(invoiceResult?.data?.errors)
              ? (invoiceResult.data.errors as string[])[0]
              : null) ??
            invoiceResult?.data?.message ??
            "Failed to record invoice";
          showToast(`Receipt recorded. Invoice failed: ${msg}`, "warning");
          onSuccess({ receipt });
          return;
        }
        invoice = invoiceResult.data.response;

        // 3. Payment (optional)
        if (includePayment) {
          const amt = Number(paymentAmount);
          if (!Number.isFinite(amt) || amt <= 0) {
            showToast("Receipt + invoice recorded. Payment amount is invalid.", "warning");
          } else if (REQUIRES_REFERENCE.has(paymentMethod) && !referenceNumber.trim()) {
            showToast(
              `Receipt + invoice recorded. ${PAYMENT_METHOD_LABELS[paymentMethod].label} requires a reference number.`,
              "warning",
            );
          } else {
            const paymentResult = await paymentCb.execute({
              supplierInvoiceID: invoice.supplierInvoiceID,
              method: paymentMethod,
              referenceNumber: referenceNumber.trim() || undefined,
              amount: amt,
              paymentDate,
              notes: paymentNotes.trim() || undefined,
            });
            if (paymentResult?.data?.success && paymentResult.data.response) {
              payment = paymentResult.data.response;
            } else {
              const msg =
                (Array.isArray(paymentResult?.data?.errors)
                  ? (paymentResult.data.errors as string[])[0]
                  : null) ??
                paymentResult?.data?.message ??
                "Failed to record payment";
              showToast(`Receipt + invoice recorded. Payment failed: ${msg}`, "warning");
            }
          }
        }
      }

      const parts = ["Receipt"]
        .concat(invoice ? ["Invoice"] : [])
        .concat(payment ? ["Payment"] : []);
      showToast(`${parts.join(" + ")} recorded`, "success");
      onSuccess({ receipt, invoice, payment });
    } catch (error) {
      const first =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "An unexpected error occurred";
      showToast(first, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const submitLabel = includeInvoice
    ? includePayment
      ? "Record receipt, invoice & payment"
      : "Record receipt & invoice"
    : "Record receipt";

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <ScrollArea style={{ flex: 1 }}>
        <Box p="2">
          {/* ── GRN fields ── */}
          <Flex direction={{ initial: "column", sm: "row" }} gap="3">
            <Box style={{ flex: 1 }}>
              <Text size="2" weight="medium" as="div" mb="1">
                Received date
              </Text>
              <TextField.Root
                size="3"
                type="date"
                value={receivedDate}
                disabled={submitting}
                onChange={(e) => setReceivedDate(e.target.value)}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <Text size="2" weight="medium" as="div" mb="1">
                Delivery note / DR number
              </Text>
              <TextField.Root
                size="3"
                value={deliveryNoteNumber}
                placeholder="Supplier-provided reference"
                disabled={submitting}
                onChange={(e) => setDeliveryNoteNumber(e.target.value)}
              />
            </Box>
          </Flex>

          <Separator size="4" my="4" />

          <Flex justify="between" align="center" mb="2">
            <Heading size="3">Line items</Heading>
            <Flex gap="2">
              <Button type="Secondary" onClick={fillRemaining} disabled={submitting}>
                Fill remaining
              </Button>
              <Button type="Secondary" onClick={clearAll} disabled={submitting}>
                Clear all
              </Button>
            </Flex>
          </Flex>

          <Flex direction="column" gap="2">
            {lines.map((line) => {
              const qty = Number(line.quantity) || 0;
              const isOver = qty > line.remaining;
              const isFull = qty === line.remaining && line.remaining > 0;
              return (
                <Box
                  key={line.purchaseOrderItemID}
                  p="3"
                  style={{
                    borderRadius: "var(--radius-3)",
                    border: `1px solid var(--${isOver ? "amber" : "gray"}-a4)`,
                    background: isOver
                      ? "var(--amber-a2)"
                      : isFull
                        ? "var(--green-a2)"
                        : "var(--gray-a2)",
                  }}
                >
                  <Flex justify="between" align="start" gap="3" wrap="wrap">
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text size="2" weight="medium" as="div">
                        {line.productName}
                      </Text>
                      <Flex align="center" gap="2" mt="1" wrap="wrap">
                        <Badge color="gray" variant="soft" radius="full" size="1">
                          Ordered {formatQuantity(line.ordered)} {line.unitName}
                        </Badge>
                        {line.alreadyReceived > 0 && (
                          <Badge color="teal" variant="soft" radius="full" size="1">
                            Already in: {formatQuantity(line.alreadyReceived)}
                          </Badge>
                        )}
                        <Badge
                          color={line.remaining === 0 ? "green" : "indigo"}
                          variant="soft"
                          radius="full"
                          size="1"
                        >
                          Remaining: {formatQuantity(line.remaining)}
                        </Badge>
                      </Flex>
                    </Box>
                    <Flex gap="2" align="end">
                      <Box style={{ width: 110 }}>
                        <Text size="1" color="gray" as="div" mb="1">
                          Receive qty
                        </Text>
                        <TextField.Root
                          size="2"
                          type="number"
                          min={0}
                          step="any"
                          value={line.quantity}
                          disabled={submitting}
                          onChange={(e) =>
                            updateLine(line.purchaseOrderItemID, "quantity", e.target.value)
                          }
                        />
                      </Box>
                      <Box style={{ width: 110 }}>
                        <Text size="1" color="gray" as="div" mb="1">
                          Unit cost
                        </Text>
                        <TextField.Root
                          size="2"
                          type="number"
                          min={0}
                          step="0.01"
                          value={line.unitCost}
                          disabled={submitting}
                          onChange={(e) =>
                            updateLine(line.purchaseOrderItemID, "unitCost", e.target.value)
                          }
                        />
                      </Box>
                    </Flex>
                  </Flex>
                  {(() => {
                    const sameUnit = line.unitName === line.stockUnitName;
                    if (sameUnit) return null;
                    if (line.hasConfiguredConversion && line.conversionFactor) {
                      const stockQty = qty * line.conversionFactor;
                      return (
                        <Box
                          mt="2"
                          p="2"
                          style={{
                            borderRadius: "var(--radius-2)",
                            background: "var(--indigo-a2)",
                            border: "1px solid var(--indigo-a4)",
                          }}
                        >
                          <Text size="1" color="indigo" as="div">
                            <strong>
                              {formatQuantity(qty)} {line.unitName}
                            </strong>{" "}
                            →{" "}
                            <strong>
                              {formatQuantity(stockQty)} {line.stockUnitName}
                            </strong>{" "}
                            will be added to inventory (1 {line.unitName} ={" "}
                            {formatQuantity(line.conversionFactor)} {line.stockUnitName}).
                          </Text>
                        </Box>
                      );
                    }
                    return (
                      <Box
                        mt="2"
                        p="2"
                        style={{
                          borderRadius: "var(--radius-2)",
                          background: "var(--amber-a2)",
                          border: "1px solid var(--amber-a4)",
                        }}
                      >
                        <Flex align="start" gap="2">
                          <WarningAmberOutlined
                            fontSize="small"
                            style={{ color: "var(--amber-11)" }}
                          />
                          <Text size="1" color="amber" as="div">
                            No <strong>{line.unitName}</strong> →{" "}
                            <strong>{line.stockUnitName}</strong> conversion configured.
                            This receipt will record 1:1.
                          </Text>
                        </Flex>
                      </Box>
                    );
                  })()}
                  <Box mt="2">
                    <TextField.Root
                      size="1"
                      value={line.qualityNotes}
                      placeholder="Quality / damage notes (optional)"
                      disabled={submitting}
                      onChange={(e) =>
                        updateLine(line.purchaseOrderItemID, "qualityNotes", e.target.value)
                      }
                    />
                  </Box>
                </Box>
              );
            })}
          </Flex>

          {overReceiptLines.length > 0 && (
            <Callout.Root
              color={procurement.allowOverReceipt ? "amber" : "red"}
              variant="surface"
              mt="3"
            >
              <Callout.Icon>
                <WarningAmberOutlined fontSize="small" />
              </Callout.Icon>
              <Callout.Text>
                {procurement.allowOverReceipt
                  ? `${overReceiptLines.length} line${overReceiptLines.length === 1 ? "" : "s"} exceed the remaining quantity.`
                  : `${overReceiptLines.length} line${overReceiptLines.length === 1 ? "" : "s"} exceed the remaining quantity. Over-receipt is disabled — reduce to proceed.`}
              </Callout.Text>
            </Callout.Root>
          )}

          <Box mt="3">
            <Text size="2" weight="medium" as="div" mb="1">
              Notes
            </Text>
            <TextArea
              value={grnNotes}
              rows={2}
              placeholder="Anything to capture for the audit trail…"
              disabled={submitting}
              onChange={(e) => setGrnNotes(e.target.value)}
            />
          </Box>

          {/* ── Invoice section toggle ── */}
          <Box
            mt="4"
            p="3"
            style={{
              borderRadius: "var(--radius-3)",
              border: includeInvoice
                ? "1px solid var(--indigo-a5)"
                : "1px solid var(--gray-a4)",
              background: includeInvoice ? "var(--indigo-a2)" : "var(--gray-a2)",
            }}
          >
            <Flex align="center" justify="between" gap="3">
              <Flex align="center" gap="2">
                <ReceiptLongOutlined
                  style={{
                    fontSize: 20,
                    color: includeInvoice ? "var(--indigo-11)" : "var(--gray-11)",
                  }}
                />
                <Box>
                  <Text
                    size="2"
                    weight="medium"
                    style={{ color: includeInvoice ? "var(--indigo-12)" : undefined }}
                  >
                    Record supplier invoice
                  </Text>
                  <Text size="1" color="gray" as="div">
                    Capture what {purchaseOrder.supplierName} billed for this delivery
                  </Text>
                </Box>
              </Flex>
              <Switch
                checked={includeInvoice}
                disabled={submitting}
                onCheckedChange={handleIncludeInvoiceToggle}
              />
            </Flex>

            {includeInvoice && (
              <Box mt="3">
                <Separator size="4" mb="3" />
                <Flex direction="column" gap="3">
                  <Box>
                    <Text size="2" weight="medium" as="div" mb="1">
                      Invoice number (from supplier)
                    </Text>
                    <TextField.Root
                      size="3"
                      value={invoiceNumber}
                      placeholder="INV-12345"
                      disabled={submitting}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                    />
                  </Box>
                  <Flex direction={{ initial: "column", sm: "row" }} gap="3">
                    <Box style={{ flex: 1 }}>
                      <Text size="2" weight="medium" as="div" mb="1">
                        Invoice date
                      </Text>
                      <TextField.Root
                        size="3"
                        type="date"
                        value={invoiceDate}
                        disabled={submitting}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                      />
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Text size="2" weight="medium" as="div" mb="1">
                        Due date
                      </Text>
                      <TextField.Root
                        size="3"
                        type="date"
                        value={dueDate}
                        disabled={submitting}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                      <Text size="1" color="gray" as="div" mt="1">
                        Default: invoice date + {procurement.invoiceDueDaysDefault} days
                      </Text>
                    </Box>
                  </Flex>
                  <Flex direction={{ initial: "column", sm: "row" }} gap="3">
                    <Box style={{ flex: 1 }}>
                      <Text size="2" weight="medium" as="div" mb="1">
                        Subtotal
                      </Text>
                      <TextField.Root
                        size="3"
                        type="number"
                        min={0}
                        step="0.01"
                        value={subtotal}
                        disabled={submitting}
                        onChange={(e) => setSubtotal(e.target.value)}
                      />
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Text size="2" weight="medium" as="div" mb="1">
                        Tax
                      </Text>
                      <TextField.Root
                        size="3"
                        type="number"
                        min={0}
                        step="0.01"
                        value={taxAmount}
                        placeholder="0"
                        disabled={submitting}
                        onChange={(e) => setTaxAmount(e.target.value)}
                      />
                    </Box>
                  </Flex>
                  <Flex direction={{ initial: "column", sm: "row" }} gap="3">
                    <Box style={{ flex: 1 }}>
                      <Text size="2" weight="medium" as="div" mb="1">
                        Shipping
                      </Text>
                      <TextField.Root
                        size="3"
                        type="number"
                        min={0}
                        step="0.01"
                        value={shippingFee}
                        placeholder="0"
                        disabled={submitting}
                        onChange={(e) => setShippingFee(e.target.value)}
                      />
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Text size="2" weight="medium" as="div" mb="1">
                        Discount
                      </Text>
                      <TextField.Root
                        size="3"
                        type="number"
                        min={0}
                        step="0.01"
                        value={discountAmount}
                        placeholder="0"
                        disabled={submitting}
                        onChange={(e) => setDiscountAmount(e.target.value)}
                      />
                    </Box>
                  </Flex>
                  <Box>
                    <Text size="2" weight="medium" as="div" mb="1">
                      Notes
                    </Text>
                    <TextArea
                      value={invoiceNotes}
                      rows={2}
                      placeholder="Anything notable about this invoice…"
                      disabled={submitting}
                      onChange={(e) => setInvoiceNotes(e.target.value)}
                    />
                  </Box>
                  <Box
                    p="3"
                    style={{
                      borderRadius: "var(--radius-3)",
                      background: "var(--accent-a2)",
                      border: "1px solid var(--accent-a4)",
                    }}
                  >
                    <Flex justify="between" align="center" mb="1">
                      <Text size="2" color="gray">
                        PO total
                      </Text>
                      <Text size="2">
                        {formatCurrency(purchaseOrder.totalAmount, currencyCode)}
                      </Text>
                    </Flex>
                    <Flex justify="between" align="center">
                      <Text size="3" weight="bold">
                        Invoice total
                      </Text>
                      <Heading size="5">
                        {formatCurrency(computedInvoiceTotal, currencyCode)}
                      </Heading>
                    </Flex>
                  </Box>
                  {hasMaterialVariance && (
                    <Callout.Root color="amber" variant="surface">
                      <Callout.Icon>
                        <WarningAmberOutlined fontSize="small" />
                      </Callout.Icon>
                      <Callout.Text>
                        Invoice total differs from PO total by{" "}
                        {formatCurrency(invoiceVariance, currencyCode)} (
                        {invoiceVariancePct.toFixed(1)}%). The PO will be flagged with a
                        variance chip.
                      </Callout.Text>
                    </Callout.Root>
                  )}

                  {/* ── Payment section toggle ── */}
                  <Box
                    p="3"
                    style={{
                      borderRadius: "var(--radius-3)",
                      border: includePayment
                        ? "1px solid var(--green-a5)"
                        : "1px solid var(--gray-a4)",
                      background: includePayment ? "var(--green-a2)" : "var(--color-panel-solid)",
                    }}
                  >
                    <Flex align="center" justify="between" gap="3">
                      <Flex align="center" gap="2">
                        <PaymentsOutlined
                          style={{
                            fontSize: 20,
                            color: includePayment ? "var(--green-11)" : "var(--gray-11)",
                          }}
                        />
                        <Box>
                          <Text
                            size="2"
                            weight="medium"
                            style={{ color: includePayment ? "var(--green-12)" : undefined }}
                          >
                            Record payment now
                          </Text>
                          <Text size="1" color="gray" as="div">
                            Settle this invoice immediately
                          </Text>
                        </Box>
                      </Flex>
                      <Switch
                        checked={includePayment}
                        disabled={submitting}
                        onCheckedChange={handleIncludePaymentToggle}
                      />
                    </Flex>

                    {includePayment && (
                      <Box mt="3">
                        <Separator size="4" mb="3" />
                        <Flex direction="column" gap="3">
                          <Box>
                            <Text size="2" weight="medium" as="div" mb="2">
                              Payment method
                            </Text>
                            <Flex gap="2" wrap="wrap">
                              {allowedMethods.map((m) => {
                                const meta = PAYMENT_METHOD_LABELS[m];
                                const active = paymentMethod === m;
                                return (
                                  <Badge
                                    key={m}
                                    color={active ? meta.color : "gray"}
                                    variant={active ? "solid" : "soft"}
                                    radius="full"
                                    onClick={() => !submitting && setPaymentMethod(m)}
                                    style={{
                                      cursor: submitting ? "default" : "pointer",
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
                                value={paymentAmount}
                                disabled={submitting}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                              />
                              <Flex gap="2" mt="2">
                                <Badge
                                  color="indigo"
                                  variant="soft"
                                  radius="full"
                                  onClick={() =>
                                    !submitting &&
                                    setPaymentAmount(String(computedInvoiceTotal))
                                  }
                                  style={{
                                    cursor: submitting ? "default" : "pointer",
                                    userSelect: "none",
                                  }}
                                >
                                  Full balance
                                </Badge>
                                <Badge
                                  color="gray"
                                  variant="soft"
                                  radius="full"
                                  onClick={() =>
                                    !submitting &&
                                    setPaymentAmount(String(computedInvoiceTotal / 2))
                                  }
                                  style={{
                                    cursor: submitting ? "default" : "pointer",
                                    userSelect: "none",
                                  }}
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
                                disabled={submitting}
                                onChange={(e) => setPaymentDate(e.target.value)}
                              />
                            </Box>
                          </Flex>
                          <Box>
                            <Text size="2" weight="medium" as="div" mb="1">
                              Reference number{" "}
                              {requiresRef && <Text color="red">*</Text>}
                            </Text>
                            <TextField.Root
                              size="3"
                              value={referenceNumber}
                              placeholder={
                                paymentMethod === PaymentMethodDto.BankTransfer
                                  ? "Bank ref number"
                                  : paymentMethod === PaymentMethodDto.Check
                                    ? "Check number"
                                    : paymentMethod === PaymentMethodDto.GCash
                                      ? "GCash reference"
                                      : "Optional"
                              }
                              disabled={submitting}
                              onChange={(e) => setReferenceNumber(e.target.value)}
                            />
                          </Box>
                          <Box>
                            <Text size="2" weight="medium" as="div" mb="1">
                              Notes
                            </Text>
                            <TextArea
                              value={paymentNotes}
                              rows={2}
                              placeholder="Anything notable about this payment…"
                              disabled={submitting}
                              onChange={(e) => setPaymentNotes(e.target.value)}
                            />
                          </Box>
                          {Number(paymentAmount) === computedInvoiceTotal &&
                            computedInvoiceTotal > 0 && (
                              <Callout.Root color="green" variant="surface">
                                <Callout.Icon>
                                  <Inventory2Outlined fontSize="small" />
                                </Callout.Icon>
                                <Callout.Text>
                                  This payment will fully settle the invoice — status will
                                  move to <strong>Paid</strong>.
                                </Callout.Text>
                              </Callout.Root>
                            )}
                        </Flex>
                      </Box>
                    )}
                  </Box>
                </Flex>
              </Box>
            )}
          </Box>
        </Box>
      </ScrollArea>

      {/* ── Action buttons (fixed outside scroll) ── */}
      <Flex
        justify="end"
        gap="3"
        pt="3"
        style={{ borderTop: "1px solid var(--gray-a4)" }}
      >
        <Button type="Secondary" disabled={submitting} onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="Primary"
          onClick={handleSubmit}
          loading={submitting}
          disabled={
            submitting ||
            (!procurement.allowOverReceipt && overReceiptLines.length > 0)
          }
        >
          {submitLabel}
        </Button>
      </Flex>
    </Box>
  );
};
