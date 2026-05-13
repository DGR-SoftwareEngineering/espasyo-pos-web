import React, { useCallback } from "react";
import { Box, alpha, useTheme } from "@mui/material";
import { DataTableV2 } from "core-lib";
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
  const theme = useTheme();

  const bodyRowComponent = useCallback(
    (row: StockMovementDto) => (
      <MovementTableRow key={row.stockMovementID} row={row} />
    ),
    [],
  );

  return (
    <Box sx={{ width: "100%" }}>
      <DataTableV2
        data-testid="movements-list-table"
        data={data}
        loading={loading}
        tableHeaders={MOVEMENT_TABLE_HEADERS}
        pagination={pagination}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
        bodyRowComponent={bodyRowComponent}
        sx={{
          tableHead: {
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          },
          headerCell: {
            cell: { py: 2, fontWeight: 600 },
            typography: {
              fontWeight: 600,
              fontSize: "0.875rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            },
          },
          bodyCell: { cell: { py: 1.5 } },
        }}
      />
    </Box>
  );
};
