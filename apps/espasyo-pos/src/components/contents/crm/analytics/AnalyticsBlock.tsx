import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
} from "core-lib/components/radix/proxies";
import {
  useRouter } from "next/router"; import { Badge,
  Button,
  Card,
  Grid,
} from "@radix-ui/themes";;
import { ReloadIcon } from "@radix-ui/react-icons";
import {
  AttachMoneyOutlined,
  PeopleAltOutlined,
  PersonAddAlt1Outlined,
  AutoGraphOutlined,
} from "@mui/icons-material";
import { useApi } from "core-lib/core/hooks";
import { CustomerAnalyticsDto, TopCustomerDto } from "core-lib/api/crm";
import { HeaderV2 } from "core-lib/components/radix/header/HeaderV2";
import { formatCurrency } from "core-lib/business/strings";
import { SegmentDistributionChart } from "./SegmentDistributionChart";

interface TopListProps {
  title: string;
  rows: TopCustomerDto[];
  valueAccessor: (r: TopCustomerDto) => string;
  valueLabel: string;
  emptyText: string;
  onSelect: (r: TopCustomerDto) => void;
}

const TopList: React.FC<TopListProps> = ({
  title,
  rows,
  valueAccessor,
  valueLabel,
  emptyText,
  onSelect,
}) => (
  <Card variant="surface" size="3">
    <Flex justify="between" align="center" mb="3">
      <Text size="3" weight="bold">{title}</Text>
      <Badge size="1" color="gray" variant="soft">{rows.length}</Badge>
    </Flex>
    {rows.length === 0 ? (
      <Box style={{ padding: 16, textAlign: "center" }}>
        <Text size="2" color="gray">{emptyText}</Text>
      </Box>
    ) : (
      <Flex direction="column" gap="1">
        {rows.map((r, idx) => (
          <button
            key={r.customerID}
            type="button"
            onClick={() => onSelect(r)}
            style={{
              border: "none",
              background: "transparent",
              borderRadius: 8,
              padding: "8px 10px",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--accent-a2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <Flex justify="between" align="center" gap="3">
              <Flex align="center" gap="3" style={{ minWidth: 0 }}>
                <Box
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: idx < 3 ? "var(--amber-a4)" : "var(--gray-a3)",
                    color: idx < 3 ? "var(--amber-11)" : "var(--gray-11)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </Box>
                <Flex direction="column" style={{ minWidth: 0 }}>
                  <Text size="2" weight="medium" truncate>
                    {r.fullName}
                  </Text>
                  <Text size="1" color="gray" truncate>
                    {r.customerNumber}
                  </Text>
                </Flex>
              </Flex>
              <Flex direction="column" align="end" style={{ flexShrink: 0 }}>
                <Text size="2" weight="bold">
                  {valueAccessor(r)}
                </Text>
                <Text size="1" color="gray">
                  {valueLabel}
                </Text>
              </Flex>
            </Flex>
          </button>
        ))}
      </Flex>
    )}
  </Card>
);

const Kpi: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
}> = ({ label, value, icon, color }) => (
  <Card variant="surface" size="3">
    <Flex direction="column" gap="2">
      <Flex align="center" gap="2">
        <Box
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: color ? `var(--${color}-a4)` : "var(--gray-a3)",
            color: color ? `var(--${color}-11)` : "var(--gray-11)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
        <Text size="1" color="gray">
          {label}
        </Text>
      </Flex>
      <Text size="6" weight="bold" style={{ color: color ? `var(--${color}-11)` : undefined }}>
        {value}
      </Text>
    </Flex>
  </Card>
);

export const AnalyticsBlock: React.FC = () => {
  const router = useRouter();
  const analyticsData = useApi((api) => api.crm.analytics(), []);
  const [data, setData] = useState<CustomerAnalyticsDto | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  useEffect(() => {
    const r = analyticsData.result?.data?.response;
    if (r) {
      setData(r);
      setRefreshedAt(new Date());
    }
  }, [analyticsData.result]);

  const handleSelect = (c: TopCustomerDto) => {
    router.push(`/admin/hub/crm/customers/${c.customerID}`);
  };

  return (
    <Box>
      <Card variant="surface" size="3" mb="4">
        <Flex justify="between" align="center" wrap="wrap" gap="3">
          <HeaderV2
            title="CRM Analytics"
            subtitle="Lifetime customer behavior at a glance"
          />
          <Flex gap="2" align="center">
            {refreshedAt && (
              <Text size="1" color="gray">
                Updated {refreshedAt.toLocaleTimeString()}
              </Text>
            )}
            <Button
              variant="soft"
              color="gray"
              size="2"
              onClick={() => analyticsData.execute()}
              disabled={analyticsData.loading}
            >
              <ReloadIcon /> Refresh
            </Button>
          </Flex>
        </Flex>
      </Card>

      <Grid columns={{ initial: "1", sm: "2", md: "4" }} gap="3" mb="4">
        <Kpi
          label="Total Customers"
          value={String(data?.totalCustomers ?? 0)}
          icon={<PeopleAltOutlined />}
          color="indigo"
        />
        <Kpi
          label="New This Month"
          value={String(data?.newThisMonth ?? 0)}
          icon={<PersonAddAlt1Outlined />}
          color="blue"
        />
        <Kpi
          label="Avg. Order Value"
          value={formatCurrency(data?.averageOrderValue ?? 0)}
          icon={<AttachMoneyOutlined />}
          color="green"
        />
        <Kpi
          label="Retention Rate"
          value={`${((data?.retentionRate ?? 0) * 100).toFixed(1)}%`}
          icon={<AutoGraphOutlined />}
          color="amber"
        />
      </Grid>

      <Grid columns={{ initial: "1", md: "2", lg: "3" }} gap="3">
        <Box style={{ gridColumn: "span 1" }}>
          <SegmentDistributionChart
            distribution={data?.segmentDistribution ?? null}
            total={data?.totalCustomers ?? 0}
          />
        </Box>
        <TopList
          title="Top by Spend"
          rows={data?.topBySpend ?? []}
          valueAccessor={(r) => formatCurrency(r.totalSpend)}
          valueLabel="lifetime"
          emptyText="No spend data yet"
          onSelect={handleSelect}
        />
        <TopList
          title="Top by Frequency"
          rows={data?.topByFrequency ?? []}
          valueAccessor={(r) => `${r.totalVisits}`}
          valueLabel="visits"
          emptyText="No visits yet"
          onSelect={handleSelect}
        />
      </Grid>
    </Box>
  );
};
