import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Badge,
  Box,
  Callout,
  Card,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Separator,
  Table,
  Tabs,
  Text,
  TextArea,
} from "@radix-ui/themes";
import {
  ArrowLeftIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import {
  LocalShippingOutlined,
  StorefrontOutlined,
  ReceiptLongOutlined,
  PaymentsOutlined,
  Inventory2Outlined,
  PrintOutlined,
} from "@mui/icons-material";
import { useApi, useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import { usePublicSettings } from "core-lib/core/contexts";
import { Button } from "core-lib/components/radix/buttons/Button";
import {
  FulfillmentMethodDto,
  PaymentDto,
  PurchaseOrderStatusDto,
  ReceiptDto,
  SupplierInvoiceDetailDto,
  SupplierInvoiceDto,
} from "core-lib/api/commons/types";
import {
  FULFILLMENT_META,
  INVOICE_STATUS_META,
  PAYMENT_METHOD_META,
  PO_STATUS_META,
} from "../constants";
import {
  formatCurrency,
  formatQuantity,
  formatShortDate,
  formatRelative,
} from "../format";
import { useDialogContext } from "core-lib";
import type { DialogContentType } from "core-lib/api/content/types/common";
import { PrintPreviewDialog } from "core-lib/components/print";
import { StatusTimeline } from "./StatusTimeline";
import {
  CombinedReceivingPrintable,
  PurchaseOrderPrintable,
  ReceiptPrintable,
  SupplierInvoicePrintable,
} from "../printables";
import {
  UnifiedReceiveDialogContent,
  UnifiedReceiveResult,
} from "./UnifiedReceiveDialogContent";

type PrintTarget =
  | { kind: "purchaseOrder" }
  | { kind: "receipt"; receipt: ReceiptDto }
  | { kind: "invoice"; invoice: SupplierInvoiceDetailDto }
  | { kind: "combined"; receipt: ReceiptDto; invoice?: SupplierInvoiceDetailDto; payment?: PaymentDto };

interface Props {
  purchaseOrderID: string;
}

export const PurchaseOrderDetailBlock: React.FC<Props> = ({
  purchaseOrderID,
}) => {
  const router = useRouter();
  const { showToast } = useToastContext();
  const { procurement, currencyCode, systemName, theme } = usePublicSettings();
  const { openDialog } = useDialogContext();
  const [reloadToken, setReloadToken] = useState(0);
  const [printTarget, setPrintTarget] = useState<PrintTarget | null>(null);
  const [unifiedReceiveOpen, setUnifiedReceiveOpen] = useState(false);

  const detailApi = useApi(
    (api) => api.commons.purchaseOrderGetById(purchaseOrderID),
    [purchaseOrderID, reloadToken],
  );

  const po = detailApi.result?.data?.response;
  const refresh = () => setReloadToken((n) => n + 1);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const submitCb = useApiCallback(
    async (api, id: string) => await api.commons.submitPurchaseOrder(id),
  );
  const approveCb = useApiCallback(
    async (api, id: string) => await api.commons.approvePurchaseOrder(id),
  );
  const cancelCb = useApiCallback(
    async (api, args: { id: string; reason: string }) =>
      await api.commons.cancelPurchaseOrder(args.id, args.reason),
  );
  const closeCb = useApiCallback(
    async (api, id: string) => await api.commons.closePurchaseOrder(id),
  );
  const invoiceDetailCb = useApiCallback(
    async (api, id: string) => await api.commons.supplierInvoiceGetById(id),
  );

  const handleTransition = async (
    fn: (id: string) => Promise<unknown>,
    label: string,
  ) => {
    try {
      await fn(purchaseOrderID);
      showToast(`Purchase order ${label}`, "success");
      refresh();
    } catch (error) {
      const first =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : `Failed to ${label.toLowerCase()}`;
      showToast(first, "error");
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      showToast("Cancellation reason is required", "error");
      return;
    }
    try {
      await cancelCb.execute({
        id: purchaseOrderID,
        reason: cancelReason.trim(),
      });
      showToast("Purchase order cancelled", "success");
      setCancelOpen(false);
      setCancelReason("");
      refresh();
    } catch (error) {
      const first =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to cancel";
      showToast(first, "error");
    }
  };

  const openReceive = () => {
    if (!po) return;
    setUnifiedReceiveOpen(true);
  };

  const handleUnifiedReceiveSuccess = (result: UnifiedReceiveResult) => {
    setUnifiedReceiveOpen(false);
    refresh();
    setPrintTarget({ kind: "combined", ...result });
  };

  const openAddInvoice = () => {
    if (!po) return;
    openDialog({
      title: "Record supplier invoice",
      dialogContentType:
        "PurchaseOrderAddInvoice" as unknown as DialogContentType,
      data: po,
      onSuccess: refresh,
    });
  };

  const openInvoicePayment = async (invoice: SupplierInvoiceDto) => {
    try {
      const result = await invoiceDetailCb.execute(invoice.supplierInvoiceID);
      const detail = result.data?.response;
      if (!detail) {
        showToast("Failed to load invoice detail", "error");
        return;
      }
      openDialog({
        title: "Record payment",
        dialogContentType:
          "InvoiceRecordPayment" as unknown as DialogContentType,
        data: detail,
        onSuccess: refresh,
      });
    } catch {
      showToast("Failed to load invoice detail", "error");
    }
  };

  const printPurchaseOrder = () => setPrintTarget({ kind: "purchaseOrder" });
  const printReceipt = (receipt: ReceiptDto) =>
    setPrintTarget({ kind: "receipt", receipt });
  const printInvoice = async (invoice: SupplierInvoiceDto) => {
    try {
      const result = await invoiceDetailCb.execute(invoice.supplierInvoiceID);
      const detail = result.data?.response;
      if (!detail) {
        showToast("Failed to load invoice detail", "error");
        return;
      }
      setPrintTarget({ kind: "invoice", invoice: detail });
    } catch {
      showToast("Failed to load invoice detail", "error");
    }
  };

  const totalReceivedPct = useMemo(() => {
    if (!po || po.totalQuantityOrdered === 0) return 0;
    return Math.min(
      100,
      Math.round((po.totalQuantityReceived / po.totalQuantityOrdered) * 100),
    );
  }, [po]);

  if (detailApi.loading && !po) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: 240 }}>
        <Text size="2" color="gray">
          Loading purchase order…
        </Text>
      </Flex>
    );
  }
  if (!po) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: 240 }}>
        <Text size="2" color="gray">
          Purchase order not found.
        </Text>
      </Flex>
    );
  }

  const canEdit = po.status === PurchaseOrderStatusDto.Draft;
  const canSubmit = po.status === PurchaseOrderStatusDto.Draft;
  const canApprove =
    procurement.requireApproval &&
    po.status === PurchaseOrderStatusDto.Submitted;
  const canReceive =
    po.status === PurchaseOrderStatusDto.Approved ||
    po.status === PurchaseOrderStatusDto.PartiallyReceived;
  const canCancel =
    po.status === PurchaseOrderStatusDto.Draft ||
    po.status === PurchaseOrderStatusDto.Submitted ||
    po.status === PurchaseOrderStatusDto.Approved;
  const canClose =
    po.status === PurchaseOrderStatusDto.Received ||
    po.status === PurchaseOrderStatusDto.PartiallyReceived;
  const canAddInvoice =
    po.status !== PurchaseOrderStatusDto.Draft &&
    po.status !== PurchaseOrderStatusDto.Cancelled;

  const statusMeta = PO_STATUS_META[po.status];
  const fulfillmentMeta = FULFILLMENT_META[po.fulfillmentMethod];

  return (
    <Box style={{ width: "100%" }}>
      <Flex align="center" gap="2" mb="3">
        <IconButton
          variant="ghost"
          color="gray"
          size="2"
          onClick={() => router.push("/admin/hub/procurement/purchase-orders")}
          aria-label="Back to list"
        >
          <ArrowLeftIcon />
        </IconButton>
        <Text size="2" color="gray">
          Purchase orders
        </Text>
      </Flex>

      <Card variant="surface" size="3" mb="4">
        <Flex justify="between" align="start" gap="3" wrap="wrap">
          <Box>
            <Flex align="center" gap="2" wrap="wrap" mb="1">
              <Heading size="6" weight="bold">
                {po.orderNumber}
              </Heading>
              <Badge color={statusMeta?.color ?? "gray"} variant="soft" radius="full">
                {statusMeta?.label}
              </Badge>
              <Badge
                color={fulfillmentMeta?.color ?? "gray"}
                variant="soft"
                radius="full"
              >
                <Flex align="center" gap="1">
                  {po.fulfillmentMethod === FulfillmentMethodDto.Delivery ? (
                    <LocalShippingOutlined style={{ fontSize: 14 }} />
                  ) : (
                    <StorefrontOutlined style={{ fontSize: 14 }} />
                  )}
                  {fulfillmentMeta?.label}
                </Flex>
              </Badge>
              {po.hasInvoiceVariance && (
                <Badge color="amber" variant="soft" radius="full">
                  Invoice variance
                </Badge>
              )}
            </Flex>
            <Text size="2" color="gray">
              {po.supplierName} · {po.paymentTerms} ·{" "}
              {po.expectedDate
                ? `Expected ${formatShortDate(po.expectedDate)}`
                : "No expected date"}
            </Text>
          </Box>
          <Flex gap="2" wrap="wrap" align="center">
            <IconButton
              variant="ghost"
              color="gray"
              onClick={refresh}
              disabled={detailApi.loading}
              aria-label="Refresh"
            >
              <ReloadIcon />
            </IconButton>
            <Button type="Secondary" onClick={printPurchaseOrder}>
              <Flex align="center" gap="2">
                <PrintOutlined fontSize="small" /> Print
              </Flex>
            </Button>
            {canSubmit && (
              <Button
                type="Primary"
                onClick={() =>
                  handleTransition(
                    (id) => submitCb.execute(id),
                    procurement.requireApproval ? "submitted" : "approved",
                  )
                }
                loading={submitCb.loading}
              >
                {procurement.requireApproval ? "Submit" : "Submit & approve"}
              </Button>
            )}
            {canApprove && (
              <Button
                type="Primary"
                onClick={() =>
                  handleTransition(
                    (id) => approveCb.execute(id),
                    "approved",
                  )
                }
                loading={approveCb.loading}
              >
                Approve
              </Button>
            )}
            {canReceive && (
              <Button type="Primary" onClick={() => openReceive()}>
                <Flex align="center" gap="2">
                  <Inventory2Outlined fontSize="small" /> Receive items
                </Flex>
              </Button>
            )}
            {canClose && (
              <Button
                type="Secondary"
                onClick={() =>
                  handleTransition((id) => closeCb.execute(id), "closed")
                }
                loading={closeCb.loading}
              >
                Close
              </Button>
            )}
            {canCancel && (
              <Button type="Secondary" onClick={() => setCancelOpen(true)}>
                Cancel
              </Button>
            )}
          </Flex>
        </Flex>

        <Separator size="4" my="3" />
        <StatusTimeline status={po.status} />
      </Card>

      <Box
        mb="4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
        }}
      >
        <KpiTile
          label="Total amount"
          value={formatCurrency(po.totalAmount, po.currencyCode)}
          accent="indigo"
        />
        <KpiTile
          label="Items"
          value={`${po.itemCount} lines · ${formatQuantity(po.totalQuantityOrdered)} units`}
          accent="violet"
        />
        <KpiTile
          label="Received"
          value={`${totalReceivedPct}%`}
          accent={
            totalReceivedPct === 100
              ? "teal"
              : totalReceivedPct > 0
                ? "amber"
                : "gray"
          }
        />
        <KpiTile
          label="Invoiced"
          value={formatCurrency(
            po.invoices
              .filter((i) => i.status !== 5)
              .reduce((s, i) => s + i.totalAmount, 0),
            po.currencyCode,
          )}
          accent="blue"
        />
      </Box>

      <Tabs.Root defaultValue="items">
        <Tabs.List size="2">
          <Tabs.Trigger value="items">
            Line items ({po.items.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="receipts">
            Receiving ({po.receipts.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="invoices">
            Invoices ({po.invoices.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        </Tabs.List>

        <Box mt="3">
          <Tabs.Content value="items">
            <Card variant="surface" size="2">
              <Table.Root variant="surface" size="2">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Product</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Ordered</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Unit price</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Discount</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Received</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Line total</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {po.items.map((item) => {
                    const receivedPct =
                      item.quantity > 0
                        ? Math.round((item.quantityReceived / item.quantity) * 100)
                        : 0;
                    return (
                      <Table.Row key={item.purchaseOrderItemID}>
                        <Table.Cell>
                          <Text size="2" weight="medium">
                            {item.productName}
                          </Text>
                          {item.notes && (
                            <Text size="1" color="gray" as="div">
                              {item.notes}
                            </Text>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="2">
                            {formatQuantity(item.quantity)} {item.unitName}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="2">
                            {formatCurrency(item.unitPrice, po.currencyCode)}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="2">
                            {item.discount
                              ? formatCurrency(item.discount, po.currencyCode)
                              : "—"}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex align="center" gap="2">
                            <Text size="2">
                              {formatQuantity(item.quantityReceived)} /{" "}
                              {formatQuantity(item.quantity)}
                            </Text>
                            <Badge
                              color={
                                receivedPct === 100
                                  ? "green"
                                  : receivedPct > 0
                                    ? "amber"
                                    : "gray"
                              }
                              variant="soft"
                              radius="full"
                              size="1"
                            >
                              {receivedPct}%
                            </Badge>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="2" weight="medium">
                            {formatCurrency(item.lineTotal, po.currencyCode)}
                          </Text>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Root>
              <Separator size="4" my="3" />
              <Flex direction="column" gap="1" align="end">
                <SummaryRow
                  label="Subtotal"
                  value={formatCurrency(po.subtotal, po.currencyCode)}
                />
                {po.taxAmount != null && po.taxAmount > 0 && (
                  <SummaryRow
                    label="Tax"
                    value={formatCurrency(po.taxAmount, po.currencyCode)}
                  />
                )}
                {po.shippingFee != null && po.shippingFee > 0 && (
                  <SummaryRow
                    label="Shipping"
                    value={formatCurrency(po.shippingFee, po.currencyCode)}
                  />
                )}
                {po.discountAmount != null && po.discountAmount > 0 && (
                  <SummaryRow
                    label="Discount"
                    value={`− ${formatCurrency(po.discountAmount, po.currencyCode)}`}
                  />
                )}
                <Flex gap="3" mt="1">
                  <Text size="3" weight="bold">
                    Total
                  </Text>
                  <Heading size="4">
                    {formatCurrency(po.totalAmount, po.currencyCode)}
                  </Heading>
                </Flex>
              </Flex>
            </Card>
          </Tabs.Content>

          <Tabs.Content value="receipts">
            <Card variant="surface" size="2">
              {po.receipts.length === 0 ? (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  gap="2"
                  p="6"
                >
                  <Inventory2Outlined
                    style={{ fontSize: 36, color: "var(--gray-9)" }}
                  />
                  <Text size="2" weight="medium">
                    Nothing received yet
                  </Text>
                  <Text size="1" color="gray">
                    Click <em>Receive items</em> when the supplier delivers.
                  </Text>
                  {canReceive && (
                    <Button
                      type="Primary"
                      onClick={() => openReceive()}
                    >
                      Receive items
                    </Button>
                  )}
                </Flex>
              ) : (
                <Flex direction="column" gap="2">
                  {po.receipts.map((receipt) => (
                    <ReceiptRow
                      key={receipt.receiptID}
                      receipt={receipt}
                      currencyCode={po.currencyCode}
                      onPrint={() => printReceipt(receipt)}
                    />
                  ))}
                </Flex>
              )}
            </Card>
          </Tabs.Content>

          <Tabs.Content value="invoices">
            <Card variant="surface" size="2">
              <Flex justify="between" align="center" mb="3">
                <Heading size="3">Supplier invoices</Heading>
                {canAddInvoice && (
                  <Button type="Primary" onClick={() => openAddInvoice()}>
                    <Flex align="center" gap="2">
                      <ReceiptLongOutlined fontSize="small" /> Record invoice
                    </Flex>
                  </Button>
                )}
              </Flex>
              {po.invoices.length === 0 ? (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  gap="2"
                  p="6"
                >
                  <ReceiptLongOutlined
                    style={{ fontSize: 36, color: "var(--gray-9)" }}
                  />
                  <Text size="2" weight="medium">
                    No invoices yet
                  </Text>
                  <Text size="1" color="gray">
                    Record a supplier invoice to track what we owe.
                  </Text>
                </Flex>
              ) : (
                <Flex direction="column" gap="2">
                  {po.invoices.map((invoice) => (
                    <InvoiceRow
                      key={invoice.supplierInvoiceID}
                      invoice={invoice}
                      currencyCode={po.currencyCode}
                      onRecordPayment={() => openInvoicePayment(invoice)}
                      onPrint={() => printInvoice(invoice)}
                    />
                  ))}
                </Flex>
              )}
            </Card>
          </Tabs.Content>

          <Tabs.Content value="overview">
            <Card variant="surface" size="2">
              <Flex direction="column" gap="3">
                <MetaRow label="Order number" value={po.orderNumber} />
                <MetaRow label="Supplier" value={po.supplierName} />
                <MetaRow
                  label="Order date"
                  value={formatShortDate(po.orderDate)}
                />
                <MetaRow
                  label="Expected date"
                  value={formatShortDate(po.expectedDate)}
                />
                <MetaRow label="Payment terms" value={po.paymentTerms} />
                {po.fulfillmentMethod === FulfillmentMethodDto.Delivery && (
                  <MetaRow
                    label="Delivery address"
                    value={po.deliveryAddress ?? "—"}
                  />
                )}
                {po.notes && <MetaRow label="Notes" value={po.notes} />}
                {po.approvedByUserName && (
                  <MetaRow
                    label="Approved by"
                    value={`${po.approvedByUserName} · ${formatShortDate(po.approvedAt)}`}
                  />
                )}
                {po.cancelReason && (
                  <Callout.Root color="red" variant="surface">
                    <Callout.Icon>
                      <ExclamationTriangleIcon />
                    </Callout.Icon>
                    <Callout.Text>
                      Cancelled: {po.cancelReason}
                    </Callout.Text>
                  </Callout.Root>
                )}
              </Flex>
            </Card>
          </Tabs.Content>
        </Box>
      </Tabs.Root>

      <PrintPreviewDialog
        open={printTarget !== null}
        onOpenChange={(open) => {
          if (!open) setPrintTarget(null);
        }}
        title={
          printTarget?.kind === "purchaseOrder"
            ? `Purchase order · ${po.orderNumber}`
            : printTarget?.kind === "receipt"
              ? `Receipt · ${printTarget.receipt.receiptNumber}`
              : printTarget?.kind === "invoice"
                ? `Invoice · ${printTarget.invoice.invoiceNumber}`
                : printTarget?.kind === "combined"
                  ? `Receiving · ${printTarget.receipt.receiptNumber}`
                  : "Print preview"
        }
      >
        {printTarget?.kind === "purchaseOrder" && (
          <PurchaseOrderPrintable
            purchaseOrder={po}
            businessName={systemName}
            logoUrl={theme?.logoUrl ?? null}
          />
        )}
        {printTarget?.kind === "receipt" && (
          <ReceiptPrintable
            receipt={printTarget.receipt}
            purchaseOrder={po}
            businessName={systemName}
            logoUrl={theme?.logoUrl ?? null}
          />
        )}
        {printTarget?.kind === "invoice" && (
          <SupplierInvoicePrintable
            invoice={printTarget.invoice}
            businessName={systemName}
            currencyCode={currencyCode}
            logoUrl={theme?.logoUrl ?? null}
          />
        )}
        {printTarget?.kind === "combined" && (
          <CombinedReceivingPrintable
            receipt={printTarget.receipt}
            purchaseOrder={po}
            invoice={printTarget.invoice}
            payment={printTarget.payment}
            businessName={systemName}
            currencyCode={currencyCode}
            logoUrl={theme?.logoUrl ?? null}
          />
        )}
      </PrintPreviewDialog>

      <Dialog.Root open={cancelOpen} onOpenChange={setCancelOpen}>
        <Dialog.Content style={{ maxWidth: 480 }}>
          <Dialog.Title>Cancel purchase order?</Dialog.Title>
          <Dialog.Description size="2" color="gray">
            This marks <strong>{po.orderNumber}</strong> as cancelled. It
            can&apos;t be uncancelled. Any received stock stays put.
          </Dialog.Description>
          <Box mt="3">
            <Text size="2" weight="medium" as="div" mb="1">
              Reason
            </Text>
            <TextArea
              value={cancelReason}
              rows={3}
              placeholder="Required — for the audit log"
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </Box>
          <Flex justify="end" gap="3" mt="4">
            <Button
              type="Secondary"
              disabled={cancelCb.loading}
              onClick={() => {
                setCancelOpen(false);
                setCancelReason("");
              }}
            >
              Keep PO
            </Button>
            <Button
              type="Primary"
              onClick={handleCancel}
              loading={cancelCb.loading}
              disabled={cancelCb.loading}
            >
              Cancel PO
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={unifiedReceiveOpen} onOpenChange={setUnifiedReceiveOpen}>
        <Dialog.Content
          maxWidth="680px"
          style={{
            maxHeight: "90vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Dialog.Title>Receive items</Dialog.Title>
          <Separator size="4" mb="3" />
          {po && unifiedReceiveOpen && (
            <UnifiedReceiveDialogContent
              purchaseOrder={po}
              onSuccess={handleUnifiedReceiveSuccess}
              onClose={() => setUnifiedReceiveOpen(false)}
            />
          )}
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
};

interface KpiTileProps {
  label: string;
  value: string;
  accent: "indigo" | "violet" | "teal" | "amber" | "blue" | "gray";
}

const KpiTile: React.FC<KpiTileProps> = ({ label, value, accent }) => (
  <Card
    size="2"
    variant="surface"
    style={{
      background: `var(--${accent}-a2)`,
      borderColor: `var(--${accent}-a4)`,
    }}
  >
    <Text size="1" color="gray">
      {label}
    </Text>
    <Heading size="5" mt="1" style={{ color: `var(--${accent}-11)` }}>
      {value}
    </Heading>
  </Card>
);

const SummaryRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <Flex gap="3">
    <Text size="2" color="gray">
      {label}
    </Text>
    <Text size="2" weight="medium" style={{ minWidth: 120, textAlign: "right" }}>
      {value}
    </Text>
  </Flex>
);

const MetaRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Flex direction={{ initial: "column", sm: "row" }} gap="2">
    <Text size="2" color="gray" style={{ minWidth: 160 }}>
      {label}
    </Text>
    <Text size="2">{value}</Text>
  </Flex>
);

interface ReceiptRowProps {
  receipt: ReceiptDto;
  currencyCode: string;
  onPrint: () => void;
}

const ReceiptRow: React.FC<ReceiptRowProps> = ({
  receipt,
  currencyCode,
  onPrint,
}) => (
  <Box
    p="3"
    style={{
      borderRadius: "var(--radius-3)",
      border: "1px solid var(--gray-a4)",
      background: "var(--gray-a2)",
    }}
  >
    <Flex justify="between" align="start" gap="2" wrap="wrap" mb="2">
      <Box>
        <Flex align="center" gap="2">
          <Text size="2" weight="bold">
            {receipt.receiptNumber}
          </Text>
          <Badge color="teal" variant="soft" radius="full" size="1">
            <CheckCircledIcon /> Stock moved
          </Badge>
        </Flex>
        <Text size="1" color="gray" as="div">
          {formatShortDate(receipt.receivedDate)} by {receipt.receivedByUserName}
          {receipt.deliveryNoteNumber && ` · DR ${receipt.deliveryNoteNumber}`}
        </Text>
      </Box>
      <Flex align="center" gap="2">
        <Text size="1" color="gray">
          {formatRelative(receipt.createdAt)}
        </Text>
        <IconButton
          variant="ghost"
          color="gray"
          size="1"
          onClick={onPrint}
          aria-label="Print receipt"
          title="Print receipt"
        >
          <PrintOutlined style={{ fontSize: 16 }} />
        </IconButton>
      </Flex>
    </Flex>
    <Flex direction="column" gap="1">
      {receipt.items.map((item) => {
        const converted =
          item.stockUnitName &&
          item.unitName !== item.stockUnitName &&
          item.conversionFactor !== 1;
        return (
          <Flex
            key={item.receiptItemID}
            justify="between"
            align="center"
            gap="2"
            py="1"
            style={{ borderTop: "1px solid var(--gray-a3)" }}
          >
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="2">{item.productName}</Text>
              {converted && (
                <Text size="1" color="indigo" as="div">
                  → {formatQuantity(item.stockQuantity)} {item.stockUnitName}{" "}
                  added to inventory
                </Text>
              )}
              {item.qualityNotes && (
                <Text size="1" color="amber" as="div">
                  ⚠ {item.qualityNotes}
                </Text>
              )}
            </Box>
            <Text size="2" color="gray">
              {formatQuantity(item.quantity)} {item.unitName}
            </Text>
            <Text size="2" weight="medium" style={{ minWidth: 90, textAlign: "right" }}>
              {formatCurrency(item.quantity * item.unitCost, currencyCode)}
            </Text>
          </Flex>
        );
      })}
    </Flex>
    {receipt.notes && (
      <Text size="1" color="gray" as="div" mt="2">
        {receipt.notes}
      </Text>
    )}
  </Box>
);

interface InvoiceRowProps {
  invoice: SupplierInvoiceDto;
  currencyCode: string;
  onRecordPayment: () => void;
  onPrint: () => void;
}

const InvoiceRow: React.FC<InvoiceRowProps> = ({
  invoice,
  currencyCode,
  onRecordPayment,
  onPrint,
}) => {
  const statusMeta = INVOICE_STATUS_META[invoice.status];
  const isPayable = invoice.status === 1 || invoice.status === 2;
  return (
    <Box
      p="3"
      style={{
        borderRadius: "var(--radius-3)",
        border: "1px solid var(--gray-a4)",
        background: "var(--gray-a2)",
      }}
    >
      <Flex justify="between" align="start" gap="2" wrap="wrap">
        <Box>
          <Flex align="center" gap="2">
            <Text size="2" weight="bold">
              {invoice.invoiceNumber}
            </Text>
            <Badge color={statusMeta?.color ?? "gray"} variant="soft" radius="full">
              {statusMeta?.label}
            </Badge>
          </Flex>
          <Text size="1" color="gray" as="div">
            Invoice {formatShortDate(invoice.invoiceDate)} · Due{" "}
            {formatShortDate(invoice.dueDate)}
          </Text>
        </Box>
        <Box style={{ textAlign: "right" }}>
          <Text size="1" color="gray">
            Total / Paid / Balance
          </Text>
          <Text size="2" weight="medium" as="div">
            {formatCurrency(invoice.totalAmount, currencyCode)} ·{" "}
            <span style={{ color: "var(--green-11)" }}>
              {formatCurrency(invoice.paidAmount, currencyCode)}
            </span>{" "}
            ·{" "}
            <span style={{ color: "var(--red-11)" }}>
              {formatCurrency(invoice.balanceDue, currencyCode)}
            </span>
          </Text>
        </Box>
      </Flex>
      <Flex justify="end" gap="2" mt="2">
        <Button type="Secondary" onClick={onPrint}>
          <Flex align="center" gap="2">
            <PrintOutlined fontSize="small" /> Print
          </Flex>
        </Button>
        {isPayable && (
          <Button type="Secondary" onClick={onRecordPayment}>
            <Flex align="center" gap="2">
              <PaymentsOutlined fontSize="small" /> Record payment
            </Flex>
          </Button>
        )}
      </Flex>
    </Box>
  );
};
