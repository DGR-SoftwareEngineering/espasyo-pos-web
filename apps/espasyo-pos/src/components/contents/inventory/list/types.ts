import { InventoryDto, InventoryStatus } from "core-lib/api/commons/types";

export interface InventoryListProps {
  data: InventoryDto[];
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
  onView: (inventory: InventoryDto) => void;
  onAdjust: (inventory: InventoryDto) => void;
  onEditThresholds: (inventory: InventoryDto) => void;
  onViewHistory: (inventory: InventoryDto) => void;
  onDelete: (inventory: InventoryDto) => void;
}

export interface InventoryFilterState {
  searchTerm: string;
  statusFilter: InventoryStatus | "all";
  showLowStockOnly: boolean;
}

export interface InventoryStats {
  totalItems: number;
  inStock: number;
  lowStock: number;
  critical: number;
  outOfStock: number;
}
