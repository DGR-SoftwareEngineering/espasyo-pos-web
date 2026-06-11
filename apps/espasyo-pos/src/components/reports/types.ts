import type React from "react";
import { SaleStatusDto } from "core-lib/api/commons/types";

export type Accent =
  | "indigo"
  | "violet"
  | "teal"
  | "amber"
  | "red"
  | "green"
  | "blue"
  | "orange";

export interface KpiTile {
  label: string;
  value: string | null;
  hint: string;
  accent: Accent;
  icon: React.ReactNode;
  loading: boolean;
}

export interface DailyTransactionsPanelProps {
  date: string | null;
  summary: { totalAmount: number; salesCount: number } | null;
  onClose: () => void;
}

export interface DailySalesTargetTabProps {
  todayTotal: number;
  salesCount: number;
  salesLoading: boolean;
}

export interface StatusBadge {
  color: "green" | "red" | "amber" | "blue";
  label: string;
}

export function getStatusBadge(status: SaleStatusDto): StatusBadge {
  switch (status) {
    case SaleStatusDto.Completed:
      return { color: "green", label: "Completed" };
    case SaleStatusDto.Voided:
      return { color: "red", label: "Voided" };
    case SaleStatusDto.PartiallyRefunded:
      return { color: "amber", label: "Partial Refund" };
    case SaleStatusDto.FullyRefunded:
      return { color: "blue", label: "Fully Refunded" };
    default:
      return { color: "blue", label: "Unknown" };
  }
}
