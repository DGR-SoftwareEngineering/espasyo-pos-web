import {
  StockMovementDto,
  StockMovementType,
} from "core-lib/api/commons/types";

export interface MovementListProps {
  data: StockMovementDto[];
  loading?: boolean;
  pagination?: {
    pageNumber: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    pageSize: number;
  };
  onNextPage?: () => void;
  onPreviousPage?: () => void;
}

export interface MovementFilterState {
  fromDate: string;
  toDate: string;
  movementType: StockMovementType | "all";
  pageSize: number;
}
