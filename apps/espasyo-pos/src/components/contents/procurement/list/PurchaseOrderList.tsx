import React, { useCallback } from "react";
import { Box } from "@radix-ui/themes";
import { DataTableV2 } from "core-lib/components/radix/table/DataTableV2";
import { PurchaseOrderDto } from "core-lib/api/commons/types";
import { PurchaseOrderTableRow } from "./PurchaseOrderTableRow";
import { TABLE_HEADERS } from "../constants";
import { PurchaseOrderListProps } from "./types";

export const PurchaseOrderList: React.FC<PurchaseOrderListProps> = ({
  data,
  loading,
  pagination,
  onNextPage,
  onPreviousPage,
  onView,
}) => {
  const bodyRowComponent = useCallback(
    (row: PurchaseOrderDto) => (
      <PurchaseOrderTableRow
        key={row.purchaseOrderID}
        row={row}
        onView={onView}
      />
    ),
    [onView],
  );

  return (
    <Box style={{ width: "100%" }}>
      <DataTableV2
        data-testid="purchase-order-list-table"
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
