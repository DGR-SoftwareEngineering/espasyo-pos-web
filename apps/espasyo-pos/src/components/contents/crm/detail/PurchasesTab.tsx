import React, { useEffect, useState } from "react";
import { Badge, Box, Card, Flex, Text } from "@radix-ui/themes";
import { ReceiptLongOutlined } from "@mui/icons-material";
import { useApiCallback } from "core-lib/core/hooks";
import { DataTableV2 } from "core-lib/components/radix/table/DataTableV2";
import { BaseTableRow } from "core-lib/components/radix/table/BaseTableRow";
import { SaleDto } from "core-lib/api/commons/types";
import { formatCurrency } from "core-lib/business/strings";
import { PURCHASES_TABLE_HEADERS } from "../constants";
import { formatDateTime } from "../format";

interface PurchasesTabProps {
  customerId: string;
}

const PAGE_SIZE = 10;

const SaleRow: React.FC<{ row: SaleDto }> = ({ row }) => {
  const statusColor: "green" | "gray" | "red" =
    row.statusName === "Voided"
      ? "red"
      : row.refundedAmount > 0
        ? "gray"
        : "green";
  const columns = [
    {
      id: "saleNumber",
      width: "20%",
      render: () => (
        <Badge color="indigo" variant="soft" size="1">
          {row.saleNumber}
        </Badge>
      ),
    },
    {
      id: "completedAt",
      width: "24%",
      render: () => (
        <Text size="2" color="gray">
          {formatDateTime(row.completedAt)}
        </Text>
      ),
    },
    {
      id: "itemCount",
      align: "center" as const,
      width: "12%",
      render: () => (
        <Text size="2" weight="medium">
          {row.itemCount}
        </Text>
      ),
    },
    {
      id: "totalAmount",
      align: "right" as const,
      width: "16%",
      render: () => (
        <Text size="2" weight="medium">
          {formatCurrency(row.totalAmount)}
        </Text>
      ),
    },
    {
      id: "status",
      align: "center" as const,
      width: "14%",
      render: () => (
        <Badge color={statusColor} variant="soft" size="1">
          {row.statusName ?? "—"}
        </Badge>
      ),
    },
    {
      id: "actions",
      align: "right" as const,
      width: "14%",
      render: () => null,
    },
  ];
  return <BaseTableRow data={row} rowKey={row.saleID} columns={columns} />;
};

export const PurchasesTab: React.FC<PurchasesTabProps> = ({ customerId }) => {
  const [sales, setSales] = useState<SaleDto[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const purchasesCb = useApiCallback(
    async (api, params: { id: string; page: number }) =>
      api.crm.getPurchases(params.id, {
        pageNumber: params.page,
        pageSize: PAGE_SIZE,
      }),
  );

  const load = async (page: number) => {
    setLoading(true);
    try {
      const result = await purchasesCb.execute({ id: customerId, page });
      const data = result?.data?.response;
      setSales(data?.items ?? []);
      setTotalPages(Math.max(1, data?.totalPages ?? 1));
      setPageNumber(data?.pageNumber ?? page);
    } catch {
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const pagination = {
    pageNumber,
    totalPages,
    hasNextPage: pageNumber < totalPages,
    hasPreviousPage: pageNumber > 1,
    pageSize: PAGE_SIZE,
  };

  return (
    <Card variant="surface" size="3">
      <Flex align="center" gap="2" mb="3">
        <ReceiptLongOutlined style={{ fontSize: 18, color: "var(--blue-11)" }} />
        <Text size="3" weight="bold">
          Purchase History
        </Text>
      </Flex>

      {sales.length === 0 && !loading ? (
        <Box style={{ padding: 32, textAlign: "center" }}>
          <Text size="2" color="gray">
            No purchases on record yet. Once this customer is attached to a sale, the
            transaction will appear here.
          </Text>
        </Box>
      ) : (
        <DataTableV2
          data={sales}
          loading={loading}
          tableHeaders={PURCHASES_TABLE_HEADERS}
          pagination={pagination}
          onNextPage={() => load(pageNumber + 1)}
          onPreviousPage={() => load(pageNumber - 1)}
          bodyRowComponent={(row) => <SaleRow key={row.saleID} row={row} />}
        />
      )}
    </Card>
  );
};
