import { Box } from "@mui/material";
import React, { useEffect } from "react";
import { findKeysWithAsterisk } from "../../../business/find-in-array";
import { useFormSubmissionBindingHooks } from "../../../core/hooks";
import { DataTable } from "../../table/data-table/DataTable";
import { DataTableProps } from "./types";
import {
  DEFAULT_PAGE_SIZE,
  useDataTableParams,
  useCachedDataTableRow,
  useCachedSelectedRow,
} from "./hooks";

//Data table for purely dynamic implementation. Ready.

export const DataTableBlock: React.FC<DataTableProps> = ({
  id,
  tableKey,
  sourceUrl,
  paramName,
  columns,
  pageSize,
  withLabelPrefix,
  defaultOrderingColumn,
  defaultOrderingOrder,
  selectableRows,
  actionColumn,
}) => {
  const defaultPageSize = pageSize ?? DEFAULT_PAGE_SIZE;
  const tableData = useDataTableParams({
    sourceUrl,
    paramName,
    pageSize: defaultPageSize,
    columns,
    withLabelPrefix,
    tableKey,
    defaultOrderingColumn,
    defaultOrderingOrder,
  });

  const [, setCachedRow] = useCachedDataTableRow();
  const [, setCachedSelection, clearCachedSelection] = useCachedSelectedRow();

  const annotations = findKeysWithAsterisk(tableData.rows);

  useEffect(() => {
    return () => {
      clearCachedSelection();
    };
  }, []);

  const handleRowSelect = (index: number) => {
    tableData.setSelectedRowIndex(index);
    setCachedSelection(tableData.rows[index]);
  };

  const handleRowSubmit = async () => {
    if (!tableData.selectedRowData || !tableKey) return;
    setCachedRow({ [tableKey]: tableData.selectedRowData });
    clearCachedSelection();
  };

  useFormSubmissionBindingHooks({
    key: "submitDataTableRow",
    cb: handleRowSubmit,
    isValid: !tableData.loading && !!tableData.selectedRowData,
    initDependencies: [tableData.selectedRowData],
  });

  return (
    <>
      <DataTable
        id={tableKey || id}
        data={tableData.rows}
        data-testid={id}
        loading={tableData.loading}
        tableHeaders={tableData.columns.map(({ parseValue, ...rest }) => rest)}
        tableColumns={tableData.columns}
        pagination={{
          pageNumber: tableData.paginatedSort.pageNumber,
          pageSize: tableData.paginatedSort.pageSize,
          totalCount: tableData.totalRows,
          defaultPageSize,
        }}
        onPageChange={(_, newPage) => tableData.paginatedSort.setPage(newPage)}
        onRowsPerPageChange={(event) => {
          const newPageSize = parseInt(event.target.value, 10);
          tableData.paginatedSort.setPageSize(
            isNaN(newPageSize) ? defaultPageSize : newPageSize
          );
        }}
        rowsPerPageOptions={[10, 25, 50, 100]}
        sortColumn={tableData.paginatedSort.sortBy}
        sortAscending={tableData.paginatedSort.ascending}
        onSort={(column) => tableData.paginatedSort.sort(column)}
        isRowSelectable={selectableRows}
        onRowSelect={handleRowSelect}
        selectedRowIndex={tableData.selectedRowIndex}
        actionColumn={actionColumn}
      />
      {annotations &&
        annotations.map((annotation, idx) => (
          <Box
            key={idx}
            component="div"
            sx={{
              fontSize: (theme) => theme.typography.body2.fontSize,
              fontStyle: "italic",
              mt: 4,
            }}
          >
            test
          </Box>
        ))}
    </>
  );
};
