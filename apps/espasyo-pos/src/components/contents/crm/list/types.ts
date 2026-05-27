import { CustomerDto } from "core-lib/api/crm";

export interface CustomerListProps {
  data: CustomerDto[];
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
  onView: (c: CustomerDto) => void;
  onEdit: (c: CustomerDto) => void;
  onDelete: (c: CustomerDto) => void;
}
