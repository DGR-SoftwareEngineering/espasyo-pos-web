import React, { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Dialog,
  Flex,
  Switch,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import {
  AccessRoleDto,
  CreateAccessRoleParams,
  UpdateAccessRoleParams,
} from "core-lib/api/access/types";
import { Button } from "core-lib/components/radix/buttons/Button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: AccessRoleDto | null;
  onSaved: (role: AccessRoleDto) => void;
}

export const RoleEditDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  role,
  onSaved,
}) => {
  const { showToast } = useToastContext();
  const [name, setName] = useState("");
  const [level, setLevel] = useState<number>(50);
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const createCb = useApiCallback(
    async (api, args: CreateAccessRoleParams) =>
      await api.access.createRole(args),
  );
  const updateCb = useApiCallback(
    async (api, args: UpdateAccessRoleParams) =>
      await api.access.updateRole(args),
  );

  useEffect(() => {
    if (!open) return;
    if (role) {
      setName(role.name);
      setLevel(role.level);
      setDescription(role.description ?? "");
      setIsActive(role.isActive);
    } else {
      setName("");
      setLevel(50);
      setDescription("");
      setIsActive(true);
    }
  }, [open, role]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast("Name is required", "error");
      return;
    }
    try {
      const result = role
        ? await updateCb.execute({
            roleID: role.roleID,
            name: name.trim(),
            level,
            description: description.trim() || undefined,
            isActive,
          })
        : await createCb.execute({
            name: name.trim(),
            level,
            description: description.trim() || undefined,
          });
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success &&
        result.data.response
      ) {
        showToast(role ? "Role updated" : "Role created", "success");
        onSaved(result.data.response);
        return;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to save role";
      showToast(message, "error");
    } catch (error) {
      console.error("Error saving role:", error);
      const first =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to save role";
      showToast(first, "error");
    }
  };

  const loading = createCb.loading || updateCb.loading;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 480 }}>
        <Dialog.Title>
          <Flex align="center" gap="2">
            {role ? "Edit role" : "New role"}
            {role?.isSystem && (
              <Badge color="gray" variant="surface" radius="full">
                System
              </Badge>
            )}
          </Flex>
        </Dialog.Title>
        <Dialog.Description size="2" color="gray">
          Roles gate which sidebar items and CRUD actions users can perform.
        </Dialog.Description>

        <Flex direction="column" gap="3" mt="4">
          <Box>
            <Text size="2" weight="medium" as="div" mb="1">
              Name
            </Text>
            <TextField.Root
              size="3"
              value={name}
              placeholder="e.g. Manager"
              onChange={(e) => setName(e.target.value)}
              disabled={role?.isSystem}
            />
            <Text size="1" color="gray" as="div" mt="1">
              2–64 characters. Must be unique among active roles.
            </Text>
          </Box>

          <Box>
            <Text size="2" weight="medium" as="div" mb="1">
              Level
            </Text>
            <TextField.Root
              size="3"
              type="number"
              min={0}
              max={100}
              value={String(level)}
              onChange={(e) =>
                setLevel(Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0)))
              }
            />
            <Text size="1" color="gray" as="div" mt="1">
              0–100. Higher = more privileged. Admin = 100, Cashier = 50, Supplier = 10.
            </Text>
          </Box>

          <Box>
            <Text size="2" weight="medium" as="div" mb="1">
              Description (optional)
            </Text>
            <TextArea
              value={description}
              rows={2}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>

          {role && !role.isSystem && (
            <Flex align="center" justify="between">
              <Box>
                <Text size="2" weight="medium" as="div">
                  Active
                </Text>
                <Text size="1" color="gray" as="div">
                  Soft-deleted roles return 404 on /Access/me for users that
                  still reference them.
                </Text>
              </Box>
              <Switch
                checked={isActive}
                onCheckedChange={(c) => setIsActive(c === true)}
              />
            </Flex>
          )}
        </Flex>

        <Flex justify="end" gap="3" mt="4">
          <Button
            type="Secondary"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="Primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
          >
            {role ? "Save changes" : "Create role"}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
