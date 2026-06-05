import { DataTableHeader } from "../../../table/types";

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

export const tableCellAlignToTextAlign = (
  align: TableCellAlign,
): "left" | "center" | "right" | undefined => {
  if (!align || align === "inherit" || align === "justify") return undefined;
  return align;
};
