import React, { useCallback } from "react";
import { Box } from "@radix-ui/themes";
import { DataTableV2 } from "core-lib/components/radix/table/DataTableV2";
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
    <Box style={{ width: "100%" }}>
      <DataTableV2
        data-testid="product-list-table"
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
