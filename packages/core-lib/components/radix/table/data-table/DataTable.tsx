import React, { ReactElement, useRef } from "react";
import { Box, Table, Text } from "@radix-ui/themes";
import { AnimatedBoxSkeleton } from "../../animations/AnimatedBoxSkeleton";
import { DataTableHeader, DataTableSx } from "../../../table/types";
import { DataTableHead } from "./DataTableHead";
import { DataTablePaginatedFooter } from "./DataTablePaginatedFooter";
import {
  ActionColumnProps,
  DataTableColumn,
  DataTableRow,
} from "./DataTableRow";

interface Props<T> {
  "data-testid"?: string;
  id?: string;
  data: T[];
  sx?: DataTableSx;
  loading?: boolean;
  isRowSelectable?: boolean;
  tableHeaders: DataTableHeader[];
  tableColumns?: DataTableColumn<T>[];
  pagination?: {
    pageNumber?: number;
    pageSize?: number;
    totalCount: number;
    defaultPageSize: number;
  };
  rowsPerPageOptions?: Array<number | { value: number; label: string }>;
  onRowSelect?(index: number): void;
  selectedRowIndex?: number | null;
  bodyRowComponent?(data: T, key: number): ReactElement;
  sortColumn?: string;
  sortAscending?: boolean;
  onSort?: (column: string) => void;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  actionColumn?: ActionColumnProps;
  renderActionButton?: React.ComponentProps<
    typeof DataTableRow
  >["renderActionButton"];
}

export const DataTable = <T,>({
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
  renderActionButton,
  ...props
}: Props<T>) => {
  const lastDataItemsCount = useRef(
    data.length || pagination?.pageSize || pagination?.defaultPageSize || 5,
  );
  const isEmpty = data.length === 0;
  const evenColumnWidth = tableColumns ? 100 / tableColumns.length : undefined;

  if (data.length) {
    lastDataItemsCount.current = data.length;
  }

  return (
    <>
      <Box
        id={id}
        data-testid="table-container"
        style={{ overflowX: "auto", width: "100%" }}
      >
        <Table.Root
          variant="surface"
          data-testid={props["data-testid"]}
          aria-label="data table"
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
          <Table.Body>
            {loading &&
              Array.from(Array(lastDataItemsCount.current).keys()).map(
                (key, idx) => (
                  <Table.Row
                    key={key}
                    data-testid={`data-table-loader-row-${idx + 1}`}
                  >
                    <Table.Cell colSpan={tableHeaders.length}>
                      <AnimatedBoxSkeleton height={26} light={idx % 2 === 1} />
                    </Table.Cell>
                  </Table.Row>
                ),
              )}
            {!loading &&
              data.map((row, index) => {
                return (
                  bodyRowComponent?.(row, index) ?? (
                    <DataTableRow
                      key={index}
                      id={id}
                      data={row}
                      rowKey={index}
                      tableColumns={tableColumns || []}
                      isRowSelectable={isRowSelectable}
                      selectedRowIndex={selectedRowIndex ?? 0}
                      evenColumnWidth={evenColumnWidth}
                      onRowSelect={onRowSelect}
                      actionColumn={actionColumn}
                      renderActionButton={renderActionButton}
                    />
                  )
                );
              })}
          </Table.Body>
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
        </Table.Root>
      </Box>
      {!isEmpty && !loading && !!pagination && (
        <Text size="2" weight="bold" as="p" style={{ padding: "20px 0" }}>
          Pagination total {pagination.totalCount.toString()}
        </Text>
      )}
    </>
  );
};
