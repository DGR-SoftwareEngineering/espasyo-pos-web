import React from "react";
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
  Pencil1Icon,
  TrashIcon,
  Share1Icon,
} from "@radix-ui/react-icons";
import { BaseTableRow } from "../../radix/table/BaseTableRow";
import { formatDateTime } from "../../../business/dates";
import { formatId } from "../../../business/strings";
import { LookupAdminConfig, LookupDtoBase } from "./types";

interface Props<TDto extends LookupDtoBase> {
  row: TDto;
  config: LookupAdminConfig<TDto>;
  onEdit: (row: TDto) => void;
  onDelete: (row: TDto) => void;
}

/**
 * Radix-themed table row for any lookup admin block. Mirrors the previous MUI
 * version's column layout (name / description / order / parent / updated /
 * actions) with Radix primitives — no `alpha()` or `useTheme()` calls; all
 * tone shifts route through Radix Themes' CSS variables.
 */
export function LookupTableRow<TDto extends LookupDtoBase>({
  row,
  config,
  onEdit,
  onDelete,
}: Props<TDto>) {
  const parentName = config.parentNameField
    ? ((row[config.parentNameField] as unknown as string | null) ?? null)
    : null;

  const rowId = row[config.idField] as unknown as string;

  const columns = [
    {
      id: "name",
      width: "30%",
      render: () => (
        <Flex align="center" gap="3">
          <Avatar
            size="2"
            radius="full"
            color="indigo"
            variant="soft"
            fallback={row.name.charAt(0).toUpperCase()}
          />
          <Box style={{ minWidth: 0 }}>
            <Text size="2" weight="bold" as="div" truncate>
              {row.name}
            </Text>
            <Text size="1" color="gray" as="div">
              ID: {formatId(rowId)}
            </Text>
          </Box>
        </Flex>
      ),
    },
    {
      id: "description",
      width: "30%",
      render: () => (
        <Text
          size="2"
          color="gray"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {row.description ?? "—"}
        </Text>
      ),
    },
    {
      id: "displayOrder",
      align: "center" as const,
      width: "10%",
      render: () => (
        <Badge
          color="indigo"
          variant="soft"
          size="2"
          style={{ minWidth: 48, justifyContent: "center" }}
        >
          {row.displayOrder}
        </Badge>
      ),
    },
    {
      id: "parent",
      width: "15%",
      render: () =>
        parentName ? (
          <Flex align="center" gap="1">
            <Share1Icon style={{ color: "var(--gray-10)" }} />
            <Text size="2">{parentName}</Text>
          </Flex>
        ) : (
          <Text size="1" color="gray">
            —
          </Text>
        ),
    },
    {
      id: "updatedAt",
      width: "10%",
      render: () => (
        <Flex direction="column">
          <Text size="2">
            {formatDateTime(row.updatedAt ?? row.createdAt)}
          </Text>
          <Text size="1" color="gray">
            by {row.updatedBy ?? row.createdBy ?? "system"}
          </Text>
        </Flex>
      ),
    },
    {
      id: "actions",
      align: "right" as const,
      width: "5%",
      render: () => (
        <Flex direction="row" gap="1" justify="end" align="center">
          <Tooltip content="Edit">
            <IconButton
              size="1"
              variant="ghost"
              color="gray"
              aria-label="Edit lookup row"
              onClick={() => onEdit(row)}
            >
              <Pencil1Icon />
            </IconButton>
          </Tooltip>
          <Tooltip content="Delete">
            <IconButton
              size="1"
              variant="ghost"
              color="red"
              aria-label="Delete lookup row"
              onClick={() => onDelete(row)}
            >
              <TrashIcon />
            </IconButton>
          </Tooltip>
        </Flex>
      ),
    },
  ];

  return <BaseTableRow data={row} rowKey={rowId} columns={columns} />;
}
