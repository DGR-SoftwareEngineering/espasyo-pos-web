import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Badge, Box, Button, Card, Flex, Text } from "@radix-ui/themes";
import { ReloadIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { LocalCafeOutlined, EmojiEventsOutlined } from "@mui/icons-material";
import { useApi } from "core-lib/core/hooks";
import { CustomerDto } from "core-lib/api/crm";
import { HeaderV2 } from "core-lib/components/radix/header/HeaderV2";
import { StatsCard } from "core-lib/components/radix/StatsCard";
import { DataTableV2 } from "core-lib/components/radix/table/DataTableV2";
import { BaseTableRow } from "core-lib/components/radix/table/BaseTableRow";
import { SegmentBadge } from "../components/SegmentBadge";
import { formatRelativeDate } from "../format";

const HEADERS = [
  { id: "customer", name: "Customer", width: "30%", sortable: false, align: "left" as const },
  { id: "segment", name: "Segment", width: "15%", sortable: false, align: "center" as const },
  { id: "stamps", name: "Stamps", width: "15%", sortable: false, align: "center" as const },
  { id: "rewards", name: "Rewards", width: "15%", sortable: false, align: "center" as const },
  { id: "lastStampedAt", name: "Last Stamp", width: "20%", sortable: false, align: "left" as const },
  { id: "actions", name: "", width: "5%", sortable: false, align: "right" as const },
];

const PAGE_SIZE = 15;

export const LoyaltyOverviewBlock: React.FC = () => {
  const router = useRouter();
  const customersData = useApi(
    (api) => api.crm.list({ pageNumber: 1, pageSize: 100, sortBy: "spend" }),
    [],
  );
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setCustomers(customersData.result?.data?.response?.items ?? []);
  }, [customersData.result]);

  const sorted = useMemo(
    () =>
      [...customers].sort(
        (a, b) => (b.loyaltyStamps ?? 0) - (a.loyaltyStamps ?? 0),
      ),
    [customers],
  );

  const stats = useMemo(() => {
    let activeRewards = 0;
    let nearReward = 0;
    let withCards = 0;
    sorted.forEach((c) => {
      if ((c.loyaltyStamps ?? 0) > 0) withCards += 1;
      const inCycle = (c.loyaltyStamps ?? 0) % 6;
      const stampsToNext = inCycle === 0 && (c.loyaltyStamps ?? 0) > 0 ? 0 : 6 - inCycle;
      if (stampsToNext === 0 && c.loyaltyStamps > 0) activeRewards += 1;
      if (stampsToNext > 0 && stampsToNext <= 2) nearReward += 1;
    });
    return { withCards, activeRewards, nearReward };
  }, [sorted]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pagination = {
    pageNumber: page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    pageSize: PAGE_SIZE,
  };

  return (
    <Box>
      <Card variant="surface" size="3" mb="4">
        <Flex justify="between" align="center" gap="3" wrap="wrap">
          <HeaderV2
            title="Loyalty Overview"
            subtitle="Stamp progress and rewards across all customers"
          />
          <Button
            variant="soft"
            color="gray"
            size="2"
            onClick={() => customersData.execute()}
            disabled={customersData.loading}
          >
            <ReloadIcon /> Refresh
          </Button>
        </Flex>

        <Flex gap="3" mt="4" wrap="wrap">
          <StatsCard label="Loyalty Cards" value={stats.withCards} color="primary" />
          <StatsCard label="Rewards Ready" value={stats.activeRewards} color="warning" />
          <StatsCard label="Almost There" value={stats.nearReward} color="info" />
        </Flex>
      </Card>

      <Card variant="surface" size="2" style={{ overflow: "hidden" }}>
        <DataTableV2
          data={paginated}
          loading={customersData.loading}
          tableHeaders={HEADERS}
          pagination={pagination}
          onNextPage={() => setPage((p) => p + 1)}
          onPreviousPage={() => setPage((p) => p - 1)}
          bodyRowComponent={(row: CustomerDto) => {
            const inCycle = (row.loyaltyStamps ?? 0) % 6;
            const stampsToNext = inCycle === 0 && (row.loyaltyStamps ?? 0) > 0 ? 0 : 6 - inCycle;
            const rewardReady = stampsToNext === 0 && row.loyaltyStamps > 0;
            const columns = [
              {
                id: "customer",
                width: "30%",
                render: () => (
                  <Flex direction="column">
                    <Text size="2" weight="medium">{row.fullName}</Text>
                    <Text size="1" color="gray">{row.customerNumber}</Text>
                  </Flex>
                ),
              },
              {
                id: "segment",
                align: "center" as const,
                width: "15%",
                render: () => <SegmentBadge segment={row.segment} />,
              },
              {
                id: "stamps",
                align: "center" as const,
                width: "15%",
                render: () => (
                  <Flex align="center" gap="1" justify="center">
                    <LocalCafeOutlined style={{ fontSize: 14, color: "var(--brown-11, #4A2F1E)" }} />
                    <Text size="2" weight="medium">{row.loyaltyStamps}</Text>
                  </Flex>
                ),
              },
              {
                id: "rewards",
                align: "center" as const,
                width: "15%",
                render: () =>
                  rewardReady ? (
                    <Badge color="amber" variant="solid" size="1" style={{ gap: 4 }}>
                      <EmojiEventsOutlined style={{ fontSize: 12 }} />
                      Ready
                    </Badge>
                  ) : (
                    <Text size="1" color="gray">
                      {stampsToNext} to go
                    </Text>
                  ),
              },
              {
                id: "lastStampedAt",
                width: "20%",
                render: () => (
                  <Text size="2" color="gray">
                    {formatRelativeDate(row.lastVisitAt)}
                  </Text>
                ),
              },
              {
                id: "actions",
                align: "right" as const,
                width: "5%",
                render: () => (
                  <Button
                    size="1"
                    variant="ghost"
                    onClick={() => router.push(`/admin/hub/crm/customers/${row.customerID}`)}
                  >
                    <ChevronRightIcon />
                  </Button>
                ),
              },
            ];
            return <BaseTableRow key={row.customerID} data={row} rowKey={row.customerID} columns={columns} />;
          }}
        />
      </Card>
    </Box>
  );
};
