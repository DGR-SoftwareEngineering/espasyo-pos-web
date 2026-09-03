import React, { useCallback } from "react";
import {
  Box,
} from "core-lib/components/radix/proxies";;
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
  selectedIds,
  onSelectProduct,
  onSelectAll,
}) => {
  const allSelected = data.length > 0 && data.every(p => selectedIds.has(p.productID));
  const someSelected = !allSelected && data.some(p => selectedIds.has(p.productID));

  const bodyRowComponent = useCallback(
    (row: ProductDataList) => (
      <ProductTableRow
        key={row.productID}
        row={row}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        isSelectable={true}
        isChecked={selectedIds.has(row.productID)}
        onSelect={() => onSelectProduct(row.productID)}
      />
    ),
    [onView, onEdit, onDelete, selectedIds, onSelectProduct],
  );

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      onSelectAll();
    } else {
      onSelectAll();
    }
  }, [allSelected, onSelectAll]);

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
        selectable={true}
        allSelected={allSelected}
        someSelected={someSelected}
        onSelectAll={handleSelectAll}
      />
    </Box>
  );
};
