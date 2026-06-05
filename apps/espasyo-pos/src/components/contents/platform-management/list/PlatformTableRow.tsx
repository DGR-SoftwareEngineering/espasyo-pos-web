import React from "react";
import { Avatar, Badge, Box, Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import HubIcon from "@mui/icons-material/Hub";
import { BaseTableRow } from "core-lib/components/radix/table/BaseTableRow";
import { PlatformDto } from "core-lib/api/platform/types";

interface PlatformTableRowProps {
  row: PlatformDto;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onManageUsers: () => void;
}

export const PlatformTableRow: React.FC<PlatformTableRowProps> = ({
  row,
  onView,
  onEdit,
  onDelete,
  onManageUsers,
}) => {
  const columns = [
    {
      id: "name",
      render: () => (
        <Flex align="center" gap="3">
          <HubIcon style={{ fontSize: 20, color: "var(--iris-11)" }} />
          <Box style={{ minWidth: 0 }}>
            <Text size="2" weight="bold" as="div">
              {row.name}
            </Text>
            <Badge variant="outline" color="gray" size="1">
              {row.slugKey}
            </Badge>
          </Box>
        </Flex>
      ),
    },
    {
      id: "slugKey",
      render: () => (
        <Text size="2" style={{ fontFamily: "monospace" }}>
          {row.slugKey}
        </Text>
      ),
    },
    {
      id: "isSystem",
      render: () => (
        <Badge
          variant={row.isSystem ? "soft" : "outline"}
          color={row.isSystem ? "purple" : "gray"}
          size="1"
        >
          {row.isSystem ? "System" : "Custom"}
        </Badge>
      ),
    },
    {
      id: "isActive",
      render: () => (
        <Flex align="center" gap="2">
          <Box
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: row.isActive ? "var(--green-11)" : "var(--red-11)",
            }}
          />
          <Text size="2">{row.isActive ? "Active" : "Inactive"}</Text>
        </Flex>
      ),
    },
    {
      id: "actions",
      render: () => (
        <Flex gap="1" justify="end" align="center">
          <Tooltip content="View Details">
            <IconButton
              size="1"
              variant="ghost"
              color="gray"
              onClick={onView}
              aria-label="View"
            >
              <VisibilityOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip content="Manage Users">
            <IconButton
              size="1"
              variant="ghost"
              color="indigo"
              onClick={onManageUsers}
              aria-label="Manage users"
            >
              <GroupsOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip
            content={row.isSystem ? "System platforms cannot be edited" : "Edit"}
          >
            <span>
              <IconButton
                size="1"
                variant="ghost"
                color="gray"
                onClick={onEdit}
                disabled={row.isSystem}
                aria-label="Edit"
              >
                <EditOutlined fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip
            content={row.isSystem ? "System platforms cannot be deleted" : "Delete"}
          >
            <span>
              <IconButton
                size="1"
                variant="ghost"
                color="red"
                onClick={onDelete}
                disabled={row.isSystem}
                aria-label="Delete"
              >
                <DeleteOutlined fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Flex>
      ),
    },
  ];

  return <BaseTableRow data={row} rowKey={row.platformID} columns={columns} />;
};
