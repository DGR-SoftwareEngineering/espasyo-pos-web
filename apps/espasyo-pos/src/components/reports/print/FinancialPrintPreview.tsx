import React from "react";
import { PrintPreviewDialog, PrintableDocument } from "core-lib/components/print";
import { FinancialSummaryTable } from "../FinancialSummaryTable";
import type { FinancialData } from "../FinancialSummaryTable";

interface FinancialPrintPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodLabel: string;
  businessName: string;
  logoUrl: string | null;
  data: FinancialData;
}

export const FinancialPrintPreview: React.FC<FinancialPrintPreviewProps> = ({
  open,
  onOpenChange,
  periodLabel,
  businessName,
  logoUrl,
  data,
}) => (
  <PrintPreviewDialog
    open={open}
    onOpenChange={onOpenChange}
    title={`Financial Summary \u00B7 ${periodLabel}`}
  >
    <PrintableDocument
      businessName={businessName}
      logoUrl={logoUrl ?? null}
      documentLabel="Financial Summary"
      documentNumber={periodLabel}
    >
      <FinancialSummaryTable data={data} />
    </PrintableDocument>
  </PrintPreviewDialog>
);
