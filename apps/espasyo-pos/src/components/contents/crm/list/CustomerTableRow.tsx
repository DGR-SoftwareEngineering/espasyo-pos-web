import React from "react";
import { Badge, Box, Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { EyeOpenIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { EmojiEventsOutlined, LocalCafeOutlined } from "@mui/icons-material";
import { CustomerDto } from "core-lib/api/crm";
import { BaseTableRow } from "core-lib/components/radix/table/BaseTableRow";
import { formatCurrency } from "core-lib/business/strings";
import { SegmentBadge } from "../components/SegmentBadge";
import { computeAOV } from "../format";

interface Props {
  row: CustomerDto;
  onView: (c: CustomerDto) => void;
  onEdit: (c: CustomerDto) => void;
  onDelete: (c: CustomerDto) => void;
}

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

const getDaysAgo = (iso: string | null): number => {
  if (!iso) return 999;
  const d = new Date(iso);
  return Math.floor((Date.now() - d.getTime()) / 86400000);
};

const getLastVisitColor = (daysAgo: number): string => {
  if (daysAgo < 7) return "var(--green-11)";
  if (daysAgo < 30) return "var(--gray-11)";
  if (daysAgo < 60) return "var(--amber-11)";
  return "var(--red-11)";
};

export const CustomerTableRow: React.FC<Props> = ({ row, onView, onEdit, onDelete }) => {
  // Show how close they are to the next reward.
  const stampsInCycle = (row.loyaltyStamps ?? 0) % 6;
  const stampsToNext = stampsInCycle === 0 && (row.loyaltyStamps ?? 0) > 0 ? 0 : 6 - stampsInCycle;
  const daysAgo = getDaysAgo(row.lastVisitAt);
  const aov = computeAOV(row.totalSpend, row.totalVisits);

  const columns = [
    {
      id: "customerNumber",
      width: "12%",
      render: () => (
        <Badge color="indigo" variant="soft" radius="medium" size="1">
          {row.customerNumber}
        </Badge>
      ),
    },
    {
      id: "fullName",
      width: "20%",
      render: () => (
        <Flex direction="column" gap="1">
          <Text size="2" weight="medium">
            {row.fullName}
          </Text>
          {row.lastVisitAt && (
            <Text size="1" style={{ color: getLastVisitColor(daysAgo) }} weight="medium">
              Last visit {formatDate(row.lastVisitAt)}
            </Text>
          )}
        </Flex>
      ),
    },
    {
      id: "contact",
      width: "18%",
      render: () => (
        <Flex direction="column" gap="0">
          {row.phone ? (
            <Text size="2">{row.phone}</Text>
          ) : (
            <Text size="2" color="gray">
              —
            </Text>
          )}
          {row.email && (
            <Text size="1" color="gray" truncate>
              {row.email}
            </Text>
          )}
        </Flex>
      ),
    },
    {
      id: "segment",
      align: "center" as const,
      width: "10%",
      render: () => <SegmentBadge segment={row.segment} tooltip />,
    },
    {
      id: "loyaltyStamps",
      align: "center" as const,
      width: "10%",
      render: () => (
        <Tooltip
          content={
            stampsToNext === 0
              ? "Reward available"
              : `${stampsToNext} more for next free drink`
          }
        >
          <Flex direction="column" gap="1" align="center" justify="center" style={{ width: "100%" }}>
            <Flex align="center" gap="1">
              <LocalCafeOutlined style={{ fontSize: 14, color: "var(--brown-11, #4A2F1E)" }} />
              <Text size="2" weight="medium">
                {row.loyaltyStamps}
              </Text>
              {stampsToNext === 0 && row.loyaltyStamps > 0 && (
                <EmojiEventsOutlined style={{ fontSize: 14, color: "var(--amber-11)" }} />
              )}
            </Flex>
            <Box
              style={{
                width: "100%",
                height: 3,
                borderRadius: 2,
                background: "var(--amber-a3)",
              }}
            >
              <Box
                style={{
                  height: "100%",
                  width: `${stampsInCycle > 0 ? (stampsInCycle / 6) * 100 : 0}%`,
                  background: "var(--amber-9)",
                  transition: "width 0.4s ease",
                  borderRadius: 2,
                }}
              />
            </Box>
          </Flex>
        </Tooltip>
      ),
    },
    {
      id: "totalVisits",
      align: "center" as const,
      width: "8%",
      render: () => (
        <Text size="2" weight="medium">
          {row.totalVisits}
        </Text>
      ),
    },
    {
      id: "totalSpend",
      align: "right" as const,
      width: "10%",
      render: () => (
        <Flex direction="column" gap="0" align="end">
          <Text size="2" weight="medium">
            {formatCurrency(row.totalSpend)}
          </Text>
          <Text size="1" color="gray">
            Avg: {formatCurrency(aov)}
          </Text>
        </Flex>
      ),
    },
    {
      id: "actions",
      align: "right" as const,
      width: "12%",
      render: () => (
        <Flex gap="1" justify="end">
          <Tooltip content="View profile">
            <IconButton
              size="1"
              variant="ghost"
              color="blue"
              aria-label="View"
              onClick={(e) => {
                e.stopPropagation();
                onView(row);
              }}
            >
              <EyeOpenIcon />
            </IconButton>
          </Tooltip>
          <Tooltip content="Edit">
            <IconButton
              size="1"
              variant="ghost"
              color="indigo"
              aria-label="Edit"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row);
              }}
            >
              <Pencil1Icon />
            </IconButton>
          </Tooltip>
          <Tooltip content="Delete">
            <IconButton
              size="1"
              variant="ghost"
              color="red"
              aria-label="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row);
              }}
            >
              <TrashIcon />
            </IconButton>
          </Tooltip>
        </Flex>
      ),
    },
  ];

  return <BaseTableRow data={row} rowKey={row.customerID} columns={columns} />;
};
