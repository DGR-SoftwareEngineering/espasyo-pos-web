import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Popover,
  ScrollArea,
  Spinner,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import { ChevronRightIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { useRouter } from "../../../core/router";
import { usePageLoaderContext, useOfflineMode } from "../../../core/contexts";
import { useTabsNavigation, deriveLabel } from "../../../core/contexts/TabsNavigationContext";
import { MenuItem } from "../../menu/config/menuConfig";
import { useFilteredMenu } from "../../menu/hooks/useFilteredMenu";

const OFFLINE_ALLOWED_PATHS = ["/cashier/pos", "/cashier/orders"];

interface NestedMenuItemProps {
  item: MenuItem;
  depth: number;
  selectedPath: string;
  openStates: Record<string, boolean>;
  onSelect: (path: string) => void;
  onToggle: (itemId: string) => void;
  offlineBlocked?: boolean;
}

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <Box px="2" pb="1" pt="3">
    <Text
      size="1"
      weight="medium"
      style={{
        color: "var(--gray-10)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {label}
    </Text>
  </Box>
);

const NestedMenuItem: React.FC<NestedMenuItemProps> = ({
  item,
  depth,
  selectedPath,
  openStates,
  onSelect,
  onToggle,
  offlineBlocked = false,
}) => {
  const hasNested = !!item.nestedItems?.length;
  const isOpen = openStates[item.id] || false;
  const isSelected = item.path === selectedPath;
  const hasSelectedChild = item.nestedItems?.some(
    (n) => n.path === selectedPath,
  );
  const active = isSelected || hasSelectedChild;

  const handleClick = () => {
    if (offlineBlocked) return;
    // Navigate if the item has a direct path (even if it also has children)
    if (item.path) onSelect(item.path);
    // Toggle children independently of navigation
    if (hasNested) onToggle(item.id);
  };

  return (
    <Box>
      <Flex
        align="center"
        gap="2"
        role="button"
        tabIndex={0}
        aria-expanded={hasNested ? isOpen : undefined}
        aria-current={isSelected ? "page" : undefined}
        aria-disabled={offlineBlocked}
        title={offlineBlocked ? "Available when online" : undefined}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        style={{
          padding: "7px 10px",
          paddingLeft: 10 + depth * 12,
          borderRadius: "var(--radius-3)",
          cursor: offlineBlocked ? "not-allowed" : "pointer",
          opacity: offlineBlocked ? 0.4 : 1,
          background: active ? "var(--accent-a4)" : undefined,
          color: active ? "var(--accent-11)" : "var(--gray-11)",
          transition: "background 120ms ease",
        }}
        onMouseEnter={(e) => {
          if (!active) e.currentTarget.style.background = "var(--gray-a3)";
        }}
        onMouseLeave={(e) => {
          if (!active) e.currentTarget.style.background = "";
        }}
      >
        <Box
          style={{
            width: 20,
            height: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: active ? "var(--accent-11)" : "var(--gray-11)",
          }}
        >
          {item.icon}
        </Box>
        <Text
          size="2"
          weight={active ? "bold" : "regular"}
          style={{ flex: 1, color: "inherit" }}
        >
          {item.text}
        </Text>
        {hasNested && (
          <Box style={{ display: "inline-flex", color: "var(--gray-10)" }}>
            {isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </Box>
        )}
      </Flex>

      {hasNested && isOpen && (
        <Box mt="1">
          {item.nestedItems!.map((nested) => {
            const isNestedSelected = nested.path === selectedPath;
            return (
              <Flex
                key={nested.id}
                align="center"
                gap="2"
                role="link"
                tabIndex={0}
                aria-current={isNestedSelected ? "page" : undefined}
                onClick={() => onSelect(nested.path)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(nested.path);
                  }
                }}
                style={{
                  padding: "7px 10px",
                  paddingLeft: 10 + (depth + 1) * 12,
                  borderRadius: "var(--radius-3)",
                  cursor: "pointer",
                  background: isNestedSelected ? "var(--accent-a4)" : undefined,
                  color: isNestedSelected
                    ? "var(--accent-11)"
                    : "var(--gray-11)",
                  transition: "background 120ms ease",
                }}
                onMouseEnter={(e) => {
                  if (!isNestedSelected)
                    e.currentTarget.style.background = "var(--gray-a3)";
                }}
                onMouseLeave={(e) => {
                  if (!isNestedSelected) e.currentTarget.style.background = "";
                }}
              >
                <Box
                  style={{
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: "inherit",
                  }}
                >
                  {nested.icon}
                </Box>
                <Text
                  size="2"
                  weight={isNestedSelected ? "bold" : "regular"}
                  style={{ flex: 1, color: "inherit" }}
                >
                  {nested.text}
                </Text>
              </Flex>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

interface CollapsedMenuItemProps {
  item: MenuItem;
  selectedPath: string;
  onSelect: (path: string) => void;
  offlineBlocked?: boolean;
}

const CollapsedMenuItem: React.FC<CollapsedMenuItemProps> = ({
  item,
  selectedPath,
  onSelect,
  offlineBlocked = false,
}) => {
  const hasNested = !!item.nestedItems?.length;
  const isSelected = item.path === selectedPath;
  const hasSelectedChild = item.nestedItems?.some(
    (n) => n.path === selectedPath,
  );
  const active = isSelected || hasSelectedChild;
  const [popoverOpen, setPopoverOpen] = useState(false);

  const trigger = (
    <Flex
      align="center"
      justify="center"
      role="button"
      tabIndex={0}
      aria-current={isSelected ? "page" : undefined}
      aria-disabled={offlineBlocked}
      title={offlineBlocked ? "Available when online" : undefined}
      onClick={() => {
        if (offlineBlocked) return;
        if (item.path) onSelect(item.path);
        else if (hasNested) setPopoverOpen((v) => !v);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (offlineBlocked) return;
          if (item.path) onSelect(item.path);
          else if (hasNested) setPopoverOpen((v) => !v);
        }
      }}
      style={{
        width: 44,
        height: 40,
        borderRadius: "var(--radius-2)",
        cursor: offlineBlocked ? "not-allowed" : "pointer",
        opacity: offlineBlocked ? 0.4 : 1,
        background: active ? "var(--accent-a3)" : undefined,
        color: active ? "var(--accent-11)" : "var(--gray-11)",
        transition: "background 120ms ease",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "var(--gray-a3)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "";
      }}
    >
      <Box style={{ display: "inline-flex", color: "inherit" }}>
        {item.icon}
      </Box>
    </Flex>
  );

  // Parent items with only nested children open a flyout popover.
  if (!item.path && hasNested) {
    return (
      <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Tooltip content={item.text} side="right">
          <Popover.Trigger>{trigger}</Popover.Trigger>
        </Tooltip>
        <Popover.Content side="right" align="start" size="1" style={{ width: 200 }}>
          <Text size="1" weight="bold" color="gray" as="div" mb="2">
            {item.text}
          </Text>
          <Flex direction="column" gap="1">
            {item.nestedItems!.map((nested) => {
              const isNestedSelected = nested.path === selectedPath;
              return (
                <Flex
                  key={nested.id}
                  align="center"
                  gap="2"
                  role="link"
                  tabIndex={0}
                  onClick={() => {
                    onSelect(nested.path);
                    setPopoverOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(nested.path);
                      setPopoverOpen(false);
                    }
                  }}
                  style={{
                    padding: "6px 8px",
                    borderRadius: "var(--radius-2)",
                    cursor: "pointer",
                    background: isNestedSelected ? "var(--accent-a3)" : undefined,
                    color: isNestedSelected ? "var(--accent-11)" : "var(--gray-12)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isNestedSelected)
                      e.currentTarget.style.background = "var(--gray-a2)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isNestedSelected) e.currentTarget.style.background = "";
                  }}
                >
                  <Box style={{ display: "inline-flex", opacity: 0.85 }}>
                    {nested.icon}
                  </Box>
                  <Text size="2" weight={isNestedSelected ? "bold" : "regular"}>
                    {nested.text}
                  </Text>
                </Flex>
              );
            })}
          </Flex>
        </Popover.Content>
      </Popover.Root>
    );
  }

  return (
    <Tooltip content={item.text} side="right">
      {trigger}
    </Tooltip>
  );
};

interface RadixMenuContentProps {
  roleName: string;
  loading?: boolean;
  collapsed?: boolean;
}

export const RadixMenuContent: React.FC<RadixMenuContentProps> = ({
  roleName,
  loading,
  collapsed = false,
}) => {
  const router = useRouter();
  const { startContentTransition } = usePageLoaderContext();
  const { openTab } = useTabsNavigation();
  const { isOnline } = useOfflineMode();
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({});

  const isPathOfflineBlocked = useCallback(
    (path: string | undefined) =>
      !isOnline &&
      !!path &&
      !OFFLINE_ALLOWED_PATHS.some((allowed) => path.startsWith(allowed)),
    [isOnline],
  );

  const { mainMenu, secondaryMenu } = useFilteredMenu(roleName);
  const mainMenuKey = useMemo(
    () =>
      mainMenu
        .map(
          (item) =>
            `${item.id}:${item.path ?? ""}:${(item.nestedItems ?? [])
              .map((n) => `${n.id}=${n.path}`)
              .join(",")}`,
        )
        .join("|"),
    [mainMenu],
  );

  useEffect(() => {
    setSelectedPath(router.pathname);
  }, [router.pathname]);

  useEffect(() => {
    const nextOpen: Record<string, boolean> = {};
    mainMenu.forEach((item) => {
      if (item.nestedItems?.some((n) => n.path === router.pathname)) {
        nextOpen[item.id] = true;
      }
    });
    setOpenStates((prev) => {
      const changed = Object.keys(nextOpen).some(
        (k) => prev[k] !== nextOpen[k],
      );
      return changed ? { ...prev, ...nextOpen } : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname, mainMenuKey]);

  // Build a flat path → label map from all menu items so openTab gets the correct label
  const pathLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    [...mainMenu, ...secondaryMenu].forEach((item) => {
      if (item.path) map[item.path] = item.text;
      item.nestedItems?.forEach((n) => {
        if (n.path) map[n.path] = n.text;
      });
    });
    return map;
  }, [mainMenu, secondaryMenu]);

  const handleSelect = useCallback(
    (path: string) => {
      const label = pathLabelMap[path] ?? deriveLabel(path);
      openTab(path, label);
      setSelectedPath(path);
      startContentTransition();
      router.push(path);
    },
    [router, startContentTransition, openTab, pathLabelMap],
  );

  const handleToggle = useCallback((itemId: string) => {
    setOpenStates((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }, []);

  if (loading) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{ height: "100%", padding: 32 }}
      >
        <Spinner size="3" loading />
      </Flex>
    );
  }

  if (collapsed) {
    return (
      <ScrollArea
        scrollbars="vertical"
        type="hover"
        style={{ height: "100%", width: "100%" }}
      >
        <Flex direction="column" align="center" gap="1" p="2">
          {mainMenu.map((item) => (
            <CollapsedMenuItem
              key={item.id}
              item={item}
              selectedPath={selectedPath}
              onSelect={handleSelect}
              offlineBlocked={isPathOfflineBlocked(item.path)}
            />
          ))}
          {secondaryMenu.length > 0 && (
            <Box
              mt="3"
              pt="2"
              style={{
                width: "100%",
                borderTop: "1px solid var(--gray-a4)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              {secondaryMenu.map((item) => (
                <CollapsedMenuItem
                  key={item.id}
                  item={item}
                  selectedPath={selectedPath}
                  onSelect={handleSelect}
                  offlineBlocked={isPathOfflineBlocked(item.path)}
                />
              ))}
            </Box>
          )}
        </Flex>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea
      scrollbars="vertical"
      type="hover"
      style={{ height: "100%", width: "100%" }}
    >
      <Flex direction="column" gap="1" p="2" style={{ flex: 1 }}>
        {/* Main menu */}
        <Flex direction="column">
          <SectionLabel label="Navigation" />
          <Flex direction="column" gap="0.5">
            {mainMenu.map((item) => (
              <NestedMenuItem
                key={item.id}
                item={item}
                depth={0}
                selectedPath={selectedPath}
                openStates={openStates}
                onSelect={handleSelect}
                onToggle={handleToggle}
                offlineBlocked={isPathOfflineBlocked(item.path)}
              />
            ))}
          </Flex>
        </Flex>

        {/* Secondary menu */}
        {secondaryMenu.length > 0 && (
          <Flex direction="column">
            <SectionLabel label="Support" />
            <Flex direction="column" gap="0.5">
              {secondaryMenu.map((item) => {
              const isSelected = item.path === selectedPath;
              return (
                <Flex
                  key={item.id}
                  align="center"
                  gap="2"
                  role="link"
                  tabIndex={0}
                  aria-current={isSelected ? "page" : undefined}
                  onClick={() => item.path && handleSelect(item.path)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      item.path && handleSelect(item.path);
                    }
                  }}
                  style={{
                    padding: "7px 10px",
                    borderRadius: "var(--radius-3)",
                    cursor: "pointer",
                    background: isSelected ? "var(--accent-a4)" : undefined,
                    color: isSelected ? "var(--accent-11)" : "var(--gray-11)",
                    transition: "background 120ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.background = "var(--gray-a3)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "";
                  }}
                >
                  <Box
                    style={{
                      width: 20,
                      height: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: "inherit",
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Text
                    size="2"
                    weight={isSelected ? "bold" : "regular"}
                    style={{ color: "inherit" }}
                  >
                    {item.text}
                  </Text>
                </Flex>
              );
            })}
            </Flex>
          </Flex>
        )}
      </Flex>
    </ScrollArea>
  );
};
