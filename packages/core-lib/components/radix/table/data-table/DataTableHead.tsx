import React, { useState } from "react";
import { Table, Text, Flex } from "@radix-ui/themes";
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons";
import { DataTableHeader, DataTableSx } from "../../../table/types";

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
  loading,
  isEmpty,
  sortColumn,
  sortAscending,
  onSort,
  evenColumnWidth,
}) => {
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

  return (
    <Table.Header>
      <Table.Row
        style={{
          background: "var(--accent-9)",
          color: "var(--accent-contrast)",
        }}
      >
        {tableHeaders.map((header, idx) => {
          const isCurrentSortColumn = sortColumn === header.name;
          const isHovered = hoveredColumn === header.name;
          const isSortable = !!header.sort && !!onSort && !loading && !isEmpty;
          const widthValue =
            typeof header.width === "number"
              ? `${header.width}px`
              : header.width || (evenColumnWidth ? `${evenColumnWidth}%` : undefined);

          return (
            <Table.ColumnHeaderCell
              key={idx}
              data-testid={`data-table-header-${header.name}`}
              align={header.align as "left" | "center" | "right" | undefined}
              style={{
                background: "var(--accent-9)",
                color: "var(--accent-contrast)",
                padding: "16px 12px",
                fontWeight: 600,
                cursor: isSortable ? "pointer" : undefined,
                width: widthValue,
                verticalAlign: "middle",
              }}
              onClick={isSortable ? () => onSort?.(header.name) : undefined}
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
            >
              <Flex
                align="center"
                gap="1"
                justify={header.align === "center" ? "center" : header.align === "right" ? "end" : "start"}
              >
                <Text size="2" weight="bold" style={{ color: "inherit" }}>
                  {header.name}
                </Text>
                {isSortable && (isCurrentSortColumn || isHovered) && (
                  <Flex align="center" style={{ opacity: isCurrentSortColumn ? 1 : 0.5 }}>
                    {isCurrentSortColumn && !sortAscending ? (
                      <ArrowDownIcon />
                    ) : (
                      <ArrowUpIcon />
                    )}
                  </Flex>
                )}
              </Flex>
            </Table.ColumnHeaderCell>
          );
        })}
      </Table.Row>
    </Table.Header>
  );
};
