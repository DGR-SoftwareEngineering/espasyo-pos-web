import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Callout,
  Card,
  Checkbox,
  Flex,
  Heading,
  Separator,
  Text,
} from "@radix-ui/themes";
import {
  CheckCircleOutlined,
  Restore,
  InfoOutlined,
  LockOutlined,
} from "@mui/icons-material";
import { useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import { useAccessContext } from "core-lib/core/contexts";
import {
  AccessPermissionsMap,
  AccessRoleDto,
  MenuItemDto,
  MenuPermissionDto,
  PermissionDto,
  UpdateRolePermissionsParams,
} from "core-lib/api/access/types";
import { Button } from "core-lib/components/radix/buttons/Button";
import { resolveIcon } from "core-lib/components/menu/icons";

interface Props {
  role: AccessRoleDto;
  menuItems: MenuItemDto[];
  initialPermissions: AccessPermissionsMap;
  loading: boolean;
  onSaved: (next: AccessPermissionsMap) => void;
}

const EMPTY_PERM: PermissionDto = {
  view: false,
  create: false,
  edit: false,
  delete: false,
};

const ACTIONS: Array<{ key: keyof PermissionDto; label: string }> = [
  { key: "view", label: "View" },
  { key: "create", label: "Create" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
];

const isParentKey = (key: string) => !key.includes(".nested.");

const getParentKey = (childKey: string) => {
  if (!childKey.includes(".nested.")) return null;
  return childKey.split(".nested.")[0]!;
};

const getPerm = (
  map: AccessPermissionsMap,
  key: string,
): PermissionDto => {
  if (isParentKey(key)) {
    const entry = map[key];
    if (entry) return { ...EMPTY_PERM, ...entry };
    return { ...EMPTY_PERM };
  }
  const parent = getParentKey(key)!;
  const entry = map[parent]?.nested?.[key];
  if (entry) return { ...EMPTY_PERM, ...entry };
  return { ...EMPTY_PERM };
};

const setPerm = (
  map: AccessPermissionsMap,
  key: string,
  action: keyof PermissionDto,
  value: boolean,
): AccessPermissionsMap => {
  const next: AccessPermissionsMap = { ...map };
  if (isParentKey(key)) {
    const current: MenuPermissionDto = next[key]
      ? { ...EMPTY_PERM, ...next[key] }
      : { ...EMPTY_PERM };
    current[action] = value;
    next[key] = current;
    return next;
  }
  const parent = getParentKey(key)!;
  const parentEntry: MenuPermissionDto = next[parent]
    ? {
        ...EMPTY_PERM,
        ...next[parent],
        nested: { ...(next[parent]?.nested ?? {}) },
      }
    : { ...EMPTY_PERM, nested: {} };
  const childEntry: PermissionDto = parentEntry.nested?.[key]
    ? { ...EMPTY_PERM, ...parentEntry.nested![key] }
    : { ...EMPTY_PERM };
  childEntry[action] = value;
  parentEntry.nested = { ...(parentEntry.nested ?? {}), [key]: childEntry };
  next[parent] = parentEntry;
  return next;
};

const setBulkForKey = (
  map: AccessPermissionsMap,
  key: string,
  value: boolean,
): AccessPermissionsMap => {
  let next = map;
  for (const action of ACTIONS) {
    next = setPerm(next, key, action.key, value);
  }
  return next;
};

const equalMaps = (a: AccessPermissionsMap, b: AccessPermissionsMap) =>
  JSON.stringify(a) === JSON.stringify(b);

interface GroupedRow {
  parent: MenuItemDto;
  children: MenuItemDto[];
}

const groupItems = (items: MenuItemDto[]): GroupedRow[] => {
  const sorted = [...items].sort(
    (a, b) =>
      a.displayOrder - b.displayOrder || a.label.localeCompare(b.label),
  );
  const byId = new Map<string, MenuItemDto>();
  for (const i of sorted) byId.set(i.menuItemID, i);
  const roots = sorted.filter((i) => i.parentMenuItemID === null);
  return roots.map((root) => ({
    parent: root,
    children: sorted.filter((i) => i.parentMenuItemID === root.menuItemID),
  }));
};

export const RolePermissionsEditor: React.FC<Props> = ({
  role,
  menuItems,
  initialPermissions,
  loading,
  onSaved,
}) => {
  const { showToast } = useToastContext();
  const access = useAccessContext();
  const [draft, setDraft] = useState<AccessPermissionsMap>(initialPermissions);
  const [serverError, setServerError] = useState<string | null>(null);

  const saveCb = useApiCallback(
    async (
      api,
      args: { roleId: string; params: UpdateRolePermissionsParams },
    ) => await api.access.updateRolePermissions(args.roleId, args.params),
  );

  useEffect(() => {
    setDraft(initialPermissions);
    setServerError(null);
  }, [initialPermissions, role.roleID]);

  const grouped = useMemo(() => groupItems(menuItems), [menuItems]);
  const isDirty = !equalMaps(draft, initialPermissions);

  const togglePerm = (
    key: string,
    action: keyof PermissionDto,
    value: boolean,
  ) => {
    setDraft((prev) => setPerm(prev, key, action, value));
    setServerError(null);
  };

  const toggleAll = (
    key: string,
    value: boolean,
    childKeys: string[] = [],
  ) => {
    setDraft((prev) => {
      let next = setBulkForKey(prev, key, value);
      for (const childKey of childKeys) {
        next = setBulkForKey(next, childKey, value);
      }
      return next;
    });
    setServerError(null);
  };

  const handleSave = async () => {
    setServerError(null);
    try {
      const result = await saveCb.execute({
        roleId: role.roleID,
        params: { permissions: draft },
      });
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success
      ) {
        const next = result.data.response?.permissions ?? draft;
        showToast(`Permissions saved for ${role.name}`, "success");
        onSaved(next);
        if (access.role?.roleID === role.roleID) access.refresh();
        return;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to save permissions";
      setServerError(message);
    } catch (error) {
      console.error("Error saving permissions:", error);
      const status = (error as string[] & { status?: number }).status;
      if (status === 409) {
        const first =
          Array.isArray(error) && typeof error[0] === "string"
            ? (error[0] as string)
            : "You cannot lock yourself out of admin.";
        setServerError(first);
        return;
      }
      const first =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to save permissions";
      setServerError(first);
    }
  };

  return (
    <Flex direction="column" gap="4">
      <Card variant="surface" size="2">
        <Flex
          align={{ initial: "stretch", md: "center" }}
          justify="between"
          gap="3"
          direction={{ initial: "column", md: "row" }}
        >
          <Box>
            <Flex align="center" gap="2">
              <Heading size="4">{role.name}</Heading>
              {role.isSystem && (
                <Badge color="gray" variant="surface" radius="full">
                  System
                </Badge>
              )}
              <Badge
                color={role.isActive ? "green" : "gray"}
                variant="soft"
                radius="full"
              >
                {role.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge color="iris" variant="soft" radius="full">
                Level {role.level}
              </Badge>
            </Flex>
            <Text size="2" color="gray">
              {role.description ||
                "Toggle view / create / edit / delete on each menu item."}
            </Text>
          </Box>
          <Flex align="center" gap="2">
            {isDirty && (
              <Badge color="amber" variant="soft" radius="full">
                Unsaved changes
              </Badge>
            )}
            <Button
              type="Secondary"
              onClick={() => setDraft(initialPermissions)}
              disabled={!isDirty || saveCb.loading}
            >
              <Flex align="center" gap="2">
                <Restore fontSize="small" />
                Discard
              </Flex>
            </Button>
            <Button
              type="Primary"
              onClick={handleSave}
              disabled={!isDirty || saveCb.loading}
              loading={saveCb.loading}
            >
              <Flex align="center" gap="2">
                <CheckCircleOutlined fontSize="small" />
                Save permissions
              </Flex>
            </Button>
          </Flex>
        </Flex>

        {serverError && (
          <Box mt="3">
            <Callout.Root color="red" variant="surface">
              <Callout.Icon>
                <LockOutlined fontSize="small" />
              </Callout.Icon>
              <Callout.Text>{serverError}</Callout.Text>
            </Callout.Root>
          </Box>
        )}
      </Card>

      {loading && grouped.length === 0 ? (
        <Flex align="center" justify="center" py="9">
          <Text color="gray">Loading permissions…</Text>
        </Flex>
      ) : grouped.length === 0 ? (
        <Callout.Root color="amber" variant="surface">
          <Callout.Icon>
            <InfoOutlined fontSize="small" />
          </Callout.Icon>
          <Callout.Text>
            No menu items configured. Add some under the Menu Items sub-tab.
          </Callout.Text>
        </Callout.Root>
      ) : (
        <Card variant="surface" size="2" style={{ overflow: "hidden" }}>
          <PermissionsTable
            grouped={grouped}
            draft={draft}
            onToggle={togglePerm}
            onToggleAll={toggleAll}
          />
        </Card>
      )}
    </Flex>
  );
};

interface TableProps {
  grouped: GroupedRow[];
  draft: AccessPermissionsMap;
  onToggle: (
    key: string,
    action: keyof PermissionDto,
    value: boolean,
  ) => void;
  onToggleAll: (key: string, value: boolean, childKeys?: string[]) => void;
}

const PermissionsTable: React.FC<TableProps> = ({
  grouped,
  draft,
  onToggle,
  onToggleAll,
}) => {
  return (
    <Box style={{ width: "100%" }}>
      <Flex
        align="center"
        gap="3"
        p="3"
        style={{
          borderBottom: "1px solid var(--gray-a4)",
          background: "var(--gray-a2)",
          fontWeight: 600,
          fontSize: 13,
          color: "var(--gray-11)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        <Box style={{ flex: 1, minWidth: 0 }}>Menu Item</Box>
        {ACTIONS.map((a) => (
          <Box
            key={a.key}
            style={{
              width: 88,
              textAlign: "center",
              flexShrink: 0,
            }}
          >
            {a.label}
          </Box>
        ))}
        <Box style={{ width: 64, flexShrink: 0, textAlign: "center" }}>All</Box>
      </Flex>

      {grouped.map((group, idx) => {
        const childKeys = group.children.map((c) => c.permissionKey);
        return (
          <React.Fragment key={group.parent.menuItemID}>
            {idx > 0 && <Separator size="4" />}
            <PermissionRow
              item={group.parent}
              depth={0}
              draft={draft}
              onToggle={onToggle}
              onToggleAll={onToggleAll}
              childKeys={childKeys}
            />
            {group.children.map((child) => (
              <PermissionRow
                key={child.menuItemID}
                item={child}
                depth={1}
                draft={draft}
                onToggle={onToggle}
                onToggleAll={onToggleAll}
              />
            ))}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

interface RowProps {
  item: MenuItemDto;
  depth: number;
  draft: AccessPermissionsMap;
  onToggle: (
    key: string,
    action: keyof PermissionDto,
    value: boolean,
  ) => void;
  onToggleAll: (key: string, value: boolean, childKeys?: string[]) => void;
  childKeys?: string[];
}

const PermissionRow: React.FC<RowProps> = ({
  item,
  depth,
  draft,
  onToggle,
  onToggleAll,
  childKeys,
}) => {
  const perm = getPerm(draft, item.permissionKey);
  const allOn = ACTIONS.every((a) => perm[a.key]);
  const noneOn = ACTIONS.every((a) => !perm[a.key]);
  const Icon = resolveIcon(item.iconName);

  return (
    <Flex
      align="center"
      gap="3"
      p="3"
      style={{
        paddingLeft: 12 + depth * 24,
        background: depth === 1 ? "var(--gray-a1)" : undefined,
      }}
    >
      <Flex align="center" gap="2" style={{ flex: 1, minWidth: 0 }}>
        <Box
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-2)",
            background:
              depth === 0 ? "var(--accent-a3)" : "var(--gray-a3)",
            color:
              depth === 0 ? "var(--accent-11)" : "var(--gray-11)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon style={{ fontSize: 18 }} />
        </Box>
        <Box style={{ minWidth: 0 }}>
          <Text size="2" weight={depth === 0 ? "bold" : "medium"} as="div" truncate>
            {item.label}
          </Text>
          <Text
            size="1"
            color="gray"
            as="div"
            style={{ fontFamily: "monospace" }}
          >
            {item.permissionKey}
          </Text>
        </Box>
      </Flex>

      {ACTIONS.map((a) => (
        <Box
          key={a.key}
          style={{
            width: 88,
            display: "flex",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Checkbox
            size="2"
            checked={perm[a.key]}
            onCheckedChange={(checked) =>
              onToggle(item.permissionKey, a.key, checked === true)
            }
          />
        </Box>
      ))}

      <Box
        style={{
          width: 64,
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Checkbox
          size="2"
          color={allOn ? "green" : noneOn ? "gray" : "amber"}
          checked={allOn ? true : noneOn ? false : "indeterminate"}
          onCheckedChange={(checked) =>
            onToggleAll(item.permissionKey, checked === true, childKeys)
          }
        />
      </Box>
    </Flex>
  );
};
