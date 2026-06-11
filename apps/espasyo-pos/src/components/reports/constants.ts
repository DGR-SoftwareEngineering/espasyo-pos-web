import type { ChartPeriod } from "core-lib/components/radix/charts";
import {
  SupplierInvoiceDto,
  SupplierInvoiceStatusDto,
  BusinessExpenseDto,
} from "core-lib/api/commons/types";

export const PERIODS: { label: string; value: ChartPeriod }[] = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
  { label: "YTD", value: "ytd" },
  { label: "This Year", value: "year" },
];

export const STATUS_ORDER = [
  SupplierInvoiceStatusDto.Paid,
  SupplierInvoiceStatusDto.Pending,
  SupplierInvoiceStatusDto.PartiallyPaid,
  SupplierInvoiceStatusDto.Overdue,
  SupplierInvoiceStatusDto.Voided,
] as const;

export function periodToDateRange(period: ChartPeriod): { from: string; to: string } {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const to = fmt(today);
  switch (period) {
    case "today":
      return { from: to, to };
    case "7d": {
      const d = new Date(today); d.setDate(d.getDate() - 6);
      return { from: fmt(d), to };
    }
    case "30d": {
      const d = new Date(today); d.setDate(d.getDate() - 29);
      return { from: fmt(d), to };
    }
    case "90d": {
      const d = new Date(today); d.setDate(d.getDate() - 89);
      return { from: fmt(d), to };
    }
    case "ytd": {
      return { from: `${today.getFullYear()}-01-01`, to };
    }
    case "year": {
      const y = today.getFullYear();
      return { from: `${y}-01-01`, to: `${y}-12-31` };
    }
    default:
      return { from: to, to };
  }
}

export function filterExpensesByPeriod(
  expenses: BusinessExpenseDto[],
  fromDate: string,
  toDate: string,
): BusinessExpenseDto[] {
  return expenses.filter(expense => {
    const expenseDate = expense.expenseDate;
    return expenseDate >= fromDate && expenseDate <= toDate;
  });
}

export function filterInvoicesByPeriod(
  invoices: SupplierInvoiceDto[],
  fromDate: string,
  toDate: string,
): SupplierInvoiceDto[] {
  return invoices.filter(inv => {
    const invoiceDate = inv.invoiceDate?.split('T')[0];
    return invoiceDate && invoiceDate >= fromDate && invoiceDate <= toDate;
  });
}

export function getDaysAgoIso(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() - n);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDatesInRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const current = new Date(from + "T00:00:00Z");
  const end = new Date(to + "T00:00:00Z");
  const maxDays = 31;

  let dayCount = 0;
  while (current <= end && dayCount < maxDays) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
    dayCount++;
  }

  return dates;
}
