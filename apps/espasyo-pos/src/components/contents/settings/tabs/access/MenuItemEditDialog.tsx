import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Callout,
  Dialog,
  Flex,
  Select,
  Text,
  TextField,
} from "@radix-ui/themes";
import { InfoOutlined, WarningAmberOutlined } from "@mui/icons-material";
import { useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import {
  CreateMenuItemParams,
  MenuItemDto,
  MenuItemGroup,
  UpdateMenuItemParams,
} from "core-lib/api/access/types";
import { Button } from "core-lib/components/radix/buttons/Button";
import { ICON_NAMES, resolveIcon } from "core-lib/components/menu/icons";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuItemDto | null;
  allItems: MenuItemDto[];
  onSaved: () => void;
}

const GROUPS: MenuItemGroup[] = ["primary", "secondary"];

export const MenuItemEditDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  item,
  allItems,
  onSaved,
}) => {
  const { showToast } = useToastContext();
  const [permissionKey, setPermissionKey] = useState("");
  const [label, setLabel] = useState("");
  const [iconName, setIconName] = useState("List");
  const [path, setPath] = useState("");
  const [parentMenuItemID, setParentMenuItemID] = useState<string>("none");
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [group, setGroup] = useState<MenuItemGroup>("primary");

  const createCb = useApiCallback(
    async (api, args: CreateMenuItemParams) =>
      await api.access.createMenuItem(args),
  );
  const updateCb = useApiCallback(
    async (api, args: UpdateMenuItemParams) =>
      await api.access.updateMenuItem(args),
  );

  useEffect(() => {
    if (!open) return;
    if (item) {
      setPermissionKey(item.permissionKey);
      setLabel(item.label);
      setIconName(item.iconName);
      setPath(item.path ?? "");
      setParentMenuItemID(item.parentMenuItemID ?? "none");
      setDisplayOrder(item.displayOrder);
      setGroup(item.group);
    } else {
      setPermissionKey("");
      setLabel("");
      setIconName("List");
      setPath("");
      setParentMenuItemID("none");
      setDisplayOrder(0);
      setGroup("primary");
    }
  }, [open, item]);

  const parentOptions = allItems
    .filter(
      (i) => i.parentMenuItemID === null && (!item || i.menuItemID !== item.menuItemID),
    )
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const selectedParent = useMemo(
    () =>
      parentMenuItemID === "none"
        ? null
        : (allItems.find((i) => i.menuItemID === parentMenuItemID) ?? null),
    [allItems, parentMenuItemID],
  );

  const expectedPrefix = selectedParent
    ? `${selectedParent.permissionKey}.nested.`
    : null;

  const keyValidation = useMemo<{
    state: "ok" | "needs-prefix" | "should-not-be-nested";
    message: string | null;
    suggestion: string | null;
  }>(() => {
    const trimmed = permissionKey.trim();
    if (!trimmed) return { state: "ok", message: null, suggestion: null };
    if (expectedPrefix) {
      if (!trimmed.startsWith(expectedPrefix)) {
        const tail = trimmed.includes(".nested.")
          ? (trimmed.split(".nested.").pop() ?? trimmed)
          : trimmed.replace(/^.*\./, "");
        return {
          state: "needs-prefix",
          message: `Nested keys must start with "${expectedPrefix}".`,
          suggestion: `${expectedPrefix}${tail}`,
        };
      }
    } else if (trimmed.includes(".nested.")) {
      return {
        state: "should-not-be-nested",
        message:
          "A top-level (no parent) key should not contain '.nested.'. Pick a parent or rename the key.",
        suggestion: null,
      };
    }
    return { state: "ok", message: null, suggestion: null };
  }, [permissionKey, expectedPrefix]);

  const applySuggestion = () => {
    if (keyValidation.suggestion) {
      setPermissionKey(keyValidation.suggestion);
    }
  };

  const handleSubmit = async () => {
    if (!permissionKey.trim() || !label.trim()) {
      showToast("Permission key and label are required", "error");
      return;
    }
    if (keyValidation.state !== "ok") {
      showToast(keyValidation.message ?? "Fix the permission key first", "error");
      return;
    }
    try {
      const cleanParent =
        parentMenuItemID === "none" ? undefined : parentMenuItemID;
      const cleanPath = path.trim() || undefined;
      const result = item
        ? await updateCb.execute({
            menuItemID: item.menuItemID,
            permissionKey: permissionKey.trim(),
            label: label.trim(),
            iconName,
            path: cleanPath,
            parentMenuItemID: cleanParent,
            displayOrder,
            group,
          })
        : await createCb.execute({
            permissionKey: permissionKey.trim(),
            label: label.trim(),
            iconName,
            path: cleanPath,
            parentMenuItemID: cleanParent,
            displayOrder,
            group,
          });
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success
      ) {
        showToast(item ? "Menu item updated" : "Menu item created", "success");
        onSaved();
        return;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to save menu item";
      showToast(message, "error");
    } catch (error) {
      console.error("Error saving menu item:", error);
      const first =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to save menu item";
      showToast(first, "error");
    }
  };

  const loading = createCb.loading || updateCb.loading;
  const PreviewIcon = resolveIcon(iconName);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 560 }}>
        <Dialog.Title>{item ? "Edit menu item" : "New menu item"}</Dialog.Title>
        <Dialog.Description size="2" color="gray">
          Sidebar entries are keyed by a stable{" "}
          <Text weight="medium" size="2" color="gray">
            permissionKey
          </Text>{" "}
          string. Renaming labels or rerouting paths won't break role
          permissions.
        </Dialog.Description>

        <Flex direction="column" gap="3" mt="4">
          <Flex gap="3">
            <Box style={{ flex: 1 }}>
              <Text size="2" weight="medium" as="div" mb="1">
                Permission key
              </Text>
              <TextField.Root
                size="3"
                value={permissionKey}
                placeholder={
                  expectedPrefix
                    ? `${expectedPrefix}…`
                    : "e.g. reports or reports.nested.daily"
                }
                color={keyValidation.state === "ok" ? undefined : "red"}
                onChange={(e) => setPermissionKey(e.target.value)}
              />
              {keyValidation.state === "ok" && expectedPrefix && (
                <Text size="1" color="gray" as="div" mt="1">
                  Will be saved under{" "}
                  <Text
                    size="1"
                    weight="medium"
                    style={{ fontFamily: "monospace" }}
                  >
                    {expectedPrefix}
                  </Text>
                  <Text size="1" color="gray">
                    {"<tail>"}
                  </Text>
                  .
                </Text>
              )}
              {keyValidation.state !== "ok" && (
                <Box mt="1">
                  <Callout.Root
                    color={
                      keyValidation.state === "needs-prefix" ? "amber" : "red"
                    }
                    variant="surface"
                    size="1"
                  >
                    <Callout.Icon>
                      {keyValidation.state === "needs-prefix" ? (
                        <InfoOutlined fontSize="small" />
                      ) : (
                        <WarningAmberOutlined fontSize="small" />
                      )}
                    </Callout.Icon>
                    <Callout.Text>
                      {keyValidation.message}
                      {keyValidation.suggestion && (
                        <>
                          {" "}
                          <Text
                            size="1"
                            weight="medium"
                            style={{
                              cursor: "pointer",
                              color: "var(--accent-11)",
                              textDecoration: "underline",
                            }}
                            onClick={applySuggestion}
                          >
                            Use {keyValidation.suggestion}
                          </Text>
                        </>
                      )}
                    </Callout.Text>
                  </Callout.Root>
                </Box>
              )}
            </Box>
            <Box style={{ flex: 1 }}>
              <Text size="2" weight="medium" as="div" mb="1">
                Label
              </Text>
              <TextField.Root
                size="3"
                value={label}
                placeholder="e.g. Daily Reports"
                onChange={(e) => setLabel(e.target.value)}
              />
            </Box>
          </Flex>

          <Flex gap="3" align="end">
            <Box style={{ flex: 1 }}>
              <Text size="2" weight="medium" as="div" mb="1">
                Icon
              </Text>
              <Select.Root value={iconName} onValueChange={setIconName}>
                <Select.Trigger style={{ width: "100%" }} />
                <Select.Content>
                  {ICON_NAMES.map((name) => (
                    <Select.Item key={name} value={name}>
                      {name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>
            <Box
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-3)",
                background: "var(--accent-a3)",
                color: "var(--accent-11)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PreviewIcon style={{ fontSize: 22 }} />
            </Box>
          </Flex>

          <Box>
            <Text size="2" weight="medium" as="div" mb="1">
              Path (optional)
            </Text>
            <TextField.Root
              size="3"
              value={path}
              placeholder="e.g. /admin/hub/reports/daily"
              onChange={(e) => setPath(e.target.value)}
            />
            <Text size="1" color="gray" as="div" mt="1">
              Leave empty for parent items that only contain children.
            </Text>
          </Box>

          <Flex gap="3">
            <Box style={{ flex: 1 }}>
              <Text size="2" weight="medium" as="div" mb="1">
                Parent
              </Text>
              <Select.Root
                value={parentMenuItemID}
                onValueChange={setParentMenuItemID}
              >
                <Select.Trigger style={{ width: "100%" }} />
                <Select.Content>
                  <Select.Item value="none">— Top-level —</Select.Item>
                  {parentOptions.map((p) => (
                    <Select.Item key={p.menuItemID} value={p.menuItemID}>
                      {p.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>
            <Box style={{ flex: 1 }}>
              <Text size="2" weight="medium" as="div" mb="1">
                Group
              </Text>
              <Select.Root
                value={group}
                onValueChange={(v) => setGroup(v as MenuItemGroup)}
              >
                <Select.Trigger style={{ width: "100%" }} />
                <Select.Content>
                  {GROUPS.map((g) => (
                    <Select.Item key={g} value={g}>
                      {g}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>
            <Box style={{ width: 120 }}>
              <Text size="2" weight="medium" as="div" mb="1">
                Order
              </Text>
              <TextField.Root
                size="3"
                type="number"
                value={String(displayOrder)}
                onChange={(e) =>
                  setDisplayOrder(parseInt(e.target.value, 10) || 0)
                }
              />
            </Box>
          </Flex>
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
            disabled={loading || keyValidation.state !== "ok"}
          >
            {item ? "Save changes" : "Create menu item"}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
