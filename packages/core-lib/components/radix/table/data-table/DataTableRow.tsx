import React from "react";
import { Box, Flex, RadioGroup, Table, Text } from "@radix-ui/themes";
import { caseInsensitiveEquals } from "../../../../business/strings";
import { tableCellAlignToJustifyContent } from "./utils";

export interface DataTableColumn<T> {
  dataField: string;
  align?: "left" | "center" | "right" | "justify" | "inherit";
  width?: string | number;
  parseValue?: (row: T) => React.ReactNode;
  originalValue?: (row: T) => unknown;
  actionButton?: {
    customActionKey?: string;
  } & Record<string, unknown>;
}

export interface ActionColumnProps {
  column?: string | null;
  status?: string | null;
}

interface DataTableRowProps<T> {
  data: T;
  rowKey: number;
  tableColumns: DataTableColumn<T>[];
  isRowSelectable?: boolean;
  selectedRowIndex?: number;
  onRowSelect?: (index: number) => void;
  evenColumnWidth?: number;
  id?: string;
  actionColumn?: ActionColumnProps;
  renderActionButton?: (
    actionButton: NonNullable<DataTableColumn<T>["actionButton"]>,
    row: T,
    disabled: boolean,
  ) => React.ReactNode;
}

export const DataTableRow = <T,>({
  data,
  rowKey,
  tableColumns,
  isRowSelectable,
  selectedRowIndex,
  onRowSelect,
  evenColumnWidth,
  actionColumn,
  renderActionButton,
}: DataTableRowProps<T>) => {
  const isSelected = rowKey === selectedRowIndex;
  const isRowDisabled = actionColumn?.column
    ? tableColumns.some((column) => {
        const original = column.originalValue?.(data);
        return (
          caseInsensitiveEquals(actionColumn.column ?? "", column.dataField) &&
          !caseInsensitiveEquals(actionColumn.status ?? "", String(original ?? ""))
        );
      })
    : false;

  const handleRowSelect = (index: number) => {
    if (!isRowSelectable || isRowDisabled) return;
    onRowSelect?.(index);
  };

  return (
    <Table.Row
      data-testid={`data-table-row-${rowKey}`}
      onClick={() => handleRowSelect(rowKey)}
      style={{
        cursor: isRowSelectable && !isSelected ? "pointer" : undefined,
        background: isSelected
          ? "var(--accent-a3)"
          : rowKey % 2 === 1
            ? "var(--gray-a2)"
            : undefined,
        opacity: isRowDisabled ? 0.5 : 1,
      }}
      {...(isRowSelectable && {
        role: "row",
        "aria-selected": isSelected,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            handleRowSelect(rowKey);
            e.preventDefault();
          }
        },
      })}
    >
      {tableColumns.map((column, idx) => {
        const widthValue =
          typeof column.width === "number"
            ? `${column.width}px`
            : column.width ||
              (evenColumnWidth ? `${evenColumnWidth}%` : undefined);

        return (
          <Table.Cell
            key={idx}
            align={
              column.align === "left" ||
              column.align === "center" ||
              column.align === "right"
                ? column.align
                : undefined
            }
            style={{ width: widthValue, verticalAlign: "middle" }}
          >
            <Flex
              align="center"
              justify={
                tableCellAlignToJustifyContent(column.align) === "center"
                  ? "center"
                  : tableCellAlignToJustifyContent(column.align) === "flex-end"
                    ? "end"
                    : "start"
              }
              gap="2"
            >
              {column.actionButton && renderActionButton ? (
                renderActionButton(column.actionButton, data, isRowDisabled)
              ) : (
                <>
                  {idx === 0 && isRowSelectable && (
                    <RadioGroup.Root
                      value={isSelected ? String(rowKey) : ""}
                      onValueChange={() => handleRowSelect(rowKey)}
                    >
                      <RadioGroup.Item
                        value={String(rowKey)}
                        aria-label={`Select row ${rowKey}`}
                        data-testid={`data-table-row-${rowKey}-select`}
                        disabled={isRowDisabled}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </RadioGroup.Root>
                  )}
                  <Box>
                    <Text size="2">{column.parseValue?.(data)}</Text>
                  </Box>
                </>
              )}
            </Flex>
          </Table.Cell>
        );
      })}
    </Table.Row>
  );
};
