import { SxProps, TableCellProps, Theme } from "@mui/material";

type Align = "left" | "center" | "right" | "justify" | "inherit";

type CellItem = {
  name: string;
  align?: Align;
  bold?: boolean;
};

export interface TableData {
  tableHeaders: CellItem[];
  items: string[][];
}

export interface SortByValue {
  id: string;
  desc?: boolean;
}

export interface FilterLabel {
  id: string;
  label: string;
}

export interface PaginatedTableParams {
  ascending: boolean;
  propertyName: string;
  pageNumber: number;
  pageSize: number;
}

export interface DataTableHeader extends TableCellProps {
  name: string;
  dataField?: string;
  sort?: {
    sorted: boolean;
    ascending: boolean;
    onClick: () => void;
  };
}

export interface DataTableSx {
  tableHead?: SxProps<Theme>;
  headerCell?: {
    cell?: SxProps<Theme>;
    typography?: SxProps<Theme>;
  };
  bodyCell?: {
    cell?: SxProps<Theme>;
  };
}
