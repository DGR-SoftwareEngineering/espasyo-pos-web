import React, { useCallback } from "react";
import {
  Box,
} from "core-lib/components/radix/proxies";;
import { DataTableV2 } from "core-lib/components/radix/table/DataTableV2";
import { SupplierDto } from "core-lib/api/commons/types";
import { SupplierTableRow } from "./SupplierTableRow";

const TABLE_HEADERS = [
  { id: "supplier", name: "Supplier", align: "left" as const, width: "32%" },
  { id: "contact", name: "Contact", align: "left" as const, width: "22%" },
  { id: "terms", name: "Terms", align: "center" as const, width: "13%" },
  { id: "portal", name: "Portal", align: "center" as const, width: "13%" },
  { id: "created", name: "Created", align: "center" as const, width: "10%" },
  { id: "actions", name: "Actions", align: "right" as const, width: "10%" },
];

interface Props {
  data: SupplierDto[];
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
  onView: (supplier: SupplierDto) => void;
  onEdit: (supplier: SupplierDto) => void;
  onDelete: (supplier: SupplierDto) => void;
}

export const SupplierList: React.FC<Props> = ({
  data,
  loading,
  pagination,
  onNextPage,
  onPreviousPage,
  onView,
  onEdit,
  onDelete,
}) => {
  const bodyRowComponent = useCallback(
    (row: SupplierDto) => (
      <SupplierTableRow
        key={row.supplierID}
        row={row}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
    [onView, onEdit, onDelete],
  );

  return (
    <Box style={{ width: "100%" }}>
      <DataTableV2
        data-testid="supplier-list-table"
        data={data}
        loading={loading}
        tableHeaders={TABLE_HEADERS}
        pagination={pagination}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
        bodyRowComponent={bodyRowComponent}
      />
    </Box>
  );
};
