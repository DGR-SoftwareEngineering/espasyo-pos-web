import { DataTableHeader } from "../types";

type TableCellAlign = DataTableHeader["align"];

const alignToJustify: Record<
  NonNullable<DataTableHeader["align"]>,
  "flex-start" | "center" | "flex-end"
> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
  inherit: "flex-start",
  justify: "flex-start",
};

export const tableCellAlignToJustifyContent = (align: TableCellAlign) => {
  if (!align) return "flex-start";
  return alignToJustify[align];
};
