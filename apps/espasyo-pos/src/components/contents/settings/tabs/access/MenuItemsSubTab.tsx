import React, { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Flex,
  Heading,
  IconButton,
  Separator,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Card,
  Tooltip,
} from "@radix-ui/themes";;
import {
  AddCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  KeyboardArrowDownOutlined,
  KeyboardArrowUpOutlined,
  MenuOpenOutlined,
  SaveOutlined,
} from "@mui/icons-material";
import { useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import { useAccessContext } from "core-lib/core/contexts";
import {
  MenuItemDto,
  ReorderMenuItemParams,
} from "core-lib/api/access/types";
import { Button } from "core-lib/components/radix/buttons/Button";
import { MessageBlock } from "core-lib/components/radix/blocks/messages";
import { MessageType } from "core-lib/components/topAlertMessages/types";
import { resolveIcon } from "core-lib/components/menu/icons";
import { MenuItemEditDialog } from "./MenuItemEditDialog";

interface GroupedRow {
  parent: MenuItemDto;
  children: MenuItemDto[];
}

const groupItems = (items: MenuItemDto[]): GroupedRow[] => {
  const sorted = [...items].sort(
    (a, b) =>
      a.displayOrder - b.displayOrder || a.label.localeCompare(b.label),
  );
  const roots = sorted.filter((i) => i.parentMenuItemID === null);
  return roots.map((root) => ({
    parent: root,
    children: sorted.filter((i) => i.parentMenuItemID === root.menuItemID),
  }));
};

interface Props {
  menuItems: MenuItemDto[];
  menuLoading: boolean;
  refreshMenu: () => Promise<void> | void;
}

export const MenuItemsSubTab: React.FC<Props> = ({
  menuItems,
  menuLoading,
  refreshMenu,
}) => {
  const { showToast } = useToastContext();
  const access = useAccessContext();
  const [draft, setDraft] = useState<MenuItemDto[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItemDto | null>(null);

  const reorderCb = useApiCallback(
    async (api, args: ReorderMenuItemParams) =>
      await api.access.reorderMenuItems(args),
  );
  const deleteCb = useApiCallback(
    async (api, id: string) => await api.access.softDeleteMenuItem(id),
  );

  const items = draft ?? menuItems;
  const groupedPrimary = useMemo(
    () => groupItems(items.filter((i) => i.group === "primary")),
    [items],
  );
  const groupedSecondary = useMemo(
    () => groupItems(items.filter((i) => i.group === "secondary")),
    [items],
  );

  const isDirty = !!draft;

  const swap = (list: MenuItemDto[], from: number, to: number) => {
    if (to < 0 || to >= list.length) return list;
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved as MenuItemDto);
    return next.map((item, idx) => ({
      ...item,
      displayOrder: (idx + 1) * 10,
    }));
  };

  const moveItem = (target: MenuItemDto, direction: "up" | "down") => {
    const peers = items.filter(
      (i) =>
        i.parentMenuItemID === target.parentMenuItemID &&
        i.group === target.group,
    );
    peers.sort((a, b) => a.displayOrder - b.displayOrder);
    const idx = peers.findIndex((i) => i.menuItemID === target.menuItemID);
    if (idx < 0) return;
    const reordered = swap(peers, idx, direction === "up" ? idx - 1 : idx + 1);
    if (reordered === peers) return;
    const reorderedMap = new Map(reordered.map((r) => [r.menuItemID, r]));
    setDraft(
      items.map((i) => {
        const updated = reorderedMap.get(i.menuItemID);
        return updated ? { ...i, displayOrder: updated.displayOrder } : i;
      }),
    );
  };

  const handleSaveOrder = async () => {
    if (!draft) return;
    const payload = draft.map((i) => ({
      menuItemID: i.menuItemID,
      displayOrder: i.displayOrder,
    }));
    try {
      const result = await reorderCb.execute({ items: payload });
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success
      ) {
        showToast(
          `${result.data.response ?? draft.length} item(s) reordered`,
          "success",
        );
        setDraft(null);
        refreshMenu();
        access.refresh();
        return;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to reorder menu";
      showToast(message, "error");
    } catch (error) {
      console.error("Error reordering menu:", error);
      const first =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to reorder menu";
      showToast(first, "error");
    }
  };

  const handleDelete = async (item: MenuItemDto) => {
    if (
      !confirm(
        `Soft-delete menu item "${item.label}"? Active users with view permission will no longer see it.`,
      )
    )
      return;
    try {
      const result = await deleteCb.execute(item.menuItemID);
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success
      ) {
        showToast(`${item.label} deactivated`, "success");
        refreshMenu();
        access.refresh();
        return;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to delete menu item";
      showToast(message, "error");
    } catch (error) {
      console.error("Error deleting menu item:", error);
      const first =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to delete menu item";
      showToast(first, "error");
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
              <MenuOpenOutlined style={{ color: "var(--accent-11)" }} />
              <Heading size="4">Menu Items</Heading>
              <Badge color="gray" variant="soft" radius="full">
                {items.length}
              </Badge>
            </Flex>
            <Text size="2" color="gray">
              Reorder, edit, or add the sidebar entries every role can be
              assigned. Use arrow buttons to reposition within a parent group.
            </Text>
          </Box>
          <Flex align="center" gap="2" wrap="wrap">
            {isDirty && (
              <Badge color="amber" variant="soft" radius="full">
                Reorder pending
              </Badge>
            )}
            <Button
              type="Secondary"
              onClick={() => setDraft(null)}
              disabled={!isDirty || reorderCb.loading}
            >
              Discard order
            </Button>
            <Button
              type="Primary"
              onClick={handleSaveOrder}
              disabled={!isDirty || reorderCb.loading}
              loading={reorderCb.loading}
            >
              <Flex align="center" gap="2">
                <SaveOutlined fontSize="small" />
                Save order
              </Flex>
            </Button>
            <Button
              type="Primary"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Flex align="center" gap="2">
                <AddCircleOutlined fontSize="small" />
                New item
              </Flex>
            </Button>
          </Flex>
        </Flex>
      </Card>

      {menuLoading && menuItems.length === 0 ? (
        <Flex align="center" justify="center" py="9">
          <Text color="gray">Loading menu items…</Text>
        </Flex>
      ) : items.length === 0 ? (
        <MessageBlock
          type={MessageType.Info}
          header="No menu items configured"
          text="Create the first sidebar entry to get started."
        />
      ) : (
        <Flex direction="column" gap="4">
          <GroupCard
            title="Primary group"
            description="Top of the sidebar."
            groups={groupedPrimary}
            onMove={moveItem}
            onEdit={(item) => {
              setEditing(item);
              setDialogOpen(true);
            }}
            onDelete={handleDelete}
          />
          {groupedSecondary.length > 0 && (
            <GroupCard
              title="Secondary group"
              description="Sidebar footer (Settings / About / Feedback)."
              groups={groupedSecondary}
              onMove={moveItem}
              onEdit={(item) => {
                setEditing(item);
                setDialogOpen(true);
              }}
              onDelete={handleDelete}
            />
          )}
        </Flex>
      )}

      <MenuItemEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editing}
        allItems={items}
        onSaved={() => {
          setDialogOpen(false);
          setEditing(null);
          refreshMenu();
          access.refresh();
        }}
      />
    </Flex>
  );
};

interface GroupCardProps {
  title: string;
  description: string;
  groups: GroupedRow[];
  onMove: (item: MenuItemDto, direction: "up" | "down") => void;
  onEdit: (item: MenuItemDto) => void;
  onDelete: (item: MenuItemDto) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  title,
  description,
  groups,
  onMove,
  onEdit,
  onDelete,
}) => (
  <Card variant="surface" size="3">
    <Flex align="center" justify="between" mb="3">
      <Box>
        <Heading size="3">{title}</Heading>
        <Text size="1" color="gray">
          {description}
        </Text>
      </Box>
      <Badge color="gray" variant="soft" radius="full">
        {groups.reduce((acc, g) => acc + 1 + g.children.length, 0)} item(s)
      </Badge>
    </Flex>

    <Flex direction="column" gap="0">
      {groups.map((group, idx) => (
        <React.Fragment key={group.parent.menuItemID}>
          {idx > 0 && <Separator size="4" />}
          <MenuRow
            item={group.parent}
            depth={0}
            onMove={onMove}
            onEdit={onEdit}
            onDelete={onDelete}
          />
          {group.children.map((child) => (
            <MenuRow
              key={child.menuItemID}
              item={child}
              depth={1}
              onMove={onMove}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </React.Fragment>
      ))}
    </Flex>
  </Card>
);

interface RowProps {
  item: MenuItemDto;
  depth: number;
  onMove: (item: MenuItemDto, direction: "up" | "down") => void;
  onEdit: (item: MenuItemDto) => void;
  onDelete: (item: MenuItemDto) => void;
}

const MenuRow: React.FC<RowProps> = ({ item, depth, onMove, onEdit, onDelete }) => {
  const Icon = resolveIcon(item.iconName);
  return (
    <Flex
      align="center"
      gap="3"
      p="3"
      style={{
        paddingLeft: 12 + depth * 28,
        background: depth === 1 ? "var(--gray-a1)" : undefined,
      }}
    >
      <Box
        style={{
          width: 36,
          height: 36,
          borderRadius: "var(--radius-2)",
          background: depth === 0 ? "var(--accent-a3)" : "var(--gray-a3)",
          color: depth === 0 ? "var(--accent-11)" : "var(--gray-11)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon style={{ fontSize: 20 }} />
      </Box>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Flex align="center" gap="2">
          <Text
            size="2"
            weight={depth === 0 ? "bold" : "medium"}
            as="div"
            truncate
          >
            {item.label}
          </Text>
          {!item.isActive && (
            <Badge color="gray" variant="surface" radius="full" size="1">
              Inactive
            </Badge>
          )}
        </Flex>
        <Flex align="center" gap="2">
          <Text
            size="1"
            color="gray"
            as="div"
            style={{ fontFamily: "monospace" }}
            truncate
          >
            {item.permissionKey}
          </Text>
          {item.path && (
            <Text size="1" color="gray" truncate>
              → {item.path}
            </Text>
          )}
        </Flex>
      </Box>

      <Flex align="center" gap="1">
        <Tooltip content="Move up">
          <IconButton
            variant="ghost"
            color="gray"
            size="1"
            onClick={() => onMove(item, "up")}
            aria-label="Move up"
          >
            <KeyboardArrowUpOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip content="Move down">
          <IconButton
            variant="ghost"
            color="gray"
            size="1"
            onClick={() => onMove(item, "down")}
            aria-label="Move down"
          >
            <KeyboardArrowDownOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip content="Edit">
          <IconButton
            variant="ghost"
            color="gray"
            size="2"
            onClick={() => onEdit(item)}
            aria-label="Edit"
          >
            <EditOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip content="Soft-delete">
          <IconButton
            variant="ghost"
            color="red"
            size="2"
            onClick={() => onDelete(item)}
            aria-label="Soft-delete"
          >
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </Flex>
    </Flex>
  );
};
