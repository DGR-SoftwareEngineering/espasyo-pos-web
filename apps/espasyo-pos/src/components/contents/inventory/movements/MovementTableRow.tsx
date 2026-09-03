import React, { useMemo } from "react";
import {
  Badge,
  Box,
  Flex,
  Text,
} from "core-lib/components/radix/proxies";;
import {
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  HelpOutlineRounded,
} from "@mui/icons-material";
import { BaseTableRow } from "core-lib/components/radix/table/BaseTableRow";
import {
  StockMovementDto,
  StockMovementType,
} from "core-lib/api/commons/types";
import { formatNumber } from "core-lib/business/number";
import { formatDateTime } from "core-lib/business/dates";
import { MOVEMENT_TYPE_CONFIG } from "../constants";

interface Props {
  row: StockMovementDto;
}

// Map the existing MUI palette color names from MOVEMENT_TYPE_CONFIG to
// Radix accent names so the Badge color stays consistent.
const MUI_TO_RADIX_COLOR: Record<
  string,
  "green" | "amber" | "red" | "blue" | "gray" | "indigo"
> = {
  success: "green",
  warning: "amber",
  error: "red",
  info: "blue",
  default: "gray",
  primary: "indigo",
};

export const MovementTableRow: React.FC<Props> = ({ row }) => {
  const cfg = useMemo(() => {
    const c = MOVEMENT_TYPE_CONFIG[row.movementType as StockMovementType];
    return (
      c ?? {
        label: row.movementTypeName ?? "Unknown",
        color: "default" as const,
        icon: HelpOutlineRounded,
        direction: "any" as const,
      }
    );
  }, [row.movementType, row.movementTypeName]);

  const IconCmp = cfg.icon;
  const unitLabel = row.unitName ?? "units";
  const isIn = row.quantity > 0;
  const badgeColor = MUI_TO_RADIX_COLOR[cfg.color] ?? "gray";
  const arrowColor = isIn ? "var(--green-11)" : "var(--red-11)";

  const columns = [
    {
      id: "movementType",
      width: "14%",
      render: () => (
        <Badge
          color={badgeColor}
          variant="soft"
          size="2"
          radius="medium"
          style={{ minWidth: 110, justifyContent: "center" }}
        >
          <IconCmp style={{ fontSize: 14 }} />
          {cfg.label}
        </Badge>
      ),
    },
    {
      id: "product",
      width: "22%",
      render: () => (
        <Box>
          <Text size="2" weight="bold" as="div">
            {row.productName ?? "Unnamed"}
          </Text>
          <Text size="1" color="gray" as="div">
            {row.referenceType ?? "—"}
            {row.referenceID ? ` · ${row.referenceID.substring(0, 8)}…` : ""}
          </Text>
        </Box>
      ),
    },
    {
      id: "quantity",
      width: "13%",
      align: "center" as const,
      render: () => (
        <Flex align="center" gap="1" justify="center">
          {isIn ? (
            <ArrowUpwardRounded style={{ fontSize: 16, color: arrowColor }} />
          ) : (
            <ArrowDownwardRounded style={{ fontSize: 16, color: arrowColor }} />
          )}
          <Text size="2" weight="bold" style={{ color: arrowColor }}>
            {isIn ? "+" : ""}
            {formatNumber(row.quantity)} {unitLabel}
          </Text>
        </Flex>
      ),
    },
    {
      id: "balanceAfter",
      width: "13%",
      align: "center" as const,
      render: () => (
        <Badge
          color="indigo"
          variant="soft"
          size="2"
          radius="medium"
          style={{ minWidth: 60, justifyContent: "center" }}
        >
          {formatNumber(row.balanceAfter)}
        </Badge>
      ),
    },
    {
      id: "reason",
      width: "20%",
      render: () => (
        <Text
          size="2"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {row.reason ?? "—"}
        </Text>
      ),
    },
    {
      id: "createdAt",
      width: "18%",
      render: () => (
        <Flex direction="column">
          <Text size="2">{formatDateTime(row.createdAt)}</Text>
          <Text size="1" color="gray">
            by {row.createdBy ?? "system"}
          </Text>
        </Flex>
      ),
    },
  ];

  return (
    <BaseTableRow data={row} rowKey={row.stockMovementID} columns={columns} />
  );
};
