import {
  Box,
  Radio,
  SxProps,
  TableCell,
  TableRow,
  Theme,
  Typography,
  styled,
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
import { caseInsensitiveEquals } from "../../../business/strings";
import { ContentButtonBlock } from "../../blocks/ContentButtonBlock";
import { UseDataTableParamsResult } from "../../blocks/dataTable/hooks";
import {
  ActionColumnProps,
  DataTableRow as DataTableRowType,
} from "../../blocks/dataTable/types";
import { tableCellAlignToJustifyContent } from "./utils";

interface DataTableRowProps<T> {
  data: T;
  rowKey: number;
  tableColumns: UseDataTableParamsResult["columns"];
  isRowSelectable?: boolean;
  selectedRowIndex?: number;
  onRowSelect?: (index: number) => void;
  evenColumnWidth?: number;
  id?: string;
  sx?: SxProps<Theme>;
  actionColumn?: ActionColumnProps;
}

export const DataTableRow = <T extends unknown>({
  data,
  rowKey,
  tableColumns,
  isRowSelectable,
  selectedRowIndex,
  onRowSelect,
  evenColumnWidth,
  id,
  sx,
  actionColumn,
}: DataTableRowProps<T>) => {
  const isRowDisabled = actionColumn?.column
    ? tableColumns.some((column) => {
        return (
          caseInsensitiveEquals(actionColumn.column ?? "", column.dataField) &&
          !caseInsensitiveEquals(
            actionColumn.status ?? "",
            column.originalValue?.(data as DataTableRowType)
          )
        );
      })
    : false;

  return (
    <StyledTableRow
      key={rowKey}
      data-testid={`data-table-row-${rowKey}`}
      isRowSelectable={isRowSelectable}
      isDisabled={isRowDisabled}
      onClick={() => handleRowSelect(rowKey)}
      {...(isRowSelectable && {
        role: "row",
        "aria-selected": rowKey === selectedRowIndex,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            handleRowSelect(rowKey);
            e.preventDefault();
          }
        },
      })}
    >
      {tableColumns?.map((column, idx) => {
        const actionParam =
          column?.actionButton?.customActionKey?.split(":")?.[1];
        const customActionParamValue = tableColumns
          ?.find((column) => column.dataField === actionParam)
          ?.parseValue(data as DataTableRowType);

        return (
          <TableCell
            key={idx}
            align={column.align}
            width={column.width ?? `${evenColumnWidth}%`}
            sx={{
              ...sx,
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent={tableCellAlignToJustifyContent(column.align)}
            >
              {column?.actionButton ? (
                <ContentButtonBlock
                  {...column?.actionButton}
                  customActionParams={customActionParamValue}
                  disabled={isRowDisabled}
                />
              ) : (
                <>
                  {idx === 0 && isRowSelectable && (
                    <Radio
                      data-testid={`data-table-row-${rowKey}-select`}
                      aria-label={`Select row ${rowKey}`}
                      checked={rowKey === selectedRowIndex}
                      onChange={() => handleRowSelect(rowKey)}
                      sx={{
                        padding: 0,
                        marginRight: 2,
                        ...(rowKey === selectedRowIndex && {
                          cursor: "default",
                        }),
                      }}
                    />
                  )}
                  <Box>
                    <Typography>
                      {column.parseValue?.(data as DataTableRowType)}
                    </Typography>
                    {id &&
                      column
                        .parseValue?.(data as DataTableRowType)
                        ?.includes("*") && (
                        <Box component="span" className="visually-hidden">
                          Test
                        </Box>
                      )}
                  </Box>
                </>
              )}
            </Box>
          </TableCell>
        );
      })}
    </StyledTableRow>
  );

  function handleRowSelect(index: number) {
    if (!isRowSelectable) return;
    onRowSelect?.(index);
  }
};

const StyledTableRow = styled(TableRow, {
  shouldForwardProp: (prop) =>
    prop !== "isRowSelectable" && prop !== "isDisabled",
})<{ isRowSelectable?: boolean; isDisabled: boolean }>(
  ({ theme, selected, isRowSelectable, isDisabled }) => ({
    [`& .${tableCellClasses.root}`]: {
      py: theme.spacing(3),
    },

    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.appColors.support80.transparentLight,
    },

    ...(isRowSelectable && !selected && { cursor: "pointer" }),

    ...(selected && {
      "&&": {
        backgroundColor: `${theme.palette.appColors.secondary.transparentLight} !important`,
        "&:nth-of-type(odd)": {
          backgroundColor: `${theme.palette.appColors.secondary.transparentLight} !important`,
        },
        "&:hover": {
          backgroundColor: `${theme.palette.appColors.secondary.transparentLight} !important`,
        },
      },
    }),
    ...(isDisabled && {
      backgroundColor: `${theme.palette.action.disabledBackground} !important`,
      color: `${theme.palette.text.disabled} !important`,
    }),
  })
);
