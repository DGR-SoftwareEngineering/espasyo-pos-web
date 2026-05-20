import React from "react";
import { Badge, Box, Flex, Text } from "@radix-ui/themes";
import {
  PurchaseOrderDto,
  PurchaseOrderStatusDto,
} from "core-lib/api/commons/types";
import {
  BaseTableColumn,
  BaseTableRow,
} from "core-lib/components/radix/table/BaseTableRow";
import { FULFILLMENT_META, PO_STATUS_META } from "../constants";
import {
  formatCurrency,
  formatQuantity,
  formatRelative,
  formatShortDate,
} from "../format";

interface Props {
  row: PurchaseOrderDto;
  onView: (po: PurchaseOrderDto) => void;
}

export const PurchaseOrderTableRow: React.FC<Props> = ({ row, onView }) => {
  const statusMeta = PO_STATUS_META[row.status];
  const fulfillmentMeta = FULFILLMENT_META[row.fulfillmentMethod];
  const receivedPct =
    row.totalQuantityOrdered > 0
      ? Math.round(
          (row.totalQuantityReceived / row.totalQuantityOrdered) * 100,
        )
      : 0;
  const showProgress =
    row.status === PurchaseOrderStatusDto.Approved ||
    row.status === PurchaseOrderStatusDto.PartiallyReceived;

  const columns: BaseTableColumn<PurchaseOrderDto>[] = [
    {
      id: "po",
      align: "left",
      width: "15%",
      render: () => (
        <Text size="2" weight="medium">
          {row.orderNumber}
        </Text>
      ),
    },
    {
      id: "supplier",
      align: "left",
      width: "20%",
      render: () => <Text size="2">{row.supplierName}</Text>,
    },
    {
      id: "status",
      align: "left",
      width: "15%",
      render: () => (
        <Flex direction="column" gap="1" align="start">
          <Badge color={statusMeta?.color ?? "gray"} variant="soft" radius="full">
            {statusMeta?.label ?? "—"}
          </Badge>
          {showProgress && (
            <Text size="1" color="gray">
              {receivedPct}% received
            </Text>
          )}
        </Flex>
      ),
    },
    {
      id: "fulfillment",
      align: "center",
      width: "12%",
      render: () => (
        <Badge
          color={fulfillmentMeta?.color ?? "gray"}
          variant="soft"
          radius="full"
        >
          {fulfillmentMeta?.label ?? "—"}
        </Badge>
      ),
    },
    {
      id: "items",
      align: "left",
      width: "13%",
      render: () => (
        <Text size="2">
          {row.itemCount} · {formatQuantity(row.totalQuantityOrdered)} units
        </Text>
      ),
    },
    {
      id: "total",
      align: "right",
      width: "12%",
      render: () => (
        <Text size="2" weight="medium">
          {formatCurrency(row.totalAmount, row.currencyCode)}
        </Text>
      ),
    },
    {
      id: "expected",
      align: "left",
      width: "8%",
      render: () => (
        <Text size="2" color="gray">
          {formatShortDate(row.expectedDate)}
        </Text>
      ),
    },
    {
      id: "created",
      align: "left",
      width: "5%",
      render: () => (
        <Text size="2" color="gray">
          {formatRelative(row.createdAt)}
        </Text>
      ),
    },
  ];

  return (
    <BaseTableRow
      data={row}
      rowKey={row.purchaseOrderID}
      columns={columns}
      onRowClick={onView}
      style={{ cursor: "pointer" }}
    />
  );
};
