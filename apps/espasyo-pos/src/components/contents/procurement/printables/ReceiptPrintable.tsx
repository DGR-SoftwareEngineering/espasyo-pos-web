import React from "react";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import {
  PurchaseOrderDetailDto,
  ReceiptDto,
} from "core-lib/api/commons/types";
import { PrintableDocument } from "core-lib/components/print";
import { formatCurrency, formatQuantity, formatShortDate } from "../format";

interface Props {
  receipt: ReceiptDto;
  purchaseOrder: PurchaseOrderDetailDto;
  businessName: string;
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

export const ReceiptPrintable: React.FC<Props> = ({
  receipt,
  purchaseOrder: po,
  businessName,
  logoUrl,
}) => {
  const totalValue = receipt.items.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0,
  );

  return (
    <PrintableDocument
      businessName={businessName}
      logoUrl={logoUrl}
      documentLabel="Goods Received Note"
      documentNumber={receipt.receiptNumber}
      documentMeta={
        <Flex gap="3" wrap="wrap" justify="end">
          <Text size="1" style={{ color: "#555" }}>
            Against PO <strong>{po.orderNumber}</strong>
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
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: 16,
        }}
      >
        <thead>
          <tr>
            <th style={headerCellStyle}>#</th>
            <th style={headerCellStyle}>Product</th>
            <th style={{ ...headerCellStyle, textAlign: "right" }}>
              Supplier qty
            </th>
            <th style={headerCellStyle}>Unit</th>
            <th style={{ ...headerCellStyle, textAlign: "right" }}>
              Inventory qty
            </th>
            <th style={headerCellStyle}>Stock unit</th>
            <th style={{ ...headerCellStyle, textAlign: "right" }}>
              Unit cost
            </th>
            <th style={{ ...headerCellStyle, textAlign: "right" }}>
              Line total
            </th>
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
                <td style={{ ...cellStyle, width: 24, color: "#888" }}>
                  {idx + 1}
                </td>
                <td style={cellStyle}>
                  <div style={{ fontWeight: 500 }}>{item.productName}</div>
                  {item.qualityNotes && (
                    <div
                      style={{ fontSize: 11, color: "#a87800", marginTop: 2 }}
                    >
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
                <td
                  style={{
                    ...cellStyle,
                    color: converted ? "#3a4cc6" : "#111",
                  }}
                >
                  {item.stockUnitName}
                </td>
                <td style={{ ...cellStyle, textAlign: "right" }}>
                  {formatCurrency(item.unitCost, po.currencyCode)}
                </td>
                <td
                  style={{
                    ...cellStyle,
                    textAlign: "right",
                    fontWeight: 600,
                  }}
                >
                  {formatCurrency(
                    item.quantity * item.unitCost,
                    po.currencyCode,
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Flex justify="end" mb="4">
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
              {formatCurrency(totalValue, po.currencyCode)}
            </Heading>
          </Flex>
          <Text
            as="div"
            size="1"
            style={{ color: "#777", marginTop: 4, fontStyle: "italic" }}
          >
            Supplier-facing total. Inventory is updated in stock units —
            see the &ldquo;Inventory qty&rdquo; column.
          </Text>
        </Box>
      </Flex>

      {receipt.notes && (
        <Box mb="4">
          <Text as="div" style={labelStyle}>
            Notes
          </Text>
          <Text
            as="div"
            style={{ ...valueStyle, fontWeight: 400, whiteSpace: "pre-wrap" }}
          >
            {receipt.notes}
          </Text>
        </Box>
      )}

      <Box
        mt="6"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
        }}
      >
        <SignatureBlock label="Delivered by (supplier)" />
        <SignatureBlock
          label="Received by"
          value={receipt.receivedByUserName}
        />
      </Box>
    </PrintableDocument>
  );
};

const SignatureBlock: React.FC<{ label: string; value?: string }> = ({
  label,
  value,
}) => (
  <Box>
    <Box
      style={{
        height: 36,
        borderBottom: "1px solid #111",
        marginBottom: 4,
      }}
    >
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
