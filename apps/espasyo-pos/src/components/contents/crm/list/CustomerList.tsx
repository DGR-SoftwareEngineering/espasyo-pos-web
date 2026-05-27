import React, { useCallback } from "react";
import { Box } from "@radix-ui/themes";
import { DataTableV2 } from "core-lib/components/radix/table/DataTableV2";
import { CustomerDto } from "core-lib/api/crm";
import { CustomerTableRow } from "./CustomerTableRow";
import { TABLE_HEADERS } from "../constants";
import { CustomerListProps } from "./types";

export const CustomerList: React.FC<CustomerListProps> = ({
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
    (row: CustomerDto) => (
      <CustomerTableRow
        key={row.customerID}
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
