import React, { useEffect, useMemo, useState } from "react";
import { Badge, Box, Card, Flex, Text } from "@radix-ui/themes";
import { LocalCafeOutlined } from "@mui/icons-material";
import { useApiCallback } from "core-lib/core/hooks";
import { LoyaltyStampEventDto } from "core-lib/api/crm";
import { DataTableV2 } from "core-lib/components/radix/table/DataTableV2";
import { BaseTableRow } from "core-lib/components/radix/table/BaseTableRow";
import { formatRelativeDate } from "../format";

const HEADERS = [
  { id: "date", name: "Date", width: "25%", sortable: false, align: "left" as const },
  { id: "source", name: "Source", width: "15%", sortable: false, align: "center" as const },
  { id: "reason", name: "Reason", width: "40%", sortable: false, align: "left" as const },
  { id: "sale", name: "Sale", width: "20%", sortable: false, align: "left" as const },
];

const PAGE_SIZE = 10;

interface StampHistorySectionProps {
  customerId: string;
  refreshKey?: number;
}

export const StampHistorySection: React.FC<StampHistorySectionProps> = ({
  customerId,
  refreshKey = 0,
}) => {
  const stampsCb = useApiCallback(
    async (api, args: { id: string; pageNumber: number; pageSize: number }) =>
      api.crm.getStamps(args.id, {
        pageNumber: args.pageNumber,
        pageSize: args.pageSize,
      }),
  );

  const [pageNumber, setPageNumber] = useState(1);

  // Re-fetch whenever customerId or refreshKey changes
  useEffect(() => {
    stampsCb.execute({
      id: customerId,
      pageNumber,
      pageSize: PAGE_SIZE,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, refreshKey, pageNumber]);

  const stamps = useMemo(
    () => stampsCb.result?.data?.response?.items ?? [],
    [stampsCb.result],
  );

  const pagination = useMemo(() => {
    const totalPages =
      stampsCb.result?.data?.response?.totalPages ?? 1;
    return {
      pageNumber,
      totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1,
      pageSize: PAGE_SIZE,
    };
  }, [pageNumber, stampsCb.result?.data?.response?.totalPages]);

  return (
    <Card variant="surface" size="3">
      <Flex align="center" gap="2" mb="3">
        <LocalCafeOutlined style={{ fontSize: 18, color: "var(--brown-11, #4A2F1E)" }} />
        <Text size="3" weight="bold">
          Stamp History
        </Text>
      </Flex>

      {stamps.length === 0 && !stampsCb.loading ? (
        <Box style={{ padding: 16, textAlign: "center", opacity: 0.6 }}>
          <Text size="2" color="gray">
            No stamp history yet.
          </Text>
        </Box>
      ) : (
        <DataTableV2
          data={stamps}
          loading={stampsCb.loading}
          tableHeaders={HEADERS}
          pagination={pagination}
          onNextPage={() => setPageNumber((p) => p + 1)}
          onPreviousPage={() => setPageNumber((p) => p - 1)}
          bodyRowComponent={(row: LoyaltyStampEventDto) => {
            const columns = [
              {
                id: "date",
                width: "25%",
                render: () => (
                  <Text size="2" title={row.createdAt ?? ""}>
                    {formatRelativeDate(row.createdAt)}
                  </Text>
                ),
              },
              {
                id: "source",
                align: "center" as const,
                width: "15%",
                render: () => (
                  <Badge
                    color={row.sourceName === "Manual" ? "amber" : "indigo"}
                    variant="soft"
                    size="1"
                  >
                    {row.sourceName}
                  </Badge>
                ),
              },
              {
                id: "reason",
                width: "40%",
                render: () => (
                  <Text size="2" color={row.reason ? undefined : "gray"}>
                    {row.reason ?? "—"}
                  </Text>
                ),
              },
              {
                id: "sale",
                width: "20%",
                render: () => (
                  <Text size="2" color={row.saleID ? undefined : "gray"}>
                    {row.saleID
                      ? row.saleID.substring(0, 8) + "…"
                      : "—"}
                  </Text>
                ),
              },
            ];
            return (
              <BaseTableRow
                key={row.loyaltyStampEventID}
                data={row}
                rowKey={row.loyaltyStampEventID}
                columns={columns}
              />
            );
          }}
        />
      )}
    </Card>
  );
};
