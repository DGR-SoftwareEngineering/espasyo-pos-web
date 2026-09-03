import React, { useEffect, useMemo, useState } from "react";
import {
  Flex,
  Text,
} from "core-lib/components/radix/proxies";
import {
  useRouter } from "next/router"; import { Box,
  Button,
  Card,
  Grid,
} from "@radix-ui/themes";;
import { ReloadIcon } from "@radix-ui/react-icons";
import {
  NewReleasesOutlined,
  RepeatOutlined,
  StarOutlined,
  ScheduleOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import { useApi } from "core-lib/core/hooks";
import {
  CustomerAnalyticsDto,
  CustomerDto,
  CustomerSegment,
} from "core-lib/api/crm";
import { HeaderV2 } from "core-lib/components/radix/header/HeaderV2";
import { DialogBox } from "core-lib/components/radix/dialog/DialogBox";
import { CustomerList } from "../list/CustomerList";
import { SEGMENT_CONFIG } from "../constants";

const ICONS: Record<
  CustomerSegment,
  React.ReactElement
> = {
  [CustomerSegment.New]: <NewReleasesOutlined />,
  [CustomerSegment.Regular]: <RepeatOutlined />,
  [CustomerSegment.VIP]: <StarOutlined />,
  [CustomerSegment.Occasional]: <ScheduleOutlined />,
  [CustomerSegment.AtRisk]: <WarningAmberOutlined />,
};

const SEGMENT_NAME_KEYS: Record<string, CustomerSegment> = {
  New: CustomerSegment.New,
  Regular: CustomerSegment.Regular,
  VIP: CustomerSegment.VIP,
  Occasional: CustomerSegment.Occasional,
  AtRisk: CustomerSegment.AtRisk,
};

const segmentValueFromAnalytics = (
  distribution: Record<string, number> | undefined,
  segment: CustomerSegment,
): number => {
  if (!distribution) return 0;
  for (const [key, value] of Object.entries(distribution)) {
    if (SEGMENT_NAME_KEYS[key] === segment) return value;
  }
  return 0;
};

export const SegmentsBlock: React.FC = () => {
  const router = useRouter();

  const analyticsData = useApi((api) => api.crm.analytics(), []);
  const customersData = useApi(
    (api) => api.crm.list({ pageNumber: 1, pageSize: 100 }),
    [],
  );

  const [analytics, setAnalytics] = useState<CustomerAnalyticsDto | null>(null);
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [drilldown, setDrilldown] = useState<CustomerSegment | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    const r = analyticsData.result?.data?.response;
    if (r) setAnalytics(r);
  }, [analyticsData.result]);
  useEffect(() => {
    setCustomers(customersData.result?.data?.response?.items ?? []);
  }, [customersData.result]);

  const total = analytics?.totalCustomers ?? 0;

  const segmentList = useMemo(
    () =>
      [
        CustomerSegment.New,
        CustomerSegment.Regular,
        CustomerSegment.VIP,
        CustomerSegment.Occasional,
        CustomerSegment.AtRisk,
      ].map((seg) => {
        const cfg = SEGMENT_CONFIG[seg];
        const count = segmentValueFromAnalytics(
          analytics?.segmentDistribution,
          seg,
        );
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return { seg, cfg, count, pct };
      }),
    [analytics, total],
  );

  const filteredForDrilldown = useMemo(
    () =>
      drilldown == null
        ? []
        : customers.filter((c) => c.segment === drilldown),
    [customers, drilldown],
  );

  const PAGE_SIZE = 10;
  const paginated = filteredForDrilldown.slice(
    (pageNumber - 1) * PAGE_SIZE,
    pageNumber * PAGE_SIZE,
  );

  const pagination = {
    pageNumber,
    totalPages: Math.max(1, Math.ceil(filteredForDrilldown.length / PAGE_SIZE)),
    hasNextPage: pageNumber < Math.ceil(filteredForDrilldown.length / PAGE_SIZE),
    hasPreviousPage: pageNumber > 1,
    pageSize: PAGE_SIZE,
  };

  const handleRefresh = () => {
    analyticsData.execute();
    customersData.execute();
  };

  return (
    <Box>
      <Card variant="surface" size="3" mb="4">
        <Flex justify="between" align="center" wrap="wrap" gap="3">
          <HeaderV2
            title="Customer Segments"
            subtitle="Groups are auto-recomputed by the backend on every sale"
          />
          <Button
            variant="soft"
            color="gray"
            size="2"
            onClick={handleRefresh}
            disabled={analyticsData.loading || customersData.loading}
          >
            <ReloadIcon /> Refresh
          </Button>
        </Flex>
      </Card>

      <Grid columns={{ initial: "1", sm: "2", md: "3", lg: "5" }} gap="3">
        {segmentList.map(({ seg, cfg, count, pct }) => (
          <Card
            key={seg}
            variant="surface"
            size="3"
            style={{
              cursor: "pointer",
              transition: "transform 0.15s, box-shadow 0.15s",
              borderColor: `var(--${cfg.color}-a5)`,
              background: `linear-gradient(135deg, var(--${cfg.color}-a3), var(--color-background))`,
            }}
            onClick={() => {
              setDrilldown(seg);
              setPageNumber(1);
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-3)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <Flex direction="column" gap="2">
              <Flex align="center" gap="2">
                <Box
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `var(--${cfg.color}-a4)`,
                    color: `var(--${cfg.color}-11)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {ICONS[seg]}
                </Box>
                <Text size="3" weight="bold">
                  {cfg.label}
                </Text>
              </Flex>
              <Flex align="baseline" gap="2">
                <Text size="6" weight="bold">
                  {count}
                </Text>
                <Text size="1" color="gray">
                  {pct}% of total
                </Text>
              </Flex>
              <Text size="1" color="gray">
                {cfg.description}
              </Text>
              <Box
                mt="2"
                style={{
                  height: 6,
                  borderRadius: 999,
                  background: "var(--gray-a3)",
                  overflow: "hidden",
                }}
              >
                <Box
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: `var(--${cfg.color}-9)`,
                  }}
                />
              </Box>
            </Flex>
          </Card>
        ))}
      </Grid>

      <DialogBox
        open={drilldown != null}
        onClose={() => setDrilldown(null)}
        title={
          drilldown != null
            ? `${SEGMENT_CONFIG[drilldown].label} — ${filteredForDrilldown.length} customer(s)`
            : ""
        }
        maxWidth="lg"
      >
        <Box p="3">
          <CustomerList
            data={paginated}
            loading={customersData.loading}
            pagination={pagination}
            onNextPage={() => setPageNumber((p) => p + 1)}
            onPreviousPage={() => setPageNumber((p) => p - 1)}
            onView={(c) => router.push(`/admin/hub/crm/customers/${c.customerID}`)}
            onEdit={(c) => router.push(`/admin/hub/crm/customers/${c.customerID}`)}
            onDelete={() => undefined}
          />
        </Box>
      </DialogBox>
    </Box>
  );
};
