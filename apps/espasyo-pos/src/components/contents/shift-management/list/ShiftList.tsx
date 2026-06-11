import React, { useCallback } from "react";
import { Box } from "@radix-ui/themes";
import { DataTableV2 } from "core-lib/components/radix/table/DataTableV2";
import { CashierShiftDto } from "core-lib/api/commons/types";
import { ShiftTableRow } from "./ShiftTableRow";
import { TABLE_HEADERS } from "../constants";
import { ShiftListProps } from "./types";

export const ShiftList: React.FC<ShiftListProps> = ({
  data,
  loading,
  pagination,
  onNextPage,
  onPreviousPage,
  onView,
  onClose,
  onDelete,
  mode = "admin",
}) => {
  const bodyRowComponent = useCallback(
    (row: CashierShiftDto) => (
      <ShiftTableRow
        key={row.cashierShiftID}
        row={row}
        onView={onView}
        onClose={onClose}
        onDelete={onDelete}
        mode={mode}
      />
    ),
    [onView, onClose, onDelete, mode],
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
