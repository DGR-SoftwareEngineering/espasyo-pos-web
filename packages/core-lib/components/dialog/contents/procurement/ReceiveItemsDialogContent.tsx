import React, { useMemo, useState } from "react";
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
import {
  Inventory2Outlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import { useApiCallback } from "../../../../core/hooks";
import { useToastContext, usePublicSettings } from "../../../../core/contexts";
import {
  CreateReceiptParams,
  PurchaseOrderDetailDto,
} from "../../../../api/commons/types";
import { Button } from "../../../radix/buttons/Button";

const formatQuantity = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return "0";
  const fixed = Math.abs(value) >= 1000 ? 0 : value % 1 === 0 ? 0 : 2;
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: fixed,
    minimumFractionDigits: 0,
    useGrouping: true,
  }).format(value);
};

const todayIsoDate = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

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

export const ReceiveItemsDialogContent: React.FC<{
  purchaseOrder: PurchaseOrderDetailDto;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ purchaseOrder, onSuccess, onClose }) => {
  const { showToast } = useToastContext();
  const { procurement } = usePublicSettings();
  const [receivedDate, setReceivedDate] = useState(todayIsoDate());
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState("");
  const [notes, setNotes] = useState("");
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

  const createCb = useApiCallback(
    async (api, args: CreateReceiptParams) =>
      await api.commons.createReceipt(args),
  );

  const updateLine = (
    purchaseOrderItemID: string,
    field: keyof DraftLine,
    value: string,
  ) =>
    setLines((prev) =>
      prev.map((line) =>
        line.purchaseOrderItemID === purchaseOrderItemID
          ? { ...line, [field]: value }
          : line,
      ),
    );

  const fillRemaining = () =>
    setLines((prev) =>
      prev.map((line) => ({
        ...line,
        quantity: line.remaining > 0 ? String(line.remaining) : "0",
      })),
    );
  const clearAll = () =>
    setLines((prev) => prev.map((line) => ({ ...line, quantity: "0" })));

  const overReceiptLines = useMemo(
    () =>
      lines.filter((line) => {
        const qty = Number(line.quantity) || 0;
        return qty > line.remaining;
      }),
    [lines],
  );

  const handleSubmit = async () => {
    const itemsToReceive = lines
      .filter((line) => (Number(line.quantity) || 0) > 0)
      .map((line) => ({
        purchaseOrderItemID: line.purchaseOrderItemID,
        quantity: Number(line.quantity),
        unitCost: line.unitCost ? Number(line.unitCost) : undefined,
        qualityNotes: line.qualityNotes.trim() || undefined,
      }));

    if (itemsToReceive.length === 0) {
      showToast("Enter a quantity for at least one line", "error");
      return;
    }

    if (overReceiptLines.length > 0 && !procurement.allowOverReceipt) {
      showToast(
        "Over-receipt is disabled in settings. Reduce the over quantities first.",
        "error",
      );
      return;
    }

    try {
      const result = await createCb.execute({
        purchaseOrderID: purchaseOrder.purchaseOrderID,
        receivedDate,
        deliveryNoteNumber: deliveryNoteNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        items: itemsToReceive,
      });
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data?.success &&
        result.data.response
      ) {
        showToast(
          `Receipt ${result.data.response.receiptNumber} recorded`,
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
        "Failed to record receipt";
      showToast(message, "error");
    } catch (error) {
      console.error("Receipt error:", error);
      const first =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to record receipt";
      showToast(first, "error");
    }
  };

  return (
    <Box p="2">
      <Text size="2" color="gray" as="div" mb="3">
        Quantities are pre-filled with what&apos;s outstanding. This creates a
        stock movement and updates inventory immediately.
      </Text>

      <Flex direction={{ initial: "column", sm: "row" }} gap="3">
        <Box style={{ flex: 1 }}>
          <Text size="2" weight="medium" as="div" mb="1">
            Received date
          </Text>
          <TextField.Root
            size="3"
            type="date"
            value={receivedDate}
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
            onChange={(e) => setDeliveryNoteNumber(e.target.value)}
          />
        </Box>
      </Flex>

      <Separator size="4" my="4" />

      <Flex justify="between" align="center" mb="2">
        <Heading size="3">Line items</Heading>
        <Flex gap="2">
          <Button type="Secondary" onClick={fillRemaining}>
            Fill remaining
          </Button>
          <Button type="Secondary" onClick={clearAll}>
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
                  <Flex align="center" gap="2" mt="1">
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
                      onChange={(e) =>
                        updateLine(
                          line.purchaseOrderItemID,
                          "quantity",
                          e.target.value,
                        )
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
                      onChange={(e) =>
                        updateLine(
                          line.purchaseOrderItemID,
                          "unitCost",
                          e.target.value,
                        )
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
                        {formatQuantity(line.conversionFactor)}{" "}
                        {line.stockUnitName}).
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
                        <strong>{line.stockUnitName}</strong> conversion
                        configured. This receipt will record 1:1 — admins will
                        be notified to define a conversion for future receipts.
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
                  onChange={(e) =>
                    updateLine(
                      line.purchaseOrderItemID,
                      "qualityNotes",
                      e.target.value,
                    )
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
              ? `${overReceiptLines.length} line${overReceiptLines.length === 1 ? "" : "s"} exceed the remaining quantity. This will trigger an over-receipt warning notification.`
              : `${overReceiptLines.length} line${overReceiptLines.length === 1 ? "" : "s"} exceed the remaining quantity. Over-receipt is disabled in settings — reduce the over quantities to proceed.`}
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
          placeholder="Anything to capture for the audit trail…"
          onChange={(e) => setNotes(e.target.value)}
        />
      </Box>

      <Callout.Root color="blue" variant="surface" mt="3">
        <Callout.Icon>
          <Inventory2Outlined fontSize="small" />
        </Callout.Icon>
        <Callout.Text>
          Recording this receipt creates a <strong>StockMovement</strong> row
          of type <code>Received</code> for each line and increases the
          product&apos;s on-hand quantity in inventory.
        </Callout.Text>
      </Callout.Root>

      <Flex justify="end" gap="3" mt="4">
        <Button type="Secondary" disabled={createCb.loading} onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="Primary"
          onClick={handleSubmit}
          loading={createCb.loading}
          disabled={
            createCb.loading ||
            (!procurement.allowOverReceipt && overReceiptLines.length > 0)
          }
        >
          Record receipt
        </Button>
      </Flex>
    </Box>
  );
};
