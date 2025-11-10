import {
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Theme,
  Typography,
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
import React, { ReactElement, useRef } from "react";
import { AnimatedBoxSkeleton } from "../../animations";
import { DataTableHeader, DataTableSx } from "../types";
import { ActionColumnCustomizationType } from "../../../api/content/types/page";
import { UseDataTableParamsResult } from "../../blocks/dataTable/hooks";
import { DataTableHead } from "./DataTableHead";
import { DataTablePaginatedFooter } from "./DataTablePaginatedFooter";
import { DataTableRow } from "./DataTableRow";
import { useCardTableRowLimit } from "../../blocks/dataTable/useCardTableRowLimit";
import { ActionColumnProps } from "../../blocks/dataTable/types";

interface Props<T> {
  "data-testid"?: string;
  id?: string;
  data: T[];
  sx?: DataTableSx;
  loading?: boolean;
  isRowSelectable?: boolean;
  tableHeaders: DataTableHeader[];
  tableColumns?: UseDataTableParamsResult["columns"];
  pagination?: {
    pageNumber?: number;
    pageSize?: number;
    totalCount: number;
    defaultPageSize: number;
  };
  actionableColumn?: string | null;
  actionableStatus?: string | null;
  actionableColumnCustomization?:
    | ActionColumnCustomizationType["values"]
    | null;
  rowsPerPageOptions?: Array<number | { value: number; label: string }>;
  onRowSelect?(index: number): void;
  selectedRowIndex?: number | null;
  bodyRowComponent?(data: T, key: number, sx?: SxProps<Theme>): ReactElement;
  sortColumn?: string;
  sortAscending?: boolean;
  onSort?: (column: string) => void;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  actionColumn?: ActionColumnProps;
}

export const DataTable = <T extends unknown>({
  id,
  sx,
  data,
  loading,
  isRowSelectable,
  tableHeaders,
  tableColumns,
  bodyRowComponent,
  pagination,
  onPageChange,
  rowsPerPageOptions,
  onRowsPerPageChange,
  onRowSelect,
  selectedRowIndex,
  sortColumn,
  sortAscending,
  onSort,
  actionColumn,
  ...props
}: Props<T>) => {
  const lastDataItemsCount = useRef(
    data.length || pagination?.pageSize || pagination?.defaultPageSize
  );
  const isEmpty = data.length === 0;
  const evenColumnWidth = tableColumns ? 100 / tableColumns.length : undefined;

  const { containerRef, limitedData } = useCardTableRowLimit<T>({
    isCard: false,
    data,
    loading,
  });

  if (data.length) {
    lastDataItemsCount.current = limitedData.length;
  }

  return (
    <>
      <TableContainer
        id={id}
        sx={{ overflowX: "auto", width: "100%" }}
        ref={containerRef}
        data-testid="table-container"
      >
        <Table
          data-testid={props["data-testid"]}
          aria-label="data table"
          sx={nonCardTableSxProps}
        >
          {!loading && !isEmpty && (
            <DataTableHead
              tableHeaders={tableHeaders}
              sx={sx}
              loading={loading}
              isEmpty={isEmpty}
              sortColumn={sortColumn}
              sortAscending={sortAscending}
              onSort={onSort}
              evenColumnWidth={evenColumnWidth}
            />
          )}
          <TableBody>
            {loading &&
              Array.from(Array(lastDataItemsCount.current).keys()).map(
                (key, idx) => (
                  <TableRow
                    key={key}
                    sx={sx?.bodyCell?.cell}
                    data-testid={`data-table-loader-row-${idx + 1}`}
                  >
                    <TableCell colSpan={tableHeaders.length}>
                      <AnimatedBoxSkeleton height={26} light={idx % 2 === 1} />
                    </TableCell>
                  </TableRow>
                )
              )}
            {!loading &&
              limitedData.map((row, index) => {
                return (
                  bodyRowComponent?.(row, index, sx?.bodyCell?.cell) ?? (
                    <DataTableRow
                      id={id}
                      key={index}
                      data={row}
                      rowKey={index}
                      tableColumns={tableColumns || []}
                      isRowSelectable={isRowSelectable}
                      selectedRowIndex={selectedRowIndex ?? 0}
                      evenColumnWidth={evenColumnWidth}
                      onRowSelect={onRowSelect}
                      sx={sx?.bodyCell?.cell}
                      actionColumn={actionColumn}
                    />
                  )
                );
              })}
          </TableBody>
          {pagination &&
            pagination.totalCount > pagination.defaultPageSize &&
            onPageChange && (
              <DataTablePaginatedFooter
                tableHeadersLength={tableHeaders.length}
                pagination={{
                  ...pagination,
                  pageNumber: pagination?.pageNumber ?? 1,
                  pageSize: pagination?.pageSize ?? pagination.defaultPageSize,
                }}
                rowsPerPageOptions={rowsPerPageOptions}
                onRowsPerPageChange={onRowsPerPageChange}
                onPageChange={onPageChange}
              />
            )}
        </Table>
      </TableContainer>
      {!isEmpty && !loading && !!pagination && (
        <Typography variant="body2" fontWeight="bold" py={5}>
          Pagination total {pagination.totalCount.toString()}
        </Typography>
      )}
    </>
  );
};

const nonCardTableSxProps: SxProps<Theme> = {
  [`& .${tableCellClasses.root}`]: {
    borderBottomColor: (theme) => theme.palette.divider,
  },
};
