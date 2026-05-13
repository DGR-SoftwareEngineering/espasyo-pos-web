import React, { useMemo } from "react";
import {
  Box,
  Chip,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  HelpOutlineRounded,
} from "@mui/icons-material";
import { BaseTableRow } from "core-lib";
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

export const MovementTableRow: React.FC<Props> = ({ row }) => {
  const theme = useTheme();

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
  const arrowColor = isIn
    ? theme.palette.success.main
    : theme.palette.error.main;

  const columns = [
    {
      id: "movementType",
      width: "14%",
      render: () => (
        <Chip
          icon={<IconCmp style={{ fontSize: 16 }} />}
          label={cfg.label}
          size="small"
          color={cfg.color}
          sx={{ fontWeight: 600, borderRadius: 2, minWidth: 110 }}
        />
      ),
    },
    {
      id: "product",
      width: "22%",
      render: () => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {row.productName ?? "Unnamed"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.referenceType ?? "—"}
            {row.referenceID ? ` · ${row.referenceID.substring(0, 8)}…` : ""}
          </Typography>
        </Box>
      ),
    },
    {
      id: "quantity",
      width: "13%",
      align: "center" as const,
      render: () => (
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          justifyContent="center"
        >
          {isIn ? (
            <ArrowUpwardRounded style={{ fontSize: 16, color: arrowColor }} />
          ) : (
            <ArrowDownwardRounded style={{ fontSize: 16, color: arrowColor }} />
          )}
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{ color: arrowColor }}
          >
            {isIn ? "+" : ""}
            {formatNumber(row.quantity)} {unitLabel}
          </Typography>
        </Stack>
      ),
    },
    {
      id: "balanceAfter",
      width: "13%",
      align: "center" as const,
      render: () => (
        <Box
          sx={{
            display: "inline-flex",
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.06),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            {formatNumber(row.balanceAfter)}
          </Typography>
        </Box>
      ),
    },
    {
      id: "reason",
      width: "20%",
      render: () => (
        <Typography
          variant="body2"
          color="text.primary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {row.reason ?? "—"}
        </Typography>
      ),
    },
    {
      id: "createdAt",
      width: "18%",
      render: () => (
        <Stack>
          <Typography variant="body2">{formatDateTime(row.createdAt)}</Typography>
          <Typography variant="caption" color="text.secondary">
            by {row.createdBy ?? "system"}
          </Typography>
        </Stack>
      ),
    },
  ];

  return (
    <BaseTableRow data={row} rowKey={row.stockMovementID} columns={columns} />
  );
};
