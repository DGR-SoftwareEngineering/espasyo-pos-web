import React, { useMemo } from "react";
import {
  Avatar,
  Badge,
  Box,
  Flex,
  IconButton,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import {
  KitchenOutlined,
  SwapVertOutlined,
  TuneOutlined,
  ReceiptLongOutlined,
  VisibilityOutlined,
  DeleteOutlineOutlined,
} from "@mui/icons-material";
import { BaseTableRow } from "core-lib/components/radix/table/BaseTableRow";
import {
  InventoryDto,
  InventoryStatus,
} from "core-lib/api/commons/types";
import { formatNumber } from "core-lib/business/number";
import { formatId } from "core-lib/business/strings";
import { formatDateTime } from "core-lib/business/dates";
import { STATUS_CONFIG } from "../constants";

interface Props {
  row: InventoryDto;
  onView: (inventory: InventoryDto) => void;
  onAdjust: (inventory: InventoryDto) => void;
  onEditThresholds: (inventory: InventoryDto) => void;
  onViewHistory: (inventory: InventoryDto) => void;
  onDelete: (inventory: InventoryDto) => void;
}

const STATUS_TO_BADGE_COLOR: Record<
  number,
  "green" | "amber" | "red" | "gray"
> = {
  [InventoryStatus.InStock]: "green",
  [InventoryStatus.LowStock]: "amber",
  [InventoryStatus.Critical]: "red",
  [InventoryStatus.OutOfStock]: "red",
};

export const InventoryTableRow: React.FC<Props> = ({
  row,
  onView,
  onAdjust,
  onEditThresholds,
  onViewHistory,
  onDelete,
}) => {
  const statusInfo = useMemo(() => {
    const s = STATUS_CONFIG[row.status];
    return (
      s ?? {
        label: row.statusName ?? "Unknown",
        color: "default" as const,
        icon: KitchenOutlined,
      }
    );
  }, [row.status, row.statusName]);

  const StatusIcon = statusInfo.icon;
  const unitLabel = row.stockUnitName ?? "units";
  const badgeColor = STATUS_TO_BADGE_COLOR[row.status] ?? "gray";

  const stockColor =
    row.status === InventoryStatus.InStock
      ? "var(--green-11)"
      : row.status === InventoryStatus.LowStock
        ? "var(--amber-11)"
        : "var(--red-11)";

  const columns = [
    {
      id: "product",
      width: "28%",
      render: () => (
        <Flex align="center" gap="3">
          <Avatar
            size="2"
            radius="full"
            color="indigo"
            variant="soft"
            fallback={(row.productName ?? "—").charAt(0).toUpperCase()}
          />
          <Box style={{ minWidth: 0 }}>
            <Text size="2" weight="bold" as="div">
              {row.productName ?? "Unnamed ingredient"}
            </Text>
            <Text size="1" color="gray" as="div">
              ID: {formatId(row.inventoryID)}
            </Text>
            <Text size="1" color="gray" as="div">
              Unit: {unitLabel}
            </Text>
          </Box>
        </Flex>
      ),
    },
    {
      id: "currentQuantity",
      align: "center" as const,
      width: "15%",
      render: () => (
        <Flex direction="column" align="center" gap="0">
          <Text size="3" weight="bold" style={{ color: stockColor }}>
            {formatNumber(row.currentQuantity)}
          </Text>
          <Text size="1" color="gray">
            {unitLabel}
          </Text>
        </Flex>
      ),
    },
    {
      id: "thresholds",
      align: "center" as const,
      width: "15%",
      render: () => (
        <Flex direction="column" align="center" gap="0">
          <Text size="2" weight="medium">
            {formatNumber(row.reorderLevel)} /{" "}
            {formatNumber(row.minimumStockLevel)}
          </Text>
          <Text size="1" color="gray">
            reorder / min
          </Text>
        </Flex>
      ),
    },
    {
      id: "status",
      align: "center" as const,
      width: "12%",
      render: () => (
        <Badge
          color={badgeColor}
          variant="soft"
          size="2"
          radius="medium"
          style={{ minWidth: 100, justifyContent: "center" }}
        >
          <StatusIcon style={{ fontSize: 14 }} />
          {statusInfo.label}
        </Badge>
      ),
    },
    {
      id: "updatedAt",
      width: "15%",
      render: () => (
        <Flex direction="column">
          <Text size="2">{formatDateTime(row.updatedAt ?? row.createdAt)}</Text>
          <Text size="1" color="gray">
            by {row.updatedBy ?? row.createdBy ?? "system"}
          </Text>
        </Flex>
      ),
    },
    {
      id: "actions",
      align: "right" as const,
      width: "15%",
      render: () => (
        <Flex gap="1" justify="end" align="center">
          <Tooltip content="View Details">
            <IconButton
              size="1"
              variant="ghost"
              color="gray"
              aria-label="View"
              onClick={() => onView(row)}
            >
              <VisibilityOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip content="Adjust Stock">
            <IconButton
              size="1"
              variant="ghost"
              color="indigo"
              aria-label="Adjust stock"
              onClick={() => onAdjust(row)}
            >
              <SwapVertOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip content="Edit Thresholds">
            <IconButton
              size="1"
              variant="ghost"
              color="gray"
              aria-label="Edit thresholds"
              onClick={() => onEditThresholds(row)}
            >
              <TuneOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip content="Movement History">
            <IconButton
              size="1"
              variant="ghost"
              color="gray"
              aria-label="Movement history"
              onClick={() => onViewHistory(row)}
            >
              <ReceiptLongOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip content="Delete Inventory">
            <IconButton
              size="1"
              variant="ghost"
              color="red"
              aria-label="Delete inventory"
              onClick={() => onDelete(row)}
            >
              <DeleteOutlineOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Flex>
      ),
    },
  ];

  return (
    <BaseTableRow data={row} rowKey={row.inventoryID} columns={columns} />
  );
};
