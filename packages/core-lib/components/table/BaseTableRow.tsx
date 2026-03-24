import React from "react";
import {
  Box,
  Radio,
  SxProps,
  TableCell,
  TableRow,
  Theme,
  styled,
  alpha,
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";

interface BaseTableRowProps<T> {
  data: T;
  rowKey: number | string;
  columns: Array<{
    id: string;
    label?: string;
    align?: "left" | "center" | "right";
    width?: string | number;
    render: (data: T) => React.ReactNode;
  }>;
  isSelectable?: boolean;
  selectedRowKey?: number | string;
  onSelect?: (rowKey: number | string) => void;
  isDisabled?: boolean;
  onRowClick?: (data: T) => void;
  sx?: SxProps<Theme>;
  selectInput?: "radio" | "checkbox";
  renderSelectInput?: (props: {
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled: boolean;
  }) => React.ReactNode;
}

export const BaseTableRow = <T extends unknown>({
  data,
  rowKey,
  columns,
  isSelectable,
  selectedRowKey,
  onSelect,
  isDisabled = false,
  onRowClick,
  sx,
  selectInput = "radio",
  renderSelectInput,
}: BaseTableRowProps<T>) => {
  const isSelected = selectedRowKey === rowKey;

  const handleRowClick = () => {
    if (isSelectable && onSelect && !isDisabled) {
      onSelect(rowKey);
    }
    if (onRowClick && !isDisabled) {
      onRowClick(data);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (!isDisabled && onSelect) {
      onSelect(rowKey);
    }
  };

  const defaultSelectInput = () => {
    const selectProps = {
      checked: isSelected,
      onChange: handleSelectChange,
      disabled: isDisabled,
    };

    if (renderSelectInput) {
      return renderSelectInput(selectProps);
    }

    if (selectInput === "radio") {
      return (
        <Radio
          data-testid={`table-row-${rowKey}-select`}
          aria-label={`Select row ${rowKey}`}
          checked={isSelected}
          onChange={handleSelectChange}
          onClick={(e) => e.stopPropagation()}
          disabled={isDisabled}
          sx={{
            padding: 0,
            marginRight: 2,
            ...(isSelected && { cursor: "default" }),
          }}
        />
      );
    }

    return null;
  };

  return (
    <StyledTableRow
      data-testid={`table-row-${rowKey}`}
      isSelectable={isSelectable}
      isDisabled={isDisabled}
      isSelected={isSelected}
      onClick={handleRowClick}
      {...(isSelectable && {
        role: "row",
        "aria-selected": isSelected,
        onKeyDown: (e: React.KeyboardEvent) => {
          if ((e.key === "Enter" || e.key === " ") && !isDisabled) {
            handleRowClick();
            e.preventDefault();
          }
        },
      })}
    >
      {columns.map((column, idx) => (
        <TableCell
          key={column.id}
          align={column.align || "left"}
          width={column.width}
          sx={sx}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent={
              column.align === "center"
                ? "center"
                : column.align === "right"
                  ? "flex-end"
                  : "flex-start"
            }
          >
            {idx === 0 && isSelectable && defaultSelectInput()}
            {column.render(data)}
          </Box>
        </TableCell>
      ))}
    </StyledTableRow>
  );
};

const StyledTableRow = styled(TableRow, {
  shouldForwardProp: (prop) =>
    prop !== "isSelectable" && prop !== "isDisabled" && prop !== "isSelected",
})<{
  isSelectable?: boolean;
  isDisabled: boolean;
  isSelected?: boolean;
}>(({ theme, isSelectable, isDisabled, isSelected }) => ({
  [`& .${tableCellClasses.root}`]: {
    py: theme.spacing(1.5),
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  },

  transition: "all 0.2s",
  cursor: isSelectable && !isDisabled ? "pointer" : "default",

  ...(isSelected && {
    "&&": {
      backgroundColor: `${alpha(theme.palette.primary.main, 0.04)} !important`,
      "&:hover": {
        backgroundColor: `${alpha(theme.palette.primary.main, 0.06)} !important`,
      },
    },
  }),

  ...(!isSelected && {
    "&:hover": {
      backgroundColor: isDisabled
        ? "transparent"
        : alpha(theme.palette.primary.main, 0.02),
    },
  }),

  ...(isDisabled && {
    backgroundColor: `${alpha(theme.palette.action.disabledBackground, 0.5)} !important`,
    color: `${theme.palette.text.disabled} !important`,
    cursor: "not-allowed",
    "&:hover": {
      backgroundColor: `${alpha(theme.palette.action.disabledBackground, 0.5)} !important`,
    },
  }),
}));
