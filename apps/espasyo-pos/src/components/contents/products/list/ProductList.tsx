import React, { useCallback } from "react";
import { Box, useTheme, alpha } from "@mui/material";
import { DataTableV2 } from "core-lib";
import { ProductTableRow } from "./ProductTableRow";
import { TABLE_HEADERS } from "../constants";
import { ProductListProps } from "./types";
import { ProductDataList } from "core-lib/api/commons/types";

export const ProductList: React.FC<ProductListProps> = ({
  data,
  loading,
  pagination,
  onNextPage,
  onPreviousPage,
  onView,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();

  const bodyRowComponent = useCallback(
    (row: ProductDataList) => (
      <ProductTableRow
        key={row.productID}
        row={row}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
    [onView, onEdit, onDelete],
  );

  return (
    <Box sx={{ width: "100%" }}>
      <DataTableV2
        data-testid="product-list-table"
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
