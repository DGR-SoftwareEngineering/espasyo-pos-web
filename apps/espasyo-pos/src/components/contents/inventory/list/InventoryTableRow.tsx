import React, { useMemo } from "react";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  KitchenOutlined,
  SwapVertOutlined,
  TuneOutlined,
  ReceiptLongOutlined,
  VisibilityOutlined,
  DeleteOutlineOutlined,
} from "@mui/icons-material";
import { BaseTableRow } from "core-lib";
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

export const InventoryTableRow: React.FC<Props> = ({
  row,
  onView,
  onAdjust,
  onEditThresholds,
  onViewHistory,
  onDelete,
}) => {
  const theme = useTheme();

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

  const stockColor =
    row.status === InventoryStatus.InStock
      ? theme.palette.success.main
      : row.status === InventoryStatus.LowStock
        ? theme.palette.warning.main
        : theme.palette.error.main;

  const columns = [
    {
      id: "product",
      width: "28%",
      render: () => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            {(row.productName ?? "—").charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.productName ?? "Unnamed ingredient"}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              ID: {formatId(row.inventoryID)}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Unit: {unitLabel}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      id: "currentQuantity",
      align: "center" as const,
      width: "15%",
      render: () => (
        <Stack direction="column" alignItems="center" spacing={0.25}>
          <Typography
            variant="body1"
            fontWeight={700}
            sx={{ color: stockColor }}
          >
            {formatNumber(row.currentQuantity)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {unitLabel}
          </Typography>
        </Stack>
      ),
    },
    {
      id: "thresholds",
      align: "center" as const,
      width: "15%",
      render: () => (
        <Stack direction="column" alignItems="center" spacing={0.25}>
          <Typography variant="body2" fontWeight={500}>
            {formatNumber(row.reorderLevel)} /{" "}
            {formatNumber(row.minimumStockLevel)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            reorder / min
          </Typography>
        </Stack>
      ),
    },
    {
      id: "status",
      align: "center" as const,
      width: "12%",
      render: () => (
        <Chip
          icon={<StatusIcon style={{ fontSize: 16 }} />}
          label={statusInfo.label}
          size="small"
          color={statusInfo.color}
          sx={{ fontWeight: 600, borderRadius: 2, minWidth: 100 }}
        />
      ),
    },
    {
      id: "updatedAt",
      width: "15%",
      render: () => (
        <Stack direction="column">
          <Typography variant="body2">
            {formatDateTime(row.updatedAt ?? row.createdAt)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            by {row.updatedBy ?? row.createdBy ?? "system"}
          </Typography>
        </Stack>
      ),
    },
    {
      id: "actions",
      align: "right" as const,
      width: "15%",
      render: () => (
        <Stack
          direction="row"
          spacing={0.5}
          justifyContent="flex-end"
          alignItems="center"
        >
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => onView(row)}>
              <VisibilityOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Adjust Stock">
            <IconButton
              size="small"
              onClick={() => onAdjust(row)}
              sx={{
                color: theme.palette.primary.main,
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <SwapVertOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Thresholds">
            <IconButton size="small" onClick={() => onEditThresholds(row)}>
              <TuneOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Movement History">
            <IconButton size="small" onClick={() => onViewHistory(row)}>
              <ReceiptLongOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Inventory">
            <IconButton
              size="small"
              onClick={() => onDelete(row)}
              sx={{
                color: theme.palette.error.main,
                "&:hover": {
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              <DeleteOutlineOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <BaseTableRow data={row} rowKey={row.inventoryID} columns={columns} />
  );
};
