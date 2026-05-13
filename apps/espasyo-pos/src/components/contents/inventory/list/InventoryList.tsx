import React, { useCallback } from "react";
import { Box, alpha, useTheme } from "@mui/material";
import { DataTableV2 } from "core-lib";
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
  const theme = useTheme();

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
    <Box sx={{ width: "100%" }}>
      <DataTableV2
        data-testid="inventory-list-table"
        data={data}
        loading={loading}
        tableHeaders={TABLE_HEADERS}
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
            cell: {
              py: 2,
              fontWeight: 600,
              color: theme.palette.text.primary,
            },
            typography: {
              fontWeight: 600,
              fontSize: "0.875rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            },
          },
          bodyCell: {
            cell: {
              py: 1.5,
            },
          },
        }}
      />
    </Box>
  );
};
