import { ProductDataList } from "core-lib/api/commons/types";

export interface ProductListProps {
  data: ProductDataList[];
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
  onView: (product: ProductDataList) => void;
  onEdit: (product: ProductDataList) => void;
  onDelete: (product: ProductDataList) => void;
  selectedIds: Set<string>;
  onSelectProduct: (id: string) => void;
  onSelectAll: () => void;
}

export interface StatusInfo {
  label: string;
  color: "success" | "warning" | "error" | "default";
  icon: React.ReactElement | null;
}

export interface CategoryInfo {
  icon: React.ReactNode;
  label: string;
}

export type ProductTypeFilter = "all" | "menuItem" | "ingredient" | "supply";

export interface FilterState {
  searchTerm: string;
  statusFilter: number | "all";
  productTypeFilter: ProductTypeFilter;
}

export interface StatsData {
  totalProducts: number;
  activeProducts: number;
  menuItems: number;
  ingredients: number;
  businessSupplies: number;
}

export interface StatusOption {
  value: number | "all";
  label: string;
  color: "default" | "success" | "warning" | "error";
}

export interface CategoryTypeOption {
  value: number | "all";
  label: string;
}
