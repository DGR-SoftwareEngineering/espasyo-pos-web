import {
  FulfillmentMethodDto,
  PurchaseOrderDto,
  PurchaseOrderStatusDto,
} from "core-lib/api/commons/types";

export interface FilterState {
  searchTerm: string;
  statusFilter: PurchaseOrderStatusDto | "all";
  supplierFilter: string | "all";
  fulfillmentFilter: FulfillmentMethodDto | "all";
}

export interface StatsData {
  total: number;
  pendingReceipt: number;
  drafts: number;
  totalSpend: number;
}

export interface PurchaseOrderListProps {
  data: PurchaseOrderDto[];
  loading?: boolean;
  pagination?: {
    pageNumber: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    pageSize: number;
    totalItems?: number;
  };
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onView: (po: PurchaseOrderDto) => void;
}
