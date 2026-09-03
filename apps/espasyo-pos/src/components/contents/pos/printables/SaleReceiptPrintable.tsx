import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
} from "core-lib/components/radix/proxies";;
import { SaleDetailDto } from "core-lib/api/commons/types";
import { PrintableDocument } from "core-lib/components/print";
import { formatCurrency, formatShortDate } from "../format";

interface Props {
  sale: SaleDetailDto;
  businessName: string;
  logoUrl?: string | null;
  currencyCode: string;
  receiptHeader?: string;
  receiptFooter?: string;
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

const formatTime = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

export const SaleReceiptPrintable: React.FC<Props> = ({
  sale,
  businessName,
  logoUrl,
  currencyCode,
  receiptHeader,
  receiptFooter,
}) => {
  return (
    <PrintableDocument
      businessName={businessName}
      logoUrl={logoUrl}
      documentLabel="Sales Receipt"
      documentNumber={sale.saleNumber}
      documentMeta={
        <Flex gap="3" wrap="wrap" justify="end">
          <Text size="1" style={{ color: "#555" }}>
            {formatShortDate(sale.saleDate)}
          </Text>
          <Text size="1" style={{ color: "#555" }}>
            Cashier: <strong>{sale.cashierName}</strong>
          </Text>
        </Flex>
      }
    >
      {receiptHeader && receiptHeader.trim() && (
        <Box
          mb="3"
          style={{
            padding: "10px 12px",
            background: "#fafafa",
            border: "1px solid #eee",
            borderRadius: 6,
            whiteSpace: "pre-wrap",
            fontSize: 12,
            color: "#444",
            textAlign: "center",
          }}
        >
          {receiptHeader}
        </Box>
      )}

      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          marginBottom: 16,
        }}
      >
        <Box>
          <Text as="div" style={labelStyle}>
            Sale number
          </Text>
          <Text as="div" style={valueStyle}>
            {sale.saleNumber}
          </Text>
        </Box>
        <Box>
          <Text as="div" style={labelStyle}>
            Completed at
          </Text>
          <Text as="div" style={valueStyle}>
            {formatTime(sale.completedAt)}
          </Text>
        </Box>
      </Box>

      <Heading size="3" mb="2" style={{ color: "#111" }}>
        Items
      </Heading>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}
      >
        <thead>
          <tr>
            <th style={headerCellStyle}>#</th>
            <th style={headerCellStyle}>Product</th>
            <th style={{ ...headerCellStyle, textAlign: "right" }}>Qty</th>
            <th style={{ ...headerCellStyle, textAlign: "right" }}>Price</th>
            <th style={{ ...headerCellStyle, textAlign: "right" }}>Discount</th>
            <th style={{ ...headerCellStyle, textAlign: "right" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item, idx) => (
            <tr key={item.saleItemID}>
              <td style={{ ...cellStyle, width: 24, color: "#888" }}>
                {idx + 1}
              </td>
              <td style={cellStyle}>
                <div style={{ fontWeight: 500 }}>{item.productName}</div>
                {item.variantName && (
                  <div style={{ fontSize: 11, color: "#555", marginTop: 2, fontStyle: "italic" }}>
                    {item.variantName}
                  </div>
                )}
                {item.addOns && item.addOns.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    {item.addOns.map((a) => (
                      <div
                        key={a.saleItemAddOnID}
                        style={{ fontSize: 11, color: "#777", paddingLeft: 8 }}
                      >
                        + {a.itemName}
                        {a.additionalPrice > 0 && (
                          <> ({formatCurrency(a.additionalPrice, currencyCode)})</>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ fontSize: 10, color: "#777", marginTop: 2 }}>
                  {item.unitName}
                </div>
              </td>
              <td style={{ ...cellStyle, textAlign: "right" }}>
                {item.quantity}
              </td>
              <td style={{ ...cellStyle, textAlign: "right" }}>
                {formatCurrency(item.unitPrice, currencyCode)}
              </td>
              <td style={{ ...cellStyle, textAlign: "right" }}>
                {item.discount > 0
                  ? `− ${formatCurrency(item.discount, currencyCode)}`
                  : "—"}
              </td>
              <td style={{ ...cellStyle, textAlign: "right", fontWeight: 600 }}>
                {formatCurrency(item.lineTotal, currencyCode)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Flex justify="end" mb="3">
        <Box style={{ minWidth: 240 }}>
          <SummaryLine
            label="Subtotal"
            value={formatCurrency(sale.subtotal, currencyCode)}
          />
          {sale.discountAmount > 0 && (
            <SummaryLine
              label="Discount"
              value={`− ${formatCurrency(sale.discountAmount, currencyCode)}`}
            />
          )}
          <SummaryLine
            label={`Tax (${(sale.taxRate * 100).toFixed(0)}%)`}
            value={formatCurrency(sale.taxAmount, currencyCode)}
          />
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
              Total
            </Text>
            <Heading size="4" style={{ color: "#111" }}>
              {formatCurrency(sale.totalAmount, currencyCode)}
            </Heading>
          </Box>
        </Box>
      </Flex>

      <Heading size="3" mb="2" style={{ color: "#111" }}>
        Payment
      </Heading>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}
      >
        <thead>
          <tr>
            <th style={headerCellStyle}>Method</th>
            <th style={headerCellStyle}>Reference</th>
            <th style={{ ...headerCellStyle, textAlign: "right" }}>Amount</th>
            <th style={{ ...headerCellStyle, textAlign: "right" }}>Tendered</th>
          </tr>
        </thead>
        <tbody>
          {sale.payments.map((p) => (
            <tr key={p.salePaymentID}>
              <td style={cellStyle}>{p.methodName}</td>
              <td style={{ ...cellStyle, color: "#666" }}>
                {p.referenceNumber ?? "—"}
              </td>
              <td style={{ ...cellStyle, textAlign: "right" }}>
                {formatCurrency(p.amount, currencyCode)}
              </td>
              <td style={{ ...cellStyle, textAlign: "right" }}>
                {formatCurrency(p.tendered, currencyCode)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Flex justify="end" mb="3">
        <Box
          style={{
            minWidth: 240,
            padding: "10px 12px",
            background: "#fafafa",
            border: "1px solid #eee",
            borderRadius: 6,
          }}
        >
          <SummaryLine
            label="Total tendered"
            value={formatCurrency(sale.amountTendered, currencyCode)}
          />
          {sale.changeDue > 0 && (
            <Box
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTop: "1px solid #ddd",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <Text size="2" weight="bold" style={{ color: "#0a8050" }}>
                Change due
              </Text>
              <Heading size="4" style={{ color: "#0a8050" }}>
                {formatCurrency(sale.changeDue, currencyCode)}
              </Heading>
            </Box>
          )}
        </Box>
      </Flex>

      {sale.notes && (
        <Box mb="3">
          <Text as="div" style={labelStyle}>
            Notes
          </Text>
          <Text
            as="div"
            style={{ ...valueStyle, fontWeight: 400, whiteSpace: "pre-wrap" }}
          >
            {sale.notes}
          </Text>
        </Box>
      )}

      {receiptFooter && receiptFooter.trim() && (
        <Box
          mt="4"
          style={{
            padding: "10px 12px",
            background: "#fafafa",
            border: "1px solid #eee",
            borderRadius: 6,
            whiteSpace: "pre-wrap",
            fontSize: 11,
            color: "#666",
            textAlign: "center",
          }}
        >
          {receiptFooter}
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
