import React from "react";
import {
  Flex,
  IconButton,
  Select,
  Table,
  Text,
} from "@radix-ui/themes";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";

interface DataTablePaginatedFooterProps {
  tableHeadersLength: number;
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    defaultPageSize: number;
  };
  rowsPerPageOptions?: Array<number | { value: number; label: string }>;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
}

const DEFAULT_ROWS_PER_PAGE = [10, 25, 50, 100];

export const DataTablePaginatedFooter: React.FC<
  DataTablePaginatedFooterProps
> = ({
  tableHeadersLength,
  pagination,
  rowsPerPageOptions = DEFAULT_ROWS_PER_PAGE,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const pageNumber = pagination.pageNumber || 1;
  const pageSize = pagination.pageSize || pagination.defaultPageSize;
  const totalCount = pagination.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange({}, page);
  };

  const handleRowsPerPageChange = (value: string) => {
    if (!onRowsPerPageChange) return;
    const synthetic = {
      target: { value },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onRowsPerPageChange(synthetic);
  };

  const fromRow = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const toRow = Math.min(pageNumber * pageSize, totalCount);

  return (
    <tfoot>
      <Table.Row>
        <Table.Cell
          colSpan={tableHeadersLength}
          style={{
            padding: "12px 16px",
            background: "var(--gray-a2)",
            borderTop: "1px solid var(--gray-a4)",
          }}
        >
          <Flex
            align="center"
            justify="between"
            gap="4"
            wrap="wrap"
            data-testid="data-table-pagination"
          >
            <Flex align="center" gap="2">
              <Text size="2" color="gray">
                Rows per page:
              </Text>
              <Select.Root
                size="2"
                value={String(pageSize)}
                onValueChange={handleRowsPerPageChange}
              >
                <Select.Trigger />
                <Select.Content>
                  {rowsPerPageOptions.map((opt) => {
                    const value = typeof opt === "number" ? opt : opt.value;
                    const label = typeof opt === "number" ? String(opt) : opt.label;
                    return (
                      <Select.Item key={value} value={String(value)}>
                        {label}
                      </Select.Item>
                    );
                  })}
                </Select.Content>
              </Select.Root>
            </Flex>

            <Text size="2" color="gray">
              {fromRow}–{toRow} of {totalCount} · Page {pageNumber} of {totalPages}
            </Text>

            <Flex gap="1">
              <IconButton
                variant="soft"
                color="gray"
                size="2"
                aria-label="First page"
                disabled={pageNumber <= 1}
                onClick={() => goToPage(1)}
              >
                <DoubleArrowLeftIcon />
              </IconButton>
              <IconButton
                variant="soft"
                color="gray"
                size="2"
                aria-label="Previous page"
                disabled={pageNumber <= 1}
                onClick={() => goToPage(pageNumber - 1)}
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                variant="soft"
                color="gray"
                size="2"
                aria-label="Next page"
                disabled={pageNumber >= totalPages}
                onClick={() => goToPage(pageNumber + 1)}
              >
                <ChevronRightIcon />
              </IconButton>
              <IconButton
                variant="soft"
                color="gray"
                size="2"
                aria-label="Last page"
                disabled={pageNumber >= totalPages}
                onClick={() => goToPage(totalPages)}
              >
                <DoubleArrowRightIcon />
              </IconButton>
            </Flex>
          </Flex>
        </Table.Cell>
      </Table.Row>
    </tfoot>
  );
};
