import React, { useCallback } from "react";
import { Box } from "@radix-ui/themes";
import { DataTableV2 } from "core-lib/components/radix/table/DataTableV2";
import { InventoryDto } from "core-lib/api/commons/types";
import { InventoryTableRow } from "./InventoryTableRow";
import { TABLE_HEADERS } from "../constants";
import { InventoryListProps } from "./types";

export const InventoryList: React.FC<InventoryListProps> = ({
  data,
  loading,
  pagination,
  onNextPage,
  onPreviousPage,
  onView,
  onAdjust,
  onEditThresholds,
  onViewHistory,
  onDelete,
}) => {
  const bodyRowComponent = useCallback(
    (row: InventoryDto) => (
      <InventoryTableRow
        key={row.inventoryID}
        row={row}
        onView={onView}
        onAdjust={onAdjust}
        onEditThresholds={onEditThresholds}
        onViewHistory={onViewHistory}
        onDelete={onDelete}
      />
    ),
    [onView, onAdjust, onEditThresholds, onViewHistory, onDelete],
  );

  return (
    <Box style={{ width: "100%" }}>
      <DataTableV2
        data-testid="inventory-list-table"
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
