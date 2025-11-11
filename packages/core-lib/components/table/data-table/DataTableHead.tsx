import { PlayArrow, PlayArrowOutlined } from "@mui/icons-material";
import {
  Box,
  Stack,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  styled,
} from "@mui/material";
import React, { useState } from "react";
import { DataTableHeader, DataTableSx } from "../types";
import { ParsedHtml } from "../../ParseHtml";
import { hasMatchingParserRule } from "../../../business/boolean";
import { tableCellAlignToJustifyContent } from "./utils";

interface DataTableHeadProps {
  tableHeaders: DataTableHeader[];
  sx?: DataTableSx;
  loading?: boolean;
  isEmpty?: boolean;
  sortColumn?: string;
  sortAscending?: boolean;
  onSort?: (column: string) => void;
  evenColumnWidth?: number;
}

export const DataTableHead: React.FC<DataTableHeadProps> = ({
  tableHeaders,
  sx,
  loading,
  isEmpty,
  sortColumn,
  sortAscending,
  onSort,
  evenColumnWidth,
}) => {
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

  return (
    <StyledTableHead sx={sx?.tableHead}>
      <TableRow>
        {tableHeaders.map((header, idx) => {
          const { dataField, ...cellProps } = header;
          const isCurrentSortColumn = sortColumn === header.name;
          const isHovered = hoveredColumn === header.name;
          const isSortable = header.sort && onSort && !loading && !isEmpty;
          return (
            <TableCell
              key={idx}
              {...cellProps}
              sx={{
                ...sx?.headerCell?.cell,
                ...(isSortable ? { cursor: "pointer" } : {}),
              }}
              align={header.align}
              width={header.width ?? `${evenColumnWidth}%`}
              data-testid={`data-table-header-${header.name}`}
              onClick={() => {
                if (isSortable) {
                  onSort?.(header.name);
                }
              }}
              onMouseEnter={() => setHoveredColumn(header.name)}
              onMouseLeave={() => setHoveredColumn(null)}
              {...(isSortable
                ? {
                    role: "button",
                    "aria-label": `Sort by ${header.name} ${
                      isCurrentSortColumn && sortAscending
                        ? "descending"
                        : "ascending"
                    }`,
                    "aria-sort": isCurrentSortColumn
                      ? sortAscending
                        ? "ascending"
                        : "descending"
                      : "none",
                    tabIndex: 0,
                    onKeyDown: (e: React.KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") {
                        onSort?.(header.name);
                        e.preventDefault();
                      }
                    },
                  }
                : {})}
            ></TableCell>
          );
        })}
      </TableRow>
    </StyledTableHead>
  );
};

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  "& th": {
    backgroundColor: theme.palette.appColors.primary,
    color: theme.palette.primary.contrastText,
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    fontSize: theme.typography.body1.fontSize,
    verticalAlign: "middle",
    "& .html-container": {
      display: "flex",
      alignItems: "center",
      "& svg": {
        color: theme.palette.primary.contrastText,
      },
    },
  },
}));
