import React from "react";
import {
  Badge,
  Flex,
  IconButton,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Tooltip,
} from "@radix-ui/themes";;
import { EyeOpenIcon } from "@radix-ui/react-icons";
import { DeleteOutlined, LockOpenOutlined } from "@mui/icons-material";
import { CashierShiftDto } from "core-lib/api/commons/types";
import { BaseTableRow } from "core-lib/components/radix/table/BaseTableRow";
import { formatCurrency } from "core-lib/business/strings";
import { STATUS_CONFIG, DIALOG_TITLES } from "../constants";

interface Props {
  row: CashierShiftDto;
  onView: (shift: CashierShiftDto) => void;
  onClose: (shift: CashierShiftDto) => void;
  onDelete?: (shift: CashierShiftDto) => void;
  mode?: "admin" | "cashier";
}

const formatDateTime = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const ShiftTableRow: React.FC<Props> = ({ row, onView, onClose, onDelete, mode = "admin" }) => {
  const statusCfg = STATUS_CONFIG[row.status];

  const columns = [
    {
      id: "shiftNumber",
      width: "12%",
      render: () => (
        <Badge color="indigo" variant="soft" radius="medium" size="2">
          {row.shiftNumber}
        </Badge>
      ),
    },
    {
      id: "cashierName",
      width: "18%",
      render: () => (
        <Text size="2" weight="medium">
          {row.cashierName}
        </Text>
      ),
    },
    {
      id: "openedAt",
      width: "16%",
      render: () => (
        <Text size="2" color="gray">
          {formatDateTime(row.openedAt)}
        </Text>
      ),
    },
    {
      id: "closedAt",
      width: "16%",
      render: () => (
        <Text size="2" color="gray">
          {formatDateTime(row.closedAt)}
        </Text>
      ),
    },
    {
      id: "openingCash",
      align: "center" as const,
      width: "12%",
      render: () => (
        <Text size="2" weight="medium">
          {formatCurrency(row.openingCash)}
        </Text>
      ),
    },
    {
      id: "status",
      align: "center" as const,
      width: "10%",
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
      id: "actions",
      align: "right" as const,
      width: "16%",
      render: () => (
        <Flex direction="row" gap="1" justify="end">
          <Tooltip content={DIALOG_TITLES.view}>
            <IconButton
              size="1"
              variant="ghost"
              color="blue"
              aria-label={DIALOG_TITLES.view}
              onClick={(e) => {
                e.stopPropagation();
                onView(row);
              }}
            >
              <EyeOpenIcon />
            </IconButton>
          </Tooltip>
          {row.status === "Open" && mode !== "cashier" && (
            <Tooltip content={DIALOG_TITLES.close}>
              <IconButton
                size="1"
                variant="ghost"
                color="red"
                aria-label={DIALOG_TITLES.close}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(row);
                }}
              >
                <LockOpenOutlined style={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          )}
          {row.status === "Closed" && mode !== "cashier" && onDelete && (
            <Tooltip content={DIALOG_TITLES.delete}>
              <IconButton
                size="1"
                variant="ghost"
                color="red"
                aria-label={DIALOG_TITLES.delete}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(row);
                }}
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
    <BaseTableRow
      data={row}
      rowKey={row.cashierShiftID}
      columns={columns}
    />
  );
};
