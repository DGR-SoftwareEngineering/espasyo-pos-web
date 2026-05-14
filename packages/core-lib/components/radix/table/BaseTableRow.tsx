import React from "react";
import { Table, Checkbox, RadioGroup, Flex } from "@radix-ui/themes";

export interface BaseTableColumn<T> {
  id: string;
  label?: string;
  align?: "left" | "center" | "right";
  width?: string | number;
  render: (data: T) => React.ReactNode;
}

export interface BaseTableRowProps<T> {
  data: T;
  rowKey: number | string;
  columns: BaseTableColumn<T>[];
  isSelectable?: boolean;
  selectedRowKey?: number | string;
  onSelect?: (rowKey: number | string) => void;
  isDisabled?: boolean;
  onRowClick?: (data: T) => void;
  selectInput?: "radio" | "checkbox";
  className?: string;
  style?: React.CSSProperties;
}

export function BaseTableRow<T>({
  data,
  rowKey,
  columns,
  isSelectable,
  selectedRowKey,
  onSelect,
  isDisabled,
  onRowClick,
  selectInput = "checkbox",
  className,
  style,
}: BaseTableRowProps<T>) {
  const isSelected = selectedRowKey === rowKey;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isDisabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onRowClick?.(data);
      if (isSelectable) onSelect?.(rowKey);
    }
  };

  return (
    <Table.Row
      className={className}
      onClick={() => {
        if (isDisabled) return;
        onRowClick?.(data);
      }}
      onKeyDown={handleKeyDown}
      tabIndex={onRowClick || isSelectable ? 0 : -1}
      style={{
        cursor: onRowClick || isSelectable ? "pointer" : undefined,
        opacity: isDisabled ? 0.5 : 1,
        background: isSelected ? "var(--accent-a3)" : undefined,
        ...style,
      }}
      data-state={isSelected ? "selected" : undefined}
    >
      {isSelectable && (
        <Table.Cell width="40px">
          {selectInput === "radio" ? (
            <RadioGroup.Root
              value={isSelected ? String(rowKey) : ""}
              onValueChange={() => onSelect?.(rowKey)}
            >
              <Flex>
                <RadioGroup.Item
                  value={String(rowKey)}
                  disabled={isDisabled}
                  aria-label={`Select row ${rowKey}`}
                />
              </Flex>
            </RadioGroup.Root>
          ) : (
            <Checkbox
              checked={isSelected}
              disabled={isDisabled}
              onCheckedChange={() => onSelect?.(rowKey)}
              aria-label={`Select row ${rowKey}`}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </Table.Cell>
      )}

      {columns.map((column) => (
        <Table.Cell
          key={column.id}
          style={{
            width: column.width,
            textAlign: column.align,
            verticalAlign: "middle",
          }}
        >
          {column.render(data)}
        </Table.Cell>
      ))}
    </Table.Row>
  );
}
