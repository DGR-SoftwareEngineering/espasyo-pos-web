import React, { useCallback } from "react";
import { Box, useTheme, alpha } from "@mui/material";
import { DataTableV2 } from "../../../DataTableV2";
import { useDialogContext } from "../../../../core/contexts";
import { ProductTableRow } from "./components/ProductTableRow";
import { TABLE_HEADERS, DIALOG_TITLES, DIALOG_TYPES } from "./constants";
import { ProductListProps } from "./types";
import { ProductDataList } from "../../../../api/commons/types";

export const ProductList: React.FC<ProductListProps> = ({
  data,
  loading,
  pagination,
  onNextPage,
  onPreviousPage,
  onSuccess,
}) => {
  const theme = useTheme();
  const { openDialog } = useDialogContext();

  const handleView = useCallback(
    (product: ProductDataList) => {
      openDialog({
        title: DIALOG_TITLES.view,
        dialogContentType: DIALOG_TYPES.view,
        data: product,
      });
    },
    [openDialog],
  );

  const handleEdit = useCallback(
    (product: ProductDataList) => {
      openDialog({
        title: DIALOG_TITLES.edit,
        dialogContentType: DIALOG_TYPES.edit,
        data: product,
        onSuccess,
      });
    },
    [openDialog, onSuccess],
  );

  const handleDelete = useCallback(
    (product: ProductDataList) => {
      openDialog({
        title: DIALOG_TITLES.delete,
        dialogContentType: DIALOG_TYPES.delete,
        data: product,
        onSuccess,
      });
    },
    [openDialog, onSuccess],
  );

  const bodyRowComponent = useCallback(
    (row: ProductDataList) => (
      <ProductTableRow
        key={row.productID}
        row={row}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
    [handleView, handleEdit, handleDelete],
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
