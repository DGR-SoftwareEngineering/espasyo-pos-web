import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Callout,
  Flex,
  Heading,
  Separator,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { InfoOutlined, WarningAmberOutlined } from "@mui/icons-material";
import { useApiCallback } from "../../../../core/hooks";
import { useToastContext, usePublicSettings } from "../../../../core/contexts";
import {
  CreateSupplierInvoiceParams,
  PurchaseOrderDetailDto,
} from "../../../../api/commons/types";
import { Button } from "../../../radix/buttons/Button";

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

const addDaysIsoDate = (isoDate: string, days: number): string => {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

export const AddInvoiceDialogContent: React.FC<{
  purchaseOrder: PurchaseOrderDetailDto;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ purchaseOrder, onSuccess, onClose }) => {
  const { showToast } = useToastContext();
  const { procurement, currencyCode } = usePublicSettings();

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
  const [notes, setNotes] = useState("");

  const createCb = useApiCallback(
    async (api, args: CreateSupplierInvoiceParams) =>
      await api.commons.createSupplierInvoice(args),
  );

  useEffect(() => {
    if (!invoiceDate) return;
    setDueDate(addDaysIsoDate(invoiceDate, procurement.invoiceDueDaysDefault));
  }, [invoiceDate, procurement.invoiceDueDaysDefault]);

  const computedTotal = useMemo(() => {
    const sub = Number(subtotal) || 0;
    const tax = Number(taxAmount) || 0;
    const disc = Number(discountAmount) || 0;
    const ship = Number(shippingFee) || 0;
    return Math.max(0, sub + tax + ship - disc);
  }, [subtotal, taxAmount, discountAmount, shippingFee]);

  const variance = Math.abs(computedTotal - purchaseOrder.totalAmount);
  const variancePct =
    purchaseOrder.totalAmount > 0
      ? (variance / purchaseOrder.totalAmount) * 100
      : 0;
  const hasMaterialVariance =
    procurement.warnOnInvoiceVariance && variancePct > 1;

  const handleSubmit = async () => {
    if (!invoiceNumber.trim()) {
      showToast("Invoice number is required", "error");
      return;
    }
    const sub = Number(subtotal);
    if (!Number.isFinite(sub) || sub <= 0) {
      showToast("Subtotal must be greater than zero", "error");
      return;
    }
    if (new Date(dueDate) < new Date(invoiceDate)) {
      showToast("Due date cannot be earlier than invoice date", "error");
      return;
    }
    try {
      const result = await createCb.execute({
        purchaseOrderID: purchaseOrder.purchaseOrderID,
        invoiceNumber: invoiceNumber.trim(),
        invoiceDate,
        dueDate,
        subtotal: sub,
        taxAmount: taxAmount ? Number(taxAmount) : undefined,
        discountAmount: discountAmount ? Number(discountAmount) : undefined,
        shippingFee: shippingFee ? Number(shippingFee) : undefined,
        notes: notes.trim() || undefined,
      });
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data?.success &&
        result.data.response
      ) {
        showToast(
          `Invoice ${result.data.response.invoiceNumber} recorded`,
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
        "Failed to record invoice";
      showToast(message, "error");
    } catch (error) {
      console.error("Invoice error:", error);
      const status = (error as string[] & { status?: number }).status;
      if (status === 409) {
        showToast(
          `Invoice "${invoiceNumber}" already exists for this supplier`,
          "error",
        );
        return;
      }
      const first =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to record invoice";
      showToast(first, "error");
    }
  };

  return (
    <Box p="2">
      <Text size="2" color="gray" as="div" mb="3">
        Capture what {purchaseOrder.supplierName} billed against{" "}
        <strong>{purchaseOrder.orderNumber}</strong>.
      </Text>

      <Flex direction="column" gap="3">
        <Box>
          <Text size="2" weight="medium" as="div" mb="1">
            Invoice number (from supplier)
          </Text>
          <TextField.Root
            size="3"
            value={invoiceNumber}
            placeholder="INV-12345"
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
              onChange={(e) => setDueDate(e.target.value)}
            />
            <Text size="1" color="gray" as="div" mt="1">
              Default: invoice date + {procurement.invoiceDueDaysDefault} days
            </Text>
          </Box>
        </Flex>

        <Separator size="4" />

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
              onChange={(e) => setDiscountAmount(e.target.value)}
            />
          </Box>
        </Flex>

        <Box>
          <Text size="2" weight="medium" as="div" mb="1">
            Notes
          </Text>
          <TextArea
            value={notes}
            rows={2}
            placeholder="Anything notable about this invoice…"
            onChange={(e) => setNotes(e.target.value)}
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
              {formatCurrency(computedTotal, currencyCode)}
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
              {formatCurrency(variance, currencyCode)} ({variancePct.toFixed(1)}%).
              The PO will be flagged with a variance chip.
            </Callout.Text>
          </Callout.Root>
        )}

        <Callout.Root color="blue" variant="surface">
          <Callout.Icon>
            <InfoOutlined fontSize="small" />
          </Callout.Icon>
          <Callout.Text>
            Recording the invoice doesn&apos;t move money. Use{" "}
            <strong>Record payment</strong> after this to settle balance.
          </Callout.Text>
        </Callout.Root>
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
          Record invoice
        </Button>
      </Flex>
    </Box>
  );
};
