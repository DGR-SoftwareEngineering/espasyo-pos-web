import { CashierShiftDto } from "core-lib/api/commons/types";

export interface ShiftListProps {
  data: CashierShiftDto[];
  loading?: boolean;
  pagination: {
    pageNumber: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    pageSize: number;
  };
  onNextPage: () => void;
  onPreviousPage: () => void;
  onView: (shift: CashierShiftDto) => void;
  onClose: (shift: CashierShiftDto) => void;
}

export type StatusFilter = "all" | "Open" | "Closed";

export interface ShiftFilterState {
  searchTerm: string;
  statusFilter: StatusFilter;
}
