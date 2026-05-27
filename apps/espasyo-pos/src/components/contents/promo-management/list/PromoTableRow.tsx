import React from "react";
import { Badge, Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { EyeOpenIcon } from "@radix-ui/react-icons";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  LockOutlined,
  PushPinOutlined,
  SmartToyOutlined,
} from "@mui/icons-material";
import { PromoDto } from "core-lib/api/commons/types";
import { CustomerSegment } from "core-lib/api/crm";
import { BaseTableRow } from "core-lib/components/radix/table/BaseTableRow";
import { formatCurrency } from "core-lib/business/strings";
import { STATUS_CONFIG, TYPE_CONFIG } from "../constants";
import { SEGMENT_CONFIG } from "../../crm/constants";

interface Props {
  row: PromoDto;
  onView: (promo: PromoDto) => void;
  onActivate: (promo: PromoDto) => void;
  onDeactivate: (promo: PromoDto) => void;
  onDelete: (promo: PromoDto) => void;
}

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const PromoTableRow: React.FC<Props> = ({
  row,
  onView,
  onActivate,
  onDeactivate,
  onDelete,
}) => {
  const statusCfg = STATUS_CONFIG[row.status];
  const promoTypeInt =
    row.type === "PercentageDiscount"
      ? 1
      : row.type === "FixedDiscount"
      ? 2
      : row.type === "BuyXGetY"
      ? 3
      : 4;
  const typeCfg = TYPE_CONFIG[promoTypeInt];

  const canActivate =
    row.status === "Draft" || row.status === "Inactive" || row.status === "Scheduled";
  const canDeactivate = row.status === "Active";
  const canDelete = row.status !== "Active";

  const columns = [
    {
      id: "title",
      width: "22%",
      render: () => {
        const segCfg =
          row.targetSegment != null
            ? SEGMENT_CONFIG[row.targetSegment as CustomerSegment]
            : null;
        return (
          <Flex align="center" gap="2" wrap="wrap">
            <Text size="2" weight="medium" style={{ wordBreak: "break-word" }}>
              {row.title}
            </Text>
            {row.isAiGenerated && (
              <Tooltip content="AI-Generated Suggestion">
                <Badge color="violet" variant="surface" size="1" radius="full">
                  <SmartToyOutlined style={{ fontSize: 10 }} />
                  AI
                </Badge>
              </Tooltip>
            )}
            {row.targetCustomerCount > 0 && (
              <Tooltip
                content={`${row.targetCustomerCount} pinned customer(s) qualify in addition to the segment rule.`}
              >
                <Badge color="cyan" variant="soft" size="1" radius="full">
                  <PushPinOutlined style={{ fontSize: 10 }} />
                  Pinned {row.targetCustomerCount}
                </Badge>
              </Tooltip>
            )}
            {segCfg && (
              <Tooltip content={`Restricted to ${segCfg.label} customers`}>
                <Badge color={segCfg.color} variant="soft" size="1" radius="full">
                  {segCfg.label} only
                </Badge>
              </Tooltip>
            )}
            {row.minLoyaltyStamps != null && row.minLoyaltyStamps > 0 && (
              <Tooltip content={`Customer needs at least ${row.minLoyaltyStamps} stamps`}>
                <Badge color="amber" variant="soft" size="1" radius="full">
                  ≥{row.minLoyaltyStamps} stamps
                </Badge>
              </Tooltip>
            )}
          </Flex>
        );
      },
    },
    {
      id: "type",
      align: "center" as const,
      width: "14%",
      render: () => (
        <Badge color="indigo" variant="soft" radius="medium" size="1">
          {typeCfg.shortLabel}
        </Badge>
      ),
    },
    {
      id: "status",
      align: "center" as const,
      width: "11%",
      render: () => (
        <Badge
          color={statusCfg.color}
          variant="soft"
          radius="medium"
          size="2"
          style={{ minWidth: 64, justifyContent: "center" }}
        >
          {statusCfg.label}
        </Badge>
      ),
    },
    {
      id: "promoPrice",
      align: "center" as const,
      width: "12%",
      render: () => (
        <Text size="2" weight="medium" style={{ color: "var(--green-11)" }}>
          {row.promoPrice != null ? formatCurrency(row.promoPrice) : "—"}
        </Text>
      ),
    },
    {
      id: "estimatedMargin",
      align: "center" as const,
      width: "10%",
      render: () => {
        const margin = row.estimatedMargin;
        if (margin == null) return <Text size="2" color="gray">—</Text>;
        const color = margin >= 20 ? "var(--green-11)" : margin >= 5 ? "var(--orange-11)" : "var(--red-11)";
        return (
          <Text size="2" weight="bold" style={{ color }}>
            {margin.toFixed(1)}%
          </Text>
        );
      },
    },
    {
      id: "startDate",
      width: "17%",
      render: () => (
        <Flex direction="column" gap="0">
          {row.startDate || row.endDate ? (
            <>
              <Text size="1" color="gray">
                {formatDate(row.startDate)} →
              </Text>
              <Text size="1" color="gray">
                {formatDate(row.endDate)}
              </Text>
            </>
          ) : (
            <Text size="1" color="gray">No schedule</Text>
          )}
        </Flex>
      ),
    },
    {
      id: "actions",
      align: "right" as const,
      width: "14%",
      render: () => (
        <Flex direction="row" gap="1" justify="end">
          <Tooltip content="View details">
            <IconButton
              size="1"
              variant="ghost"
              color="blue"
              onClick={(e) => { e.stopPropagation(); onView(row); }}
            >
              <EyeOpenIcon />
            </IconButton>
          </Tooltip>
          {canActivate && (
            <Tooltip content="Activate promo">
              <IconButton
                size="1"
                variant="ghost"
                color="green"
                onClick={(e) => { e.stopPropagation(); onActivate(row); }}
              >
                <CheckCircleOutlined style={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          )}
          {canDeactivate && (
            <Tooltip content="Deactivate promo">
              <IconButton
                size="1"
                variant="ghost"
                color="orange"
                onClick={(e) => { e.stopPropagation(); onDeactivate(row); }}
              >
                <LockOutlined style={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip content="Delete promo">
              <IconButton
                size="1"
                variant="ghost"
                color="red"
                onClick={(e) => { e.stopPropagation(); onDelete(row); }}
              >
                <DeleteOutlined style={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          )}
        </Flex>
      ),
    },
  ];

  return (
    <BaseTableRow data={row} rowKey={row.promoID} columns={columns} />
  );
};
