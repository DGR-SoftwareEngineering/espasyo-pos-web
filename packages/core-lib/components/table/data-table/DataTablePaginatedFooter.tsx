import { ExpandMore } from "@mui/icons-material";
import {
  TableCell,
  TableFooter,
  TablePagination,
  TableRow,
} from "@mui/material";
import React from "react";

interface DataTablePaginatedFooterProps {
  tableHeadersLength: number;
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    defaultPageSize: number;
  };
  rowsPerPageOptions?: Array<number | { value: number; label: string }>;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface LabelDisplayedRowsArgs {
  from: number;
  to: number;
  count: number;
  page: number;
}

export const DataTablePaginatedFooter: React.FC<
  DataTablePaginatedFooterProps
> = ({
  tableHeadersLength,
  pagination,
  rowsPerPageOptions,
  onPageChange,
  onRowsPerPageChange,
}) => {
  return (
    <TableFooter>
      <TableRow>
        <TableCell
          colSpan={tableHeadersLength}
          sx={{
            padding: 0,
            backgroundColor: (theme) =>
              theme.palette.appColors.support60
                .transparentLight,
          }}
        >
          <TablePagination
            component="div"
            count={pagination?.totalCount ?? 0}
            page={pagination?.pageNumber ? pagination.pageNumber - 1 : 0}
            rowsPerPage={pagination?.pageSize ?? pagination.defaultPageSize}
            onPageChange={handleChangePage}
            onRowsPerPageChange={onRowsPerPageChange}
            rowsPerPageOptions={rowsPerPageOptions}
            data-testid="data-table-pagination"
            labelDisplayedRows={getDisplayedRowsLabel}
            slotProps={{
              select: {
                variant: "outlined",
                IconComponent: ExpandMore,
                sx: {
                  "& .MuiSelect-icon": {
                    fontSize: "2rem",
                    right: (theme) => theme.spacing(0.5),
                  },
                  "& .MuiSelect-select.MuiSelect-outlined": {},
                  backgroundColor: (theme) =>
                    theme.palette.appColors.incidental[
                      "000"
                    ],
                  borderRadius: "2px",
                },
              },
            }}
            sx={{
              overflow: "visible",
              "& .MuiToolbar-root": {
                px: (theme) => theme.spacing(2.5),
                fontSize: (theme) => theme.typography.body1.fontSize,
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-select, & .MuiTablePagination-displayedRows":
                  {
                    fontSize: "inherit",
                  },
              },
              "& .MuiTablePagination-selectLabel": { order: 0 },
              "& .MuiTablePagination-select": { order: 1 },
              "& .MuiTablePagination-spacer": { order: 2 },
              "& .MuiTablePagination-displayedRows": { order: 3 },
              "& .MuiTablePagination-actions": {
                order: 4,
                display: "flex",
                gap: (theme) => theme.spacing(1),
                marginLeft: (theme) => theme.spacing(2.5),
                "& .MuiIconButton-root": {
                  borderRadius: "2px",
                  backgroundColor: (theme) =>
                    theme.palette.appColors.incidental["000"],
                  color: (theme) => theme.palette.primary.main,
                  "&.Mui-disabled": {
                    color: (theme) => theme.palette.action.disabled,
                  },
                  width: 48,
                  height: 40,
                  minWidth: 48,
                  minHeight: 40,
                  "& svg": {
                    fontSize: "2rem",
                  },
                },
              },
            }}
          />
        </TableCell>
      </TableRow>
    </TableFooter>
  );

  function handleChangePage(event: unknown, newPage: number) {
    onPageChange(event, newPage + 1);
  }

  function getDisplayedRowsLabel({ page }: LabelDisplayedRowsArgs) {
    const totalPages = Math.ceil(
      (pagination?.totalCount ?? 0) /
        (pagination?.pageSize ?? pagination?.defaultPageSize)
    );
    return `Page ${page + 1} of ${totalPages}`;
  }
};
