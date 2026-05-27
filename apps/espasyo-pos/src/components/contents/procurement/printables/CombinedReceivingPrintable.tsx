import React from "react";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import {
  PaymentDto,
  PurchaseOrderDetailDto,
  ReceiptDto,
  SupplierInvoiceDetailDto,
} from "core-lib/api/commons/types";
import { PrintableDocument } from "core-lib/components/print";
import { INVOICE_STATUS_META } from "../constants";
import { formatCurrency, formatQuantity, formatShortDate } from "../format";

interface Props {
  receipt: ReceiptDto;
  purchaseOrder: PurchaseOrderDetailDto;
  invoice?: SupplierInvoiceDetailDto;
  payment?: PaymentDto;
  businessName: string;
  currencyCode: string;
  logoUrl?: string | null;
}

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: 1,
  color: "#888",
  fontWeight: 600,
};
const valueStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#111",
  fontWeight: 500,
  marginTop: 2,
};
const headerCellStyle: React.CSSProperties = {
  padding: "8px 6px",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: 0.6,
  color: "#666",
  textAlign: "left",
  borderBottom: "2px solid #111",
  fontWeight: 700,
};
const cellStyle: React.CSSProperties = {
  padding: "8px 6px",
  fontSize: 12,
  color: "#111",
  borderBottom: "1px solid #eee",
  verticalAlign: "top",
};
const sectionDividerStyle: React.CSSProperties = {
  borderTop: "2px solid #e0e0e0",
  margin: "28px 0 22px",
};
const sectionBadgeStyle: React.CSSProperties = {
  display: "inline-block",
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 1,
  padding: "2px 8px",
  borderRadius: 4,
  marginBottom: 10,
};

export const CombinedReceivingPrintable: React.FC<Props> = ({
  receipt,
  purchaseOrder: po,
  invoice,
  payment,
  businessName,
  currencyCode,
  logoUrl,
}) => {
  const totalGrnValue = receipt.items.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0,
  );

  const documentLabel = invoice ? "GRN + Supplier Invoice" : "Goods Received Note";

  return (
    <PrintableDocument
      businessName={businessName}
      logoUrl={logoUrl}
      documentLabel={documentLabel}
      documentNumber={receipt.receiptNumber}
      documentMeta={
        <Flex gap="3" wrap="wrap" justify="end">
          <Text size="1" style={{ color: "#555" }}>
            Against PO <strong>{po.orderNumber}</strong>
          </Text>
          {invoice && (
            <Text size="1" style={{ color: "#555" }}>
              Invoice <strong>{invoice.invoiceNumber}</strong>
            </Text>
          )}
        </Flex>
      }
    >
      {/* ── GRN Section ── */}
      <div style={{ ...sectionBadgeStyle, background: "#e8f0fe", color: "#1a56db" }}>
        Goods Received Note
      </div>

      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          marginBottom: 18,
        }}
      >
        <Box>
          <Text as="div" style={labelStyle}>
            Supplier
          </Text>
          <Text as="div" style={valueStyle}>
            {po.supplierName}
          </Text>
          {receipt.deliveryNoteNumber && (
            <Text as="div" style={{ ...valueStyle, fontWeight: 400 }}>
              DR / Delivery note: {receipt.deliveryNoteNumber}
            </Text>
          )}
        </Box>
        <Box>
          <Text as="div" style={labelStyle}>
            Received by
          </Text>
          <Text as="div" style={valueStyle}>
            {receipt.receivedByUserName}
          </Text>
          <Text as="div" style={{ ...valueStyle, fontWeight: 400 }}>
            on {formatShortDate(receipt.receivedDate)}
          </Text>
        </Box>
      </Box>

      <Heading size="3" mb="2" style={{ color: "#111" }}>
        Items received
      </Heading>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
        <thead>
          <tr>
            <th style={headerCellStyle}>#</th>
            <th style={headerCellStyle}>Product</th>
            <th style={{ ...headerCellStyle, textAlign: "right" }}>Supplier qty</th>
            <th style={headerCellStyle}>Unit</th>
            <th style={{ ...headerCellStyle, textAlign: "right" }}>Inventory qty</th>
            <th style={headerCellStyle}>Stock unit</th>
            <th style={{ ...headerCellStyle, textAlign: "right" }}>Unit cost</th>
            <th style={{ ...headerCellStyle, textAlign: "right" }}>Line total</th>
          </tr>
        </thead>
        <tbody>
          {receipt.items.map((item, idx) => {
            const converted =
              item.stockUnitName &&
              item.unitName !== item.stockUnitName &&
              item.conversionFactor !== 1;
            return (
              <tr key={item.receiptItemID}>
                <td style={{ ...cellStyle, width: 24, color: "#888" }}>{idx + 1}</td>
                <td style={cellStyle}>
                  <div style={{ fontWeight: 500 }}>{item.productName}</div>
                  {item.qualityNotes && (
                    <div style={{ fontSize: 11, color: "#a87800", marginTop: 2 }}>
                      ⚠ {item.qualityNotes}
                    </div>
                  )}
                </td>
                <td style={{ ...cellStyle, textAlign: "right" }}>
                  {formatQuantity(item.quantity)}
                </td>
                <td style={cellStyle}>{item.unitName}</td>
                <td
                  style={{
                    ...cellStyle,
                    textAlign: "right",
                    color: converted ? "#3a4cc6" : "#111",
                  }}
                >
                  {formatQuantity(item.stockQuantity)}
                </td>
                <td style={{ ...cellStyle, color: converted ? "#3a4cc6" : "#111" }}>
                  {item.stockUnitName}
                </td>
                <td style={{ ...cellStyle, textAlign: "right" }}>
                  {formatCurrency(item.unitCost, po.currencyCode)}
                </td>
                <td style={{ ...cellStyle, textAlign: "right", fontWeight: 600 }}>
                  {formatCurrency(item.quantity * item.unitCost, po.currencyCode)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Flex justify="end" mb={invoice ? "2" : "4"}>
        <Box
          style={{
            minWidth: 260,
            padding: "10px 12px",
            background: "#fafafa",
            border: "1px solid #eee",
            borderRadius: 6,
          }}
        >
          <Flex justify="between" align="baseline">
            <Text size="2" weight="bold" style={{ color: "#111" }}>
              Receipt value
            </Text>
            <Heading size="4" style={{ color: "#111" }}>
              {formatCurrency(totalGrnValue, po.currencyCode)}
            </Heading>
          </Flex>
        </Box>
      </Flex>

      {receipt.notes && !invoice && (
        <Box mb="4">
          <Text as="div" style={labelStyle}>
            Notes
          </Text>
          <Text as="div" style={{ ...valueStyle, fontWeight: 400, whiteSpace: "pre-wrap" }}>
            {receipt.notes}
          </Text>
        </Box>
      )}

      {/* ── Invoice Section ── */}
      {invoice && (
        <>
          <div style={sectionDividerStyle} />
          <div style={{ ...sectionBadgeStyle, background: "#fef3c7", color: "#92400e" }}>
            Supplier Invoice
          </div>

          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              marginBottom: 14,
            }}
          >
            <Box>
              <Text as="div" style={labelStyle}>
                From
              </Text>
              <Text as="div" style={valueStyle}>
                {invoice.supplierName}
              </Text>
              <Text as="div" style={{ ...valueStyle, fontWeight: 400, marginTop: 6 }}>
                Invoice #{invoice.invoiceNumber}
              </Text>
            </Box>
            <Box>
              <Text as="div" style={labelStyle}>
                Bill to
              </Text>
              <Text as="div" style={valueStyle}>
                {businessName}
              </Text>
              <Text as="div" style={{ ...valueStyle, fontWeight: 400, marginTop: 6 }}>
                Status:{" "}
                <strong>{INVOICE_STATUS_META[invoice.status]?.label ?? "—"}</strong>
              </Text>
            </Box>
          </Box>

          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
              marginBottom: 16,
              padding: "10px 12px",
              background: "#fafafa",
              border: "1px solid #eee",
              borderRadius: 6,
            }}
          >
            <Box>
              <Text as="div" style={labelStyle}>
                Invoice date
              </Text>
              <Text as="div" style={valueStyle}>
                {formatShortDate(invoice.invoiceDate)}
              </Text>
            </Box>
            <Box>
              <Text as="div" style={labelStyle}>
                Due date
              </Text>
              <Text as="div" style={valueStyle}>
                {formatShortDate(invoice.dueDate)}
              </Text>
            </Box>
            <Box>
              <Text as="div" style={labelStyle}>
                Balance due
              </Text>
              <Text
                as="div"
                style={{
                  ...valueStyle,
                  color: invoice.balanceDue > 0 ? "#a02020" : "#0a8050",
                }}
              >
                {formatCurrency(invoice.balanceDue, currencyCode)}
              </Text>
            </Box>
          </Box>

          <Flex justify="end" mb={payment ? "2" : "4"}>
            <Box style={{ minWidth: 320 }}>
              <InvoiceLine
                label="Subtotal"
                value={formatCurrency(invoice.subtotal, currencyCode)}
              />
              {invoice.taxAmount != null && invoice.taxAmount > 0 && (
                <InvoiceLine
                  label="Tax"
                  value={formatCurrency(invoice.taxAmount, currencyCode)}
                />
              )}
              {invoice.shippingFee != null && invoice.shippingFee > 0 && (
                <InvoiceLine
                  label="Shipping"
                  value={formatCurrency(invoice.shippingFee, currencyCode)}
                />
              )}
              {invoice.discountAmount != null && invoice.discountAmount > 0 && (
                <InvoiceLine
                  label="Discount"
                  value={`− ${formatCurrency(invoice.discountAmount, currencyCode)}`}
                />
              )}
              <Box
                style={{
                  marginTop: 8,
                  paddingTop: 8,
                  borderTop: "2px solid #111",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <Text size="2" weight="bold" style={{ color: "#111" }}>
                  Invoice total
                </Text>
                <Heading size="4" style={{ color: "#111" }}>
                  {formatCurrency(invoice.totalAmount, currencyCode)}
                </Heading>
              </Box>
              {invoice.paidAmount > 0 && (
                <InvoiceLine
                  label="Paid to date"
                  value={`− ${formatCurrency(invoice.paidAmount, currencyCode)}`}
                />
              )}
              <Box
                style={{
                  marginTop: 4,
                  paddingTop: 8,
                  borderTop: "1px solid #ccc",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <Text size="2" weight="bold" style={{ color: "#111" }}>
                  Balance due
                </Text>
                <Heading
                  size="4"
                  style={{ color: invoice.balanceDue > 0 ? "#a02020" : "#0a8050" }}
                >
                  {formatCurrency(invoice.balanceDue, currencyCode)}
                </Heading>
              </Box>
            </Box>
          </Flex>

          {invoice.notes && !payment && (
            <Box mb="4">
              <Text as="div" style={labelStyle}>
                Invoice notes
              </Text>
              <Text
                as="div"
                style={{ ...valueStyle, fontWeight: 400, whiteSpace: "pre-wrap" }}
              >
                {invoice.notes}
              </Text>
            </Box>
          )}
        </>
      )}

      {/* ── Payment Section ── */}
      {payment && (
        <>
          <div style={sectionDividerStyle} />
          <div style={{ ...sectionBadgeStyle, background: "#dcfce7", color: "#166534" }}>
            Payment Record
          </div>

          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 24,
              marginBottom: 16,
            }}
          >
            <Box>
              <Text as="div" style={labelStyle}>
                Payment number
              </Text>
              <Text as="div" style={valueStyle}>
                {payment.paymentNumber}
              </Text>
              <Text as="div" style={{ ...valueStyle, fontWeight: 400, marginTop: 6 }}>
                {payment.methodName}
                {payment.referenceNumber && ` · Ref: ${payment.referenceNumber}`}
              </Text>
            </Box>
            <Box>
              <Text as="div" style={labelStyle}>
                Payment date
              </Text>
              <Text as="div" style={valueStyle}>
                {formatShortDate(payment.paymentDate)}
              </Text>
              {payment.notes && (
                <Text as="div" style={{ ...valueStyle, fontWeight: 400, marginTop: 6 }}>
                  {payment.notes}
                </Text>
              )}
            </Box>
          </Box>

          <Flex justify="end" mb="4">
            <Box
              style={{
                minWidth: 260,
                padding: "12px 14px",
                background: "#f0fdf4",
                border: "1px solid #86efac",
                borderRadius: 6,
              }}
            >
              <Flex justify="between" align="baseline">
                <Text size="2" weight="bold" style={{ color: "#111" }}>
                  Amount paid
                </Text>
                <Heading size="4" style={{ color: "#166534" }}>
                  {formatCurrency(payment.amount, currencyCode)}
                </Heading>
              </Flex>
              {invoice && payment.amount >= invoice.balanceDue && (
                <Text
                  as="div"
                  size="1"
                  style={{ color: "#166534", marginTop: 4, fontStyle: "italic" }}
                >
                  Invoice fully settled
                </Text>
              )}
            </Box>
          </Flex>
        </>
      )}

      {/* ── Signature blocks ── */}
      <Box
        mt="6"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}
      >
        <SignatureBlock label="Delivered by (supplier)" />
        <SignatureBlock label="Received by" value={receipt.receivedByUserName} />
      </Box>
    </PrintableDocument>
  );
};

const InvoiceLine: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Flex justify="between" py="1">
    <Text size="2" style={{ color: "#555" }}>
      {label}
    </Text>
    <Text size="2" style={{ color: "#111" }}>
      {value}
    </Text>
  </Flex>
);

const SignatureBlock: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <Box>
    <Box style={{ height: 36, borderBottom: "1px solid #111", marginBottom: 4 }}>
      {value && (
        <Text size="2" style={{ color: "#111" }}>
          {value}
        </Text>
      )}
    </Box>
    <Text as="div" style={{ ...labelStyle, fontSize: 9 }}>
      {label}
    </Text>
  </Box>
);
