import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
} from "core-lib/components/radix/proxies";;
import {
  SupplierInvoiceDetailDto,
} from "core-lib/api/commons/types";
import { PrintableDocument } from "core-lib/components/print";
import { INVOICE_STATUS_META } from "../constants";
import { formatCurrency, formatShortDate } from "../format";

interface Props {
  invoice: SupplierInvoiceDetailDto;
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

export const SupplierInvoicePrintable: React.FC<Props> = ({
  invoice,
  businessName,
  currencyCode,
  logoUrl,
}) => {
  const statusLabel = INVOICE_STATUS_META[invoice.status]?.label ?? "—";

  return (
    <PrintableDocument
      businessName={businessName}
      logoUrl={logoUrl}
      documentLabel="Supplier Invoice"
      documentNumber={invoice.invoiceNumber}
      documentMeta={
        <Flex gap="3" wrap="wrap" justify="end">
          <Text size="1" style={{ color: "#555" }}>
            Status: <strong>{statusLabel}</strong>
          </Text>
          <Text size="1" style={{ color: "#555" }}>
            Against PO <strong>{invoice.purchaseOrderNumber}</strong>
          </Text>
        </Flex>
      }
    >
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
            From
          </Text>
          <Text as="div" style={valueStyle}>
            {invoice.supplierName}
          </Text>
        </Box>
        <Box>
          <Text as="div" style={labelStyle}>
            Bill to
          </Text>
          <Text as="div" style={valueStyle}>
            {businessName}
          </Text>
        </Box>
      </Box>

      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginBottom: 18,
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
          <Text as="div" style={valueStyle}>
            {formatCurrency(invoice.balanceDue, currencyCode)}
          </Text>
        </Box>
      </Box>

      <Heading size="3" mb="2" style={{ color: "#111" }}>
        Charges
      </Heading>
      <Box mb="4">
        <Flex justify="end">
          <Box style={{ minWidth: 320 }}>
            <SummaryLine
              label="Subtotal"
              value={formatCurrency(invoice.subtotal, currencyCode)}
            />
            {invoice.taxAmount != null && invoice.taxAmount > 0 && (
              <SummaryLine
                label="Tax"
                value={formatCurrency(invoice.taxAmount, currencyCode)}
              />
            )}
            {invoice.shippingFee != null && invoice.shippingFee > 0 && (
              <SummaryLine
                label="Shipping"
                value={formatCurrency(invoice.shippingFee, currencyCode)}
              />
            )}
            {invoice.discountAmount != null && invoice.discountAmount > 0 && (
              <SummaryLine
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
            <SummaryLine
              label="Paid to date"
              value={`− ${formatCurrency(invoice.paidAmount, currencyCode)}`}
            />
            <Box
              style={{
                marginTop: 4,
                paddingTop: 8,
                borderTop: "1px solid #111",
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
                style={{
                  color: invoice.balanceDue > 0 ? "#a02020" : "#0a8050",
                }}
              >
                {formatCurrency(invoice.balanceDue, currencyCode)}
              </Heading>
            </Box>
          </Box>
        </Flex>
      </Box>

      {invoice.payments.length > 0 && (
        <Box mb="4">
          <Heading size="3" mb="2" style={{ color: "#111" }}>
            Payment ledger
          </Heading>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: 16,
            }}
          >
            <thead>
              <tr>
                <th style={headerCellStyle}>Payment #</th>
                <th style={headerCellStyle}>Date</th>
                <th style={headerCellStyle}>Method</th>
                <th style={headerCellStyle}>Reference</th>
                <th style={{ ...headerCellStyle, textAlign: "right" }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.payments.map((p) => (
                <tr key={p.paymentID}>
                  <td style={cellStyle}>{p.paymentNumber}</td>
                  <td style={cellStyle}>{formatShortDate(p.paymentDate)}</td>
                  <td style={cellStyle}>{p.methodName}</td>
                  <td style={{ ...cellStyle, color: "#666" }}>
                    {p.referenceNumber ?? "—"}
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      textAlign: "right",
                      fontWeight: 600,
                    }}
                  >
                    {formatCurrency(p.amount, currencyCode)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}

      {invoice.notes && (
        <Box mb="4">
          <Text as="div" style={labelStyle}>
            Notes
          </Text>
          <Text
            as="div"
            style={{ ...valueStyle, fontWeight: 400, whiteSpace: "pre-wrap" }}
          >
            {invoice.notes}
          </Text>
        </Box>
      )}
    </PrintableDocument>
  );
};

const SummaryLine: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <Flex justify="between" py="1">
    <Text size="2" style={{ color: "#555" }}>
      {label}
    </Text>
    <Text size="2" style={{ color: "#111" }}>
      {value}
    </Text>
  </Flex>
);
