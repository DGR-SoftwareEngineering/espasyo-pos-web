import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { JSX, useReducer } from "react";
import { FilterValue, Row, TableInstance } from "react-table";
import { ListLoader } from "../loaders/ListLoader";
import { formatDate, isValidDate } from "../../business/dates";
import { PrimaryButton, SecondaryButton } from "../buttons";
import { ErrorBox } from "../ErrorBox";
import { DownloadIcon } from "../icons";
import { FilterLabel } from "./types";

interface Props<T extends Record<string, unknown>> {
  noDataText: string;
  noDataFoundText: string;
  tableInstance: TableInstance<T>;
  filterLabels?: FilterLabel[];
  filters?: FilterValue;
  labelPrefix?: string;
  isLoading?: boolean;
  downloadLabel?: string;
  downloadHidden?: boolean;
  downloadLoading?: boolean;
  downloadDisabled?: boolean;
  onDownloadClicked?(): void;
  onRowClicked?(row: Row<T>): void;
  onSearchClicked(): void;
  onFiltersCleared(): void;
}

export const TableContent = <T extends Record<string, unknown>>({
  noDataText,
  noDataFoundText,
  tableInstance,
  filterLabels,
  filters,
  labelPrefix,
  isLoading,
  downloadLabel,
  downloadHidden,
  downloadLoading,
  downloadDisabled,
  onRowClicked,
  onSearchClicked,
  onDownloadClicked,
  onFiltersCleared,
}: Props<T>): JSX.Element => {
  const theme = useTheme();
  const [filtersKey, forceFiltersUpdate] = useReducer((x: number) => x + 1, 0);

  return (
    <>
      <Table {...tableInstance.getTableProps()}>
        <TableHead>
          {filterLabels &&
            tableInstance.headerGroups.map((headerGroup) => (
              <TableRow
                {...headerGroup.getHeaderGroupProps()}
                key={headerGroup.getHeaderGroupProps().key}
              >
                {headerGroup.headers
                  .filter((column) => column.id !== "_selector")
                  .map((column, index) => {
                    const filterLabel = filterLabels?.find(
                      (filterLabel) => filterLabel.id === column.id
                    );

                    if (!filterLabel) {
                      return null;
                    }

                    return (
                      <TableCell
                        {...column.getHeaderProps()}
                        key={column.getHeaderProps().key}
                        colSpan={!index ? 2 : 1}
                        style={{
                          border: 0,
                          paddingBottom: 0,
                          paddingLeft: index === 0 ? 0 : 16,
                        }}
                      >
                        <Typography color="inherit" variant="body1">
                          {filterLabel.label}
                        </Typography>
                      </TableCell>
                    );
                  })}
              </TableRow>
            ))}
          {filters &&
            tableInstance.headerGroups.map((headerGroup) => (
              <TableRow
                {...headerGroup.getHeaderGroupProps()}
                key={
                  headerGroup.getHeaderGroupProps().key.toString() + filtersKey
                }
              >
                {headerGroup.headers
                  .filter((column) => column.id !== "_selector")
                  .map((column, index) => (
                    <TableCell
                      {...column.getHeaderProps()}
                      key={column.getHeaderProps().key}
                      colSpan={!index ? 2 : 1}
                      style={{
                        border: 0,
                        minWidth: column.minWidth,
                        width: column.width,
                        maxWidth: column.maxWidth,
                        paddingLeft: index === 0 ? 0 : 16,
                        paddingRight:
                          index === headerGroup.headers.length - 2 ? 0 : 16,
                      }}
                    >
                      {(column as any).canFilter ? column.render("Filter") : null}
                      {column.id === "_actions" && (
                        <Box display="flex" gap={4}>
                          <PrimaryButton
                            onClick={onSearchClicked}
                            disabled={!filters.length}
                            fullWidth
                            data-testid="search-button"
                          >
                            Search
                          </PrimaryButton>
                          <SecondaryButton
                            onClick={handleFiltersClear}
                            disabled={!filters.length}
                            fullWidth
                            data-testid="clear-button"
                          >
                            Clear
                          </SecondaryButton>
                        </Box>
                      )}
                    </TableCell>
                  ))}
              </TableRow>
            ))}
          {tableInstance.headerGroups.map((headerGroup) => (
            <TableRow
              {...headerGroup.getHeaderGroupProps()}
              key={headerGroup.getHeaderGroupProps().key}
              data-testid="table-header-row"
            >
              {headerGroup.headers.map((column) => (
                <TableCell
                  {...column.getHeaderProps()}
                  key={column.getHeaderProps().key}
                  tabIndex={0}
                  style={{
                    minWidth: column.minWidth,
                    width: column.width,
                    maxWidth: column.maxWidth,
                    borderColor: theme.palette.grey.A400,
                    cursor: "pointer",
                  }}
                >
                  <Grid container alignItems="center" wrap="nowrap">
                    <Grid>{column.render("Header")}</Grid>
                    <Grid pt={2}>
                      {(column as any).isSorted ? (
                        (column as any).isSortedDesc ? (
                          <KeyboardArrowDown fontSize="medium" />
                        ) : (
                          <KeyboardArrowUp fontSize="medium" />
                        )
                      ) : (
                        ""
                      )}
                    </Grid>
                  </Grid>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...tableInstance.getTableBodyProps()}>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={(tableInstance as any).visibleColumns.length}>
                <ListLoader loadersCount={4} isFullWidth spacing={4} />
              </TableCell>
            </TableRow>
          )}
          {!(tableInstance as any).page.length && !isLoading && (
            <TableRow data-testid="table-data-not-found-row">
              <TableCell colSpan={(tableInstance as any).visibleColumns.length}>
                <ErrorBox
                  mb={0}
                  label={filters.length ? noDataFoundText : noDataText}
                />
              </TableCell>
            </TableRow>
          )}
          {!isLoading &&
            (tableInstance as any).page.map((row: any) => {
              tableInstance.prepareRow(row);
              return (
                <TableRow
                  {...row.getRowProps()}
                  key={row.getRowProps().key}
                  style={{
                    backgroundColor: row.isSelected
                      ? theme.palette.primary.light
                      : row.original.isHighlight
                      ? theme.palette.grey.A100
                      : undefined,
                  }}
                  data-testid="table-row"
                >
                  {row.cells.map((cell: any) => (
                    <TableCell
                      {...cell.getCellProps()}
                      key={cell.getCellProps().key}
                      onClick={() =>
                        cell.column.id !== "_selector" &&
                        onRowClicked?.(cell.row)
                      }
                      style={{
                        color: row.isSelected
                          ? theme.palette.primary.main
                          : undefined,
                        cursor: "pointer",
                        borderColor: theme.palette.grey.A400,
                      }}
                      data-testid={`table-column-${
                        cell.getCellProps().key
                      }-data`}
                    >
                      <Typography
                        color="inherit"
                        variant="body2"
                        fontWeight={row.original?.isBold ? "bold" : "normal"}
                      >
                        {isValidDate(new Date(cell.value))
                          ? formatDate(cell.value)
                          : cell.render("Cell")}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      {onDownloadClicked && !downloadHidden && (
        <Box width="100%" mt={12} display="flex" justifyContent="flex-end">
          <PrimaryButton
            onClick={onDownloadClicked}
            loading={downloadLoading}
            disabled={downloadDisabled}
            data-testid="download"
          >
            <Box display="flex" mr={2}>
              <DownloadIcon
                customColor={
                  downloadDisabled
                    ? theme.palette.grey.A400
                    : theme.palette.common.white
                }
              />
            </Box>
            {downloadLabel}
          </PrimaryButton>
        </Box>
      )}
    </>
  );

  function handleFiltersClear() {
    onFiltersCleared();
    forceFiltersUpdate();
  }
};
