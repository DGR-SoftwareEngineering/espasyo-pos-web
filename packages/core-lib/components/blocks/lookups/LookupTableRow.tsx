import React from "react";
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
  EditOutlined,
  DeleteOutlineOutlined,
  AccountTreeOutlined,
} from "@mui/icons-material";
import { BaseTableRow } from "../../table/BaseTableRow";
import { formatDateTime } from "../../../business/dates";
import { formatId } from "../../../business/strings";
import { LookupAdminConfig, LookupDtoBase } from "./types";

interface Props<TDto extends LookupDtoBase> {
  row: TDto;
  config: LookupAdminConfig<TDto>;
  onEdit: (row: TDto) => void;
  onDelete: (row: TDto) => void;
}

export function LookupTableRow<TDto extends LookupDtoBase>({
  row,
  config,
  onEdit,
  onDelete,
}: Props<TDto>) {
  const theme = useTheme();

  const parentName = config.parentNameField
    ? ((row[config.parentNameField] as unknown as string | null) ?? null)
    : null;

  const rowId = row[config.idField] as unknown as string;

  const columns = [
    {
      id: "name",
      width: "30%",
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
            {row.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              ID: {formatId(rowId)}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      id: "description",
      width: "30%",
      render: () => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {row.description ?? "—"}
        </Typography>
      ),
    },
    {
      id: "displayOrder",
      align: "center" as const,
      width: "10%",
      render: () => (
        <Chip
          label={row.displayOrder}
          size="small"
          sx={{
            minWidth: 56,
            fontWeight: 600,
            bgcolor: alpha(theme.palette.primary.main, 0.06),
          }}
        />
      ),
    },
    {
      id: "parent",
      width: "15%",
      render: () =>
        parentName ? (
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <AccountTreeOutlined
              fontSize="small"
              sx={{ color: theme.palette.text.secondary }}
            />
            <Typography variant="body2">{parentName}</Typography>
          </Stack>
        ) : (
          <Typography variant="caption" color="text.secondary">
            —
          </Typography>
        ),
    },
    {
      id: "updatedAt",
      width: "10%",
      render: () => (
        <Stack>
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
      width: "5%",
      render: () => (
        <Stack
          direction="row"
          spacing={0.5}
          justifyContent="flex-end"
          alignItems="center"
        >
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(row)}>
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
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

  return <BaseTableRow data={row} rowKey={rowId} columns={columns} />;
}
