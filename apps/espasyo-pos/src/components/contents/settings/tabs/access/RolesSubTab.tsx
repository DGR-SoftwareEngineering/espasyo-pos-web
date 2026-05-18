import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  IconButton,
  ScrollArea,
  Separator,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import {
  AddCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ShieldOutlined,
} from "@mui/icons-material";
import { useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import {
  AccessRoleDto,
  AccessPermissionsMap,
  MenuItemDto,
} from "core-lib/api/access/types";
import { Button } from "core-lib/components/radix/buttons/Button";
import { useRoles, useRolePermissions } from "./hooks";
import { RoleEditDialog } from "./RoleEditDialog";
import { RolePermissionsEditor } from "./RolePermissionsEditor";

interface Props {
  menuItems: MenuItemDto[];
  menuLoading: boolean;
}

export const RolesSubTab: React.FC<Props> = ({ menuItems, menuLoading }) => {
  const { showToast } = useToastContext();
  const roles = useRoles();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<AccessRoleDto | null>(null);

  const deleteCb = useApiCallback(
    async (api, id: string) => await api.access.softDeleteRole(id),
  );

  const selectedRole = useMemo(
    () => roles.roles.find((r) => r.roleID === selectedRoleId) ?? null,
    [roles.roles, selectedRoleId],
  );

  const perms = useRolePermissions(selectedRoleId);

  useEffect(() => {
    if (!selectedRoleId && roles.roles.length > 0) {
      const firstActive =
        roles.roles.find((r) => r.isActive && r.isSystem) ??
        roles.roles.find((r) => r.isActive) ??
        roles.roles[0];
      if (firstActive) setSelectedRoleId(firstActive.roleID);
    }
  }, [roles.roles, selectedRoleId]);

  const handleSavedRole = (next: AccessRoleDto) => {
    setDialogOpen(false);
    setEditingRole(null);
    roles.refresh();
    setSelectedRoleId(next.roleID);
  };

  const handleDelete = async (role: AccessRoleDto) => {
    if (role.isSystem) {
      showToast("System roles cannot be deleted", "error");
      return;
    }
    if (!confirm(`Soft-delete role "${role.name}"? Users assigned to this role will lose access.`)) {
      return;
    }
    try {
      const result = await deleteCb.execute(role.roleID);
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success
      ) {
        showToast(`${role.name} deactivated`, "success");
        roles.refresh();
        if (role.roleID === selectedRoleId) setSelectedRoleId(null);
        return;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to delete role";
      showToast(message, "error");
    } catch (error) {
      console.error("Error deleting role:", error);
      const first =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to delete role";
      showToast(first, "error");
    }
  };

  return (
    <Flex
      direction={{ initial: "column", lg: "row" }}
      gap="4"
      style={{ width: "100%", alignItems: "stretch" }}
    >
      <Card
        variant="surface"
        size="2"
        style={{
          width: 280,
          flexShrink: 0,
          maxHeight: 720,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Flex align="center" justify="between" mb="3">
          <Flex align="center" gap="2">
            <ShieldOutlined
              style={{ fontSize: 18, color: "var(--accent-11)" }}
            />
            <Heading size="3">Roles</Heading>
            <Badge color="gray" variant="soft" radius="full">
              {roles.roles.length}
            </Badge>
          </Flex>
          <Tooltip content="Create new role">
            <IconButton
              variant="ghost"
              color="gray"
              size="2"
              onClick={() => {
                setEditingRole(null);
                setDialogOpen(true);
              }}
              aria-label="Create new role"
            >
              <AddCircleOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Flex>

        <Separator size="4" mb="2" />

        <ScrollArea
          scrollbars="vertical"
          type="hover"
          style={{ flex: 1, minHeight: 0 }}
        >
          <Flex direction="column" gap="1">
            {roles.loading && roles.roles.length === 0 ? (
              <Text size="2" color="gray" align="center" mt="4">
                Loading roles…
              </Text>
            ) : roles.roles.length === 0 ? (
              <Text size="2" color="gray" align="center" mt="4">
                No roles yet.
              </Text>
            ) : (
              roles.roles.map((role) => {
                const active = role.roleID === selectedRoleId;
                return (
                  <Box
                    key={role.roleID}
                    onClick={() => setSelectedRoleId(role.roleID)}
                    role="button"
                    tabIndex={0}
                    style={{
                      cursor: "pointer",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-3)",
                      background: active ? "var(--accent-a3)" : "transparent",
                      border: active
                        ? "1px solid var(--accent-a6)"
                        : "1px solid transparent",
                      transition: "background 120ms ease",
                    }}
                  >
                    <Flex align="center" justify="between" gap="2">
                      <Flex
                        direction="column"
                        style={{ minWidth: 0, flex: 1 }}
                      >
                        <Flex align="center" gap="2">
                          <Text
                            size="2"
                            weight={active ? "bold" : "medium"}
                            style={{
                              color: active
                                ? "var(--accent-11)"
                                : "var(--gray-12)",
                            }}
                          >
                            {role.name}
                          </Text>
                          {role.isSystem && (
                            <Badge
                              color="gray"
                              variant="surface"
                              radius="full"
                              size="1"
                            >
                              Sys
                            </Badge>
                          )}
                        </Flex>
                        <Text size="1" color="gray">
                          Level {role.level}
                          {!role.isActive && " · Inactive"}
                        </Text>
                      </Flex>
                      <Flex gap="1">
                        <Tooltip content="Edit role">
                          <IconButton
                            variant="ghost"
                            color="gray"
                            size="1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingRole(role);
                              setDialogOpen(true);
                            }}
                            aria-label="Edit role"
                          >
                            <EditOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {!role.isSystem && (
                          <Tooltip content="Soft-delete role">
                            <IconButton
                              variant="ghost"
                              color="red"
                              size="1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(role);
                              }}
                              aria-label="Soft-delete role"
                            >
                              <DeleteOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Flex>
                    </Flex>
                  </Box>
                );
              })
            )}
          </Flex>
        </ScrollArea>

        <Separator size="4" my="2" />

        <Button
          type="Primary"
          onClick={() => {
            setEditingRole(null);
            setDialogOpen(true);
          }}
          fullWidth
        >
          <Flex align="center" justify="center" gap="2">
            <AddCircleOutlined fontSize="small" />
            New role
          </Flex>
        </Button>
      </Card>

      <Box style={{ flex: 1, minWidth: 0 }}>
        {!selectedRole ? (
          <Card
            variant="surface"
            size="3"
            style={{ minHeight: 360, display: "flex", alignItems: "center" }}
          >
            <Flex direction="column" align="center" gap="2" style={{ width: "100%" }}>
              <ShieldOutlined
                style={{ fontSize: 56, color: "var(--gray-9)" }}
              />
              <Text size="3" weight="medium">
                Pick a role to edit
              </Text>
              <Text size="2" color="gray" align="center">
                Choose a role on the left, or create a new one to start
                assigning sidebar visibility and CRUD permissions.
              </Text>
            </Flex>
          </Card>
        ) : (
          <RolePermissionsEditor
            role={selectedRole}
            menuItems={menuItems}
            initialPermissions={perms.permissions}
            loading={perms.loading || menuLoading}
            onSaved={(next: AccessPermissionsMap) => {
              perms.setPermissions(next);
            }}
          />
        )}
      </Box>

      <RoleEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        role={editingRole}
        onSaved={handleSavedRole}
      />
    </Flex>
  );
};
