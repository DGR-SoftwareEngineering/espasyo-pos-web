import React from "react";
import { Badge, Box, Flex, Text, Tooltip } from "@radix-ui/themes";
import { UserDto } from "core-lib/api/commons/types";
import { BaseTableRow } from "core-lib/components/radix/table/BaseTableRow";
import { ActionButtons } from "core-lib/components/radix/buttons/ActionButtons";
import { ImageReader } from "core-lib/components/radix/ImageReader";
import { IDChip } from "core-lib/components/radix/IDChip";
import { formatDateTime } from "core-lib/business/dates";
import { ROLE_BADGE_COLOR, DIALOG_TITLES } from "../constants";

interface Props {
  row: UserDto;
  onView: (user: UserDto) => void;
  onEdit: (user: UserDto) => void;
  onDelete: (user: UserDto) => void;
}

const formatRelative = (iso: string | null) => {
  if (!iso) return "Never";
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDateTime(iso);
};

export const UserTableRow: React.FC<Props> = ({
  row,
  onView,
  onEdit,
  onDelete,
}) => {
  const info = row.userInfo;
  const fullName = [info?.firstName, info?.middleName, info?.lastName]
    .map((p) => (p ?? "").trim())
    .filter(Boolean)
    .join(" ");
  const displayName = fullName || row.username || "Unnamed";
  const roleAccent = ROLE_BADGE_COLOR[row.roleName ?? ""] ?? "gray";

  const columns = [
    {
      id: "user",
      width: "28%",
      render: () => (
        <Flex align="center" gap="3">
          <ImageReader
            src={info?.imageUrl}
            alt={displayName}
            size={44}
            radius="full"
            border
            fallbackText={displayName}
          />
          <Box style={{ minWidth: 0 }}>
            <Text size="2" weight="bold" as="div" truncate>
              {displayName}
            </Text>
            <Text size="1" color="gray" as="div">
              @{row.username ?? "—"}
            </Text>
            <IDChip id={row.userID} label="ID" />
          </Box>
        </Flex>
      ),
    },
    {
      id: "role",
      align: "center" as const,
      width: "11%",
      render: () => (
        <Badge color={roleAccent} variant="soft" radius="full" size="2">
          {row.roleName ?? "—"}
        </Badge>
      ),
    },
    {
      id: "contact",
      width: "20%",
      render: () => (
        <Flex direction="column" gap="0">
          <Text size="2" as="div" truncate>
            {info?.email ?? "—"}
          </Text>
          <Text size="1" color="gray" as="div">
            {info?.contactNumber ?? "—"}
          </Text>
        </Flex>
      ),
    },
    {
      id: "lastLogin",
      align: "center" as const,
      width: "12%",
      render: () => (
        <Tooltip content={row.lastLogin ?? "No login yet"}>
          <Box>
            <Text
              size="2"
              weight="medium"
              as="div"
              style={{
                color: row.lastLogin ? "var(--gray-12)" : "var(--gray-10)",
              }}
            >
              {formatRelative(row.lastLogin)}
            </Text>
            <Text size="1" color="gray" as="div">
              Last login
            </Text>
          </Box>
        </Tooltip>
      ),
    },
    {
      id: "status",
      align: "center" as const,
      width: "8%",
      render: () => (
        <Badge
          color={row.isActive ? "green" : "gray"}
          variant="soft"
          radius="medium"
          size="2"
        >
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      align: "right" as const,
      width: "12%",
      render: () => (
        <ActionButtons
          onView={() => onView(row)}
          onEdit={() => onEdit(row)}
          onDelete={() => onDelete(row)}
          viewTooltip={DIALOG_TITLES.view}
          editTooltip={DIALOG_TITLES.edit}
          deleteTooltip={DIALOG_TITLES.delete}
        />
      ),
    },
  ];

  return (
    <BaseTableRow data={row} rowKey={row.userID} columns={columns} />
  );
};
