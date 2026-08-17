import React from "react";
import {
  Box,
} from "core-lib/components/radix/proxies";;
import { type SupplierInvoiceDto } from "core-lib/api/commons/types";
import { formatCurrency } from "../../contents/procurement/format";
import { PrintPreviewDialog, PrintableDocument } from "core-lib/components/print";

interface ChartPrintPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodLabel: string;
  businessName: string;
  logoUrl: string | null;
  currencyCode: string;
  grossSales: number | null;
  grossProfit: number | null;
  totalTransactions: number | null;
  revenuePoints: { label: string; amount: number }[];
  operationalExpenses: number | null;
  businessSupplyExpenses: number | null;
  lowStockCount: number | null;
  lowStockAlertEnabled: boolean;
  filteredInvoices: SupplierInvoiceDto[];
}

export const ChartPrintPreview: React.FC<ChartPrintPreviewProps> = ({
  open,
  onOpenChange,
  periodLabel,
  businessName,
  logoUrl,
  currencyCode,
  grossSales,
  grossProfit,
  totalTransactions,
  revenuePoints,
  operationalExpenses,
  businessSupplyExpenses,
  lowStockCount,
  lowStockAlertEnabled,
  filteredInvoices,
}) => {
  const revenueRows = revenuePoints.filter((r) => r.amount > 0);
  const periodTotal = revenueRows.reduce((s, r) => s + r.amount, 0);

  return (
    <PrintPreviewDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Reports Chart \u00B7 ${periodLabel}`}
    >
      <PrintableDocument
        businessName={businessName}
        logoUrl={logoUrl ?? null}
        documentLabel="Reports Chart"
        documentNumber={periodLabel}
      >
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#444", fontWeight: 700, marginBottom: 10 }}>
          Financial Overview
        </div>
        <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Gross Sales", value: formatCurrency(grossSales, currencyCode), color: "#4338ca", bg: "#eef2ff", border: "#c7d2fe" },
            { label: "Gross Profit", value: grossProfit !== null ? formatCurrency(grossProfit, currencyCode) : "\u2014", color: grossProfit !== null && grossProfit >= 0 ? "#16a34a" : "#dc2626", bg: grossProfit !== null && grossProfit >= 0 ? "#f0fdf4" : "#fef2f2", border: grossProfit !== null && grossProfit >= 0 ? "#bbf7d0" : "#fecaca" },
            { label: "Transactions", value: totalTransactions?.toLocaleString() ?? "\u2014", color: "#0f766e", bg: "#f0fdfa", border: "#99f6e4" },
            { label: "Operational Expenses", value: formatCurrency(operationalExpenses, currencyCode), color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
            { label: "Business Supply Expenses", value: formatCurrency(businessSupplyExpenses, currencyCode), color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
            { label: "Low Stock Items", value: lowStockAlertEnabled ? (lowStockCount?.toLocaleString() ?? "\u2014") : "Alert disabled", color: lowStockCount ? "#d97706" : "#16a34a", bg: lowStockCount ? "#fffbeb" : "#f0fdf4", border: lowStockCount ? "#fde68a" : "#bbf7d0" },
          ].map(({ label, value, color, bg, border }) => (
            <Box key={label} style={{ padding: "10px 12px", background: bg, border: `1px solid ${border}`, borderRadius: 6 }}>
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#888", fontWeight: 700, marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color }}>{value}</div>
            </Box>
          ))}
        </Box>

        {revenueRows.length > 0 && (
          <Box mb="4">
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#444", fontWeight: 700, marginBottom: 8 }}>
              Revenue by Day \u2014 {periodLabel}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #111" }}>
                  <th style={{ padding: "6px 8px", textAlign: "left", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Date</th>
                  <th style={{ padding: "6px 8px", textAlign: "right", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {revenueRows.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "5px 8px" }}>{r.label}</td>
                    <td style={{ padding: "5px 8px", textAlign: "right", fontWeight: 500 }}>{formatCurrency(r.amount, currencyCode)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid #111" }}>
                  <td style={{ padding: "6px 8px", fontWeight: 700 }}>Total</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, color: "#4338ca" }}>{formatCurrency(periodTotal, currencyCode)}</td>
                </tr>
              </tfoot>
            </table>
          </Box>
        )}

        {(() => {
          const paidInvoices = filteredInvoices
            .filter((inv) => (inv.paidAmount ?? 0) > 0)
            .slice(0, 20);
          const procTotal = paidInvoices.reduce((s, inv) => s + (inv.paidAmount ?? 0), 0);
          if (paidInvoices.length === 0) return null;
          return (
            <Box mb="4">
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#444", fontWeight: 700, marginBottom: 8 }}>
                Procurement & Paid Invoices
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #111" }}>
                    <th style={{ padding: "6px 8px", textAlign: "left", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Supplier</th>
                    <th style={{ padding: "6px 8px", textAlign: "left", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Invoice #</th>
                    <th style={{ padding: "6px 8px", textAlign: "right", textTransform: "uppercase", fontSize: 10, color: "#666", fontWeight: 700 }}>Paid Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {paidInvoices.map((inv) => (
                    <tr key={inv.supplierInvoiceID} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "5px 8px" }}>{inv.supplierName}</td>
                      <td style={{ padding: "5px 8px", color: "#64748b" }}>{inv.invoiceNumber}</td>
                      <td style={{ padding: "5px 8px", textAlign: "right", fontWeight: 500 }}>{formatCurrency(inv.paidAmount ?? 0, currencyCode)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "2px solid #111" }}>
                    <td colSpan={2} style={{ padding: "6px 8px", fontWeight: 700 }}>Total Procurement</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, color: "#b45309" }}>{formatCurrency(procTotal, currencyCode)}</td>
                  </tr>
                </tfoot>
              </table>
              {paidInvoices.length === 20 && (
                <p style={{ fontSize: 10, color: "#94a3b8", fontStyle: "italic", marginTop: 4 }}>
                  * Showing top 20 paid invoices. View all in Procurement \u2192 Invoices.
                </p>
              )}
            </Box>
          );
        })()}

        <p style={{ fontSize: 10, color: "#94a3b8", fontStyle: "italic", marginTop: 8 }}>
          * Visual charts (bar, line, donut) are available in the web application.
        </p>
      </PrintableDocument>
    </PrintPreviewDialog>
  );
};
