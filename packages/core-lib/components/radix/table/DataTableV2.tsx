import React, { ReactElement } from "react";
import { Table, Flex, IconButton, Text, Box } from "@radix-ui/themes";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import { PaginationData } from "../../../api/types";
import { cn } from "../_utils";

export interface DataTableHeader {
  name: string;
  align?: "left" | "center" | "right";
  width?: string | number;
  sort?: {
    sorted: boolean;
    ascending: boolean;
    onClick: () => void;
  };
}

export interface DataTableSx {
  tableHead?: React.CSSProperties;
  headerCell?: React.CSSProperties;
  bodyCell?: React.CSSProperties;
}

interface Props<T> {
  "data-testid"?: string;
  id?: string;
  data: T[];
  className?: string;
  sx?: DataTableSx;
  loading?: boolean;
  tableHeaders: DataTableHeader[];
  pagination?: Partial<PaginationData>;
  onNextPage?(): void;
  onPreviousPage?(): void;
  bodyRowComponent(data: T, key: number): ReactElement;
}

export const DataTableV2 = <T,>({
  id,
  className,
  sx,
  data,
  loading,
  pagination,
  tableHeaders,
  onNextPage,
  onPreviousPage,
  bodyRowComponent,
  ...rest
}: Props<T>) => {
  return (
    <Box id={id} className={cn(className)}>
      <Table.Root variant="surface" data-testid={rest["data-testid"]}>
        <Table.Header style={sx?.tableHead}>
          <Table.Row>
            {tableHeaders.map((header, idx) => (
              <Table.ColumnHeaderCell
                key={`${header.name}-${idx}`}
                style={{
                  width: header.width,
                  textAlign: header.align,
                  ...sx?.headerCell,
                }}
              >
                <Flex
                  align="center"
                  gap="2"
                  justify={
                    header.align === "right"
                      ? "end"
                      : header.align === "center"
                        ? "center"
                        : "start"
                  }
                >
                  <Flex
                    align="center"
                    gap="1"
                    onClick={header.sort?.onClick}
                    style={{
                      cursor: header.sort ? "pointer" : undefined,
                    }}
                  >
                    {header.sort?.sorted && (
                      <ChevronDownIcon
                        data-testid={`data-table-sort-by-${header.name}`}
                        style={{
                          transition: "transform 0.2s ease-in-out",
                          transform: header.sort.ascending
                            ? "rotate(180deg)"
                            : undefined,
                        }}
                      />
                    )}
                    <Text size="1" weight="bold" style={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {header.name}
                    </Text>
                  </Flex>

                  {idx === tableHeaders.length - 1 &&
                    !!pagination?.totalPages && (
                      <Flex
                        flexGrow="1"
                        justify="end"
                        align="center"
                        gap="2"
                        data-testid="data-table-pagination"
                      >
                        <Text size="2" style={{ marginRight: 8 }}>
                          {pagination.pageNumber} of {pagination.totalPages}
                        </Text>
                        <IconButton
                          size="1"
                          variant="soft"
                          color="indigo"
                          disabled={!pagination.hasPreviousPage}
                          onClick={onPreviousPage}
                          aria-label="Previous page"
                        >
                          <ChevronLeftIcon />
                        </IconButton>
                        <IconButton
                          size="1"
                          variant="soft"
                          color="indigo"
                          disabled={!pagination.hasNextPage}
                          onClick={onNextPage}
                          aria-label="Next page"
                        >
                          <ChevronRightIcon />
                        </IconButton>
                      </Flex>
                    )}
                </Flex>
              </Table.ColumnHeaderCell>
            ))}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading ? (
            <Table.Row>
              <Table.Cell
                colSpan={tableHeaders.length}
                style={{ textAlign: "center", padding: 24 }}
              >
                <Text size="2" color="gray">
                  Loading…
                </Text>
              </Table.Cell>
            </Table.Row>
          ) : data.length === 0 ? (
            <Table.Row>
              <Table.Cell
                colSpan={tableHeaders.length}
                style={{ textAlign: "center", padding: 24 }}
              >
                <Text size="2" color="gray">
                  No rows to display
                </Text>
              </Table.Cell>
            </Table.Row>
          ) : (
            data.map((row, idx) => bodyRowComponent(row, idx))
          )}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};
