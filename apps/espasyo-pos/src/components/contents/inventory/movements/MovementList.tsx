import React, { useCallback } from "react";
import { Box } from "@radix-ui/themes";
import { DataTableV2 } from "core-lib/components/radix/table/DataTableV2";
import { StockMovementDto } from "core-lib/api/commons/types";
import { MovementTableRow } from "./MovementTableRow";
import { MOVEMENT_TABLE_HEADERS } from "../constants";
import { MovementListProps } from "./types";

export const MovementList: React.FC<MovementListProps> = ({
  data,
  loading,
  pagination,
  onNextPage,
  onPreviousPage,
}) => {
  const bodyRowComponent = useCallback(
    (row: StockMovementDto) => (
      <MovementTableRow key={row.stockMovementID} row={row} />
    ),
    [],
  );

  return (
    <Box style={{ width: "100%" }}>
      <DataTableV2
        data-testid="movements-list-table"
        data={data}
        loading={loading}
        tableHeaders={MOVEMENT_TABLE_HEADERS}
        pagination={pagination}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
        bodyRowComponent={bodyRowComponent}
      />
    </Box>
  );
};
