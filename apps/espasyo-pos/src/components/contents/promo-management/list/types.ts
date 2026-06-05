import { PromoDto, PromoStatus } from "core-lib/api/commons/types";
import { StatusFilter } from "../constants";

export interface PromoFilters {
  searchTerm: string;
  statusFilter: StatusFilter;
}

export interface PaginationMeta {
  pageNumber: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageSize: number;
}

export interface PromoListProps {
  data: PromoDto[];
  loading: boolean;
  pagination: PaginationMeta;
  onView: (promo: PromoDto) => void;
  onActivate: (promo: PromoDto) => void;
  onDeactivate: (promo: PromoDto) => void;
  onDelete: (promo: PromoDto) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

export interface PromoStats {
  total: number;
  active: number;
  draft: number;
  scheduled: number;
  expired: number;
}
