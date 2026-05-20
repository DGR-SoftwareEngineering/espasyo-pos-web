import React from "react";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import {
  FulfillmentMethodDto,
  PurchaseOrderDetailDto,
} from "core-lib/api/commons/types";
import { PrintableDocument } from "core-lib/components/print";
import {
  FULFILLMENT_META,
  PO_STATUS_META,
} from "../constants";
import { formatCurrency, formatQuantity, formatShortDate } from "../format";

interface Props {
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
const cellStyle: React.CSSProperties = {
  padding: "8px 6px",
  fontSize: 12,
  color: "#111",
  borderBottom: "1px solid #eee",
  verticalAlign: "top",
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

export const PurchaseOrderPrintable: React.FC<Props> = ({
  purchaseOrder: po,
  businessName,
  logoUrl,
}) => {
  const statusLabel = PO_STATUS_META[po.status]?.label ?? "—";
  const fulfillmentLabel = FULFILLMENT_META[po.fulfillmentMethod]?.label ?? "—";
  const totalReceived = po.items.reduce(
    (sum, item) => sum + item.quantityReceived,
    0,
  );
  const receivedPct =
    po.totalQuantityOrdered > 0
      ? Math.round((totalReceived / po.totalQuantityOrdered) * 100)
      : 0;

  return (
    <PrintableDocument
      businessName={businessName}
      logoUrl={logoUrl}
      documentLabel="Purchase Order"
      documentNumber={po.orderNumber}
      documentMeta={
        <Flex gap="3" wrap="wrap" justify="end">
          <Text size="1" style={{ color: "#555" }}>
            Status: <strong>{statusLabel}</strong>
          </Text>
          <Text size="1" style={{ color: "#555" }}>
            {fulfillmentLabel}
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
          {po.fulfillmentMethod === FulfillmentMethodDto.Delivery &&
            po.deliveryAddress && (
              <Text as="div" style={{ ...valueStyle, fontWeight: 400 }}>
                {po.deliveryAddress}
              </Text>
            )}
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
          gridTemplateColumns: "repeat(4, 1fr)",
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
            Order date
          </Text>
          <Text as="div" style={valueStyle}>
            {formatShortDate(po.orderDate)}
          </Text>
        </Box>
        <Box>
          <Text as="div" style={labelStyle}>
            Expected
          </Text>
          <Text as="div" style={valueStyle}>
            {po.expectedDate ? formatShortDate(po.expectedDate) : "—"}
          </Text>
        </Box>
        <Box>
          <Text as="div" style={labelStyle}>
            Payment terms
          </Text>
          <Text as="div" style={valueStyle}>
            {po.paymentTerms}
          </Text>
        </Box>
        <Box>
          <Text as="div" style={labelStyle}>
            Receiving
          </Text>
          <Text as="div" style={valueStyle}>
            {receivedPct}% received
          </Text>
        </Box>
      </Box>

      <Heading size="3" mb="2" style={{ color: "#111" }}>
        Line items
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
            <th style={{ ...headerCellStyle, textAlign: "right" }}>Qty</th>
            <th style={headerCellStyle}>Unit</th>
            <th style={{ ...headerCellStyle, textAlign: "right" }}>
              Unit price
            </th>
            <th style={{ ...headerCellStyle, textAlign: "right" }}>Discount</th>
            <th style={{ ...headerCellStyle, textAlign: "right" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {po.items.map((item, idx) => (
            <tr key={item.purchaseOrderItemID}>
              <td style={{ ...cellStyle, width: 24, color: "#888" }}>
                {idx + 1}
              </td>
              <td style={cellStyle}>
                <div style={{ fontWeight: 500 }}>{item.productName}</div>
                {item.notes && (
                  <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
                    {item.notes}
                  </div>
                )}
                {item.stockUnitName &&
                  item.stockUnitName !== item.unitName && (
                    <div
                      style={{
                        fontSize: 10,
                        color: "#777",
                        marginTop: 2,
                        fontStyle: "italic",
                      }}
                    >
                      Stocked in {item.stockUnitName}
                      {item.conversionFactor
                        ? ` · 1 ${item.unitName} = ${formatQuantity(item.conversionFactor)} ${item.stockUnitName}`
                        : ""}
                    </div>
                  )}
              </td>
              <td style={{ ...cellStyle, textAlign: "right" }}>
                {formatQuantity(item.quantity)}
              </td>
              <td style={cellStyle}>{item.unitName}</td>
              <td style={{ ...cellStyle, textAlign: "right" }}>
                {formatCurrency(item.unitPrice, po.currencyCode)}
              </td>
              <td style={{ ...cellStyle, textAlign: "right" }}>
                {item.discount
                  ? `− ${formatCurrency(item.discount, po.currencyCode)}`
                  : "—"}
              </td>
              <td
                style={{
                  ...cellStyle,
                  textAlign: "right",
                  fontWeight: 600,
                }}
              >
                {formatCurrency(item.lineTotal, po.currencyCode)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Flex justify="end" mb="4">
        <Box style={{ minWidth: 260 }}>
          <SummaryLine
            label="Subtotal"
            value={formatCurrency(po.subtotal, po.currencyCode)}
          />
          {po.taxAmount != null && po.taxAmount > 0 && (
            <SummaryLine
              label="Tax"
              value={formatCurrency(po.taxAmount, po.currencyCode)}
            />
          )}
          {po.shippingFee != null && po.shippingFee > 0 && (
            <SummaryLine
              label="Shipping"
              value={formatCurrency(po.shippingFee, po.currencyCode)}
            />
          )}
          {po.discountAmount != null && po.discountAmount > 0 && (
            <SummaryLine
              label="Discount"
              value={`− ${formatCurrency(po.discountAmount, po.currencyCode)}`}
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
              Total
            </Text>
            <Heading size="4" style={{ color: "#111" }}>
              {formatCurrency(po.totalAmount, po.currencyCode)}
            </Heading>
          </Box>
        </Box>
      </Flex>

      {po.notes && (
        <Box mb="4">
          <Text as="div" style={labelStyle}>
            Notes
          </Text>
          <Text
            as="div"
            style={{ ...valueStyle, fontWeight: 400, whiteSpace: "pre-wrap" }}
          >
            {po.notes}
          </Text>
        </Box>
      )}

      <Box mt="6" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        <SignatureBlock
          label="Prepared by"
          value={po.approvedByUserName ?? ""}
        />
        <SignatureBlock label="Received by" />
      </Box>
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
