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
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "../../../core/router";
import { usePageLoaderContext, useOfflineMode } from "../../../core/contexts";
import { useTabsNavigation, deriveLabel } from "../../../core/contexts/TabsNavigationContext";
import { MenuItem } from "../../menu/config/menuConfig";
import { useFilteredMenu } from "../../menu/hooks/useFilteredMenu";

const OFFLINE_ALLOWED_PATHS = ["/cashier/pos", "/cashier/orders"];

interface RadixMenuContentProps {
  roleName: string;
  loading?: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
  isDark?: boolean;
}

const SectionLabel: React.FC<{ label: string; isDark: boolean }> = ({ label, isDark }) => (
  <Box px="2" pb="1" pt="3">
    <Text
      size="1"
      weight="medium"
      style={{
        color: isDark ? "#555" : "#999",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        fontSize: 11,
      }}
    >
      {label}
    </Text>
  </Box>
);

const NavItem: React.FC<{
  icon: React.ReactNode;
  text: string;
  active: boolean;
  hasNested: boolean;
  isOpen: boolean;
  depth: number;
  offlineBlocked: boolean;
  onClick: () => void;
  onToggle?: () => void;
  isDark: boolean;
}> = ({ icon, text, active, hasNested, isOpen, depth, offlineBlocked, onClick, onToggle, isDark }) => {
  const bg = isDark ? "#000" : "#fff";
  const hoverBg = isDark ? "#111" : "#fafafa";
  const activeBg = isDark ? "#111" : "#fafafa";
  const defaultColor = isDark ? "#666" : "#888";
  const activeColor = isDark ? "#fafafa" : "#171717";

  const handleClick = () => {
    if (offlineBlocked) return;
    onClick();
    if (hasNested) onToggle?.();
  };

  return (
    <Flex
      align="center"
      gap="2"
      role="button"
      tabIndex={0}
      aria-expanded={hasNested ? isOpen : undefined}
      aria-current={active ? "page" : undefined}
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
        padding: "7px 12px",
        paddingLeft: depth > 0 ? 12 + depth * 16 : 12,
        margin: "0 4px",
        borderRadius: 6,
        cursor: offlineBlocked ? "not-allowed" : "pointer",
        opacity: offlineBlocked ? 0.4 : 1,
        background: active ? activeBg : undefined,
        color: active ? activeColor : defaultColor,
        transition: "background 100ms ease, color 100ms ease",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "";
      }}
    >
      <Box
        style={{
          width: 18,
          height: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "inherit",
          opacity: active ? 1 : 0.65,
          transition: "opacity 100ms ease",
        }}
      >
        {icon}
      </Box>
      <Text
        size="2"
        weight={active ? "medium" : "regular"}
        style={{ flex: 1, color: "inherit", fontSize: 13 }}
      >
        {text}
      </Text>
      {hasNested && (
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
          style={{ display: "inline-flex", color: isDark ? "#555" : "#bbb", flexShrink: 0 }}
        >
          <ChevronRightIcon width={14} height={14} />
        </motion.div>
      )}
    </Flex>
  );
};

interface NestedMenuItemProps {
  item: MenuItem;
  depth: number;
  selectedPath: string;
  openStates: Record<string, boolean>;
  onSelect: (path: string) => void;
  onToggle: (itemId: string) => void;
  offlineBlocked?: boolean;
  isDark: boolean;
}

const NestedMenuItem: React.FC<NestedMenuItemProps> = ({
  item,
  depth,
  selectedPath,
  openStates,
  onSelect,
  onToggle,
  offlineBlocked = false,
  isDark,
}) => {
  const hasNested = !!item.nestedItems?.length;
  const isOpen = openStates[item.id] || false;
  const isSelected = item.path === selectedPath;
  const hasSelectedChild = item.nestedItems?.some((n) => n.path === selectedPath) ?? false;
  const active = isSelected || hasSelectedChild;

  const handleSelect = () => {
    if (offlineBlocked) return;
    if (item.path) onSelect(item.path);
  };

  const handleToggle = () => {
    if (offlineBlocked) return;
    if (hasNested) onToggle(item.id);
  };

  return (
    <Box>
      <NavItem
        icon={item.icon}
        text={item.text}
        active={active}
        hasNested={hasNested}
        isOpen={isOpen}
        depth={depth}
        offlineBlocked={offlineBlocked}
        onClick={handleSelect}
        onToggle={handleToggle}
        isDark={isDark}
      />

      <AnimatePresence initial={false}>
        {hasNested && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <Box mt="1">
              {item.nestedItems!.map((nested) => (
                <NavItem
                  key={nested.id}
                  icon={nested.icon}
                  text={nested.text}
                  active={nested.path === selectedPath}
                  hasNested={false}
                  isOpen={false}
                  depth={depth + 1}
                  offlineBlocked={false}
                  onClick={() => onSelect(nested.path)}
                  isDark={isDark}
                />
              ))}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

interface CollapsedMenuItemProps {
  item: MenuItem;
  selectedPath: string;
  onSelect: (path: string) => void;
  offlineBlocked?: boolean;
  isDark: boolean;
}

const CollapsedMenuItem: React.FC<CollapsedMenuItemProps> = ({
  item,
  selectedPath,
  onSelect,
  offlineBlocked = false,
  isDark,
}) => {
  const hasNested = !!item.nestedItems?.length;
  const isSelected = item.path === selectedPath;
  const hasSelectedChild = item.nestedItems?.some((n) => n.path === selectedPath);
  const active = isSelected || hasSelectedChild;
  const [popoverOpen, setPopoverOpen] = useState(false);

  const hoverBg = isDark ? "#111" : "#fafafa";
  const activeBg = isDark ? "#111" : "#fafafa";
  const defaultColor = isDark ? "#666" : "#888";
  const activeColor = isDark ? "#fafafa" : "#171717";

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
        borderRadius: 6,
        cursor: offlineBlocked ? "not-allowed" : "pointer",
        opacity: offlineBlocked ? 0.4 : 1,
        background: active ? activeBg : undefined,
        color: active ? activeColor : defaultColor,
        transition: "background 100ms ease, color 100ms ease",
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "";
      }}
    >
      <Box
        style={{
          display: "inline-flex",
          color: "inherit",
          opacity: active ? 1 : 0.65,
          transition: "opacity 100ms ease",
        }}
      >
        {item.icon}
      </Box>
    </Flex>
  );

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
                    borderRadius: 6,
                    cursor: "pointer",
                    background: isNestedSelected ? "var(--gray-a3)" : undefined,
                    color: isNestedSelected ? "var(--gray-12)" : "var(--gray-11)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isNestedSelected) (e.currentTarget as HTMLElement).style.background = "var(--gray-a2)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isNestedSelected) (e.currentTarget as HTMLElement).style.background = "";
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

export const RadixMenuContent: React.FC<RadixMenuContentProps> = ({
  roleName,
  loading,
  collapsed = false,
  onNavigate,
  isDark = false,
}) => {
  const router = useRouter();
  const { startContentTransition } = usePageLoaderContext();
  const { openTab } = useTabsNavigation();
  const { isOnline } = useOfflineMode();
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({});

  const isPathOfflineBlocked = useCallback(
    (path: string | undefined) =>
      !isOnline && !!path && !OFFLINE_ALLOWED_PATHS.some((allowed) => path.startsWith(allowed)),
    [isOnline],
  );

  const { mainMenu, secondaryMenu } = useFilteredMenu(roleName);
  const mainMenuKey = useMemo(
    () => mainMenu.map((item) =>
      `${item.id}:${item.path ?? ""}:${(item.nestedItems ?? []).map((n) => `${n.id}=${n.path}`).join(",")}`
    ).join("|"),
    [mainMenu],
  );

  useEffect(() => {
    setSelectedPath(router.pathname);
  }, [router.pathname]);

  useEffect(() => {
    setOpenStates((prev) => {
      const next = { ...prev };
      mainMenu.forEach((item) => {
        if (item.nestedItems?.some((n) => n.path === router.pathname)) {
          next[item.id] = true;
        }
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname, mainMenuKey]);

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
      onNavigate?.();
    },
    [router, startContentTransition, openTab, pathLabelMap, onNavigate],
  );

  const handleToggle = useCallback((itemId: string) => {
    setOpenStates((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }, []);

  const defaultColor = isDark ? "#666" : "#888";

  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ height: "100%", padding: 32 }}>
        <Spinner size="3" loading />
      </Flex>
    );
  }

  if (collapsed) {
    return (
      <ScrollArea scrollbars="vertical" type="hover" style={{ height: "100%", width: "100%" }}>
        <Flex direction="column" align="center" gap="1" p="2">
          {mainMenu.map((item) => (
            <CollapsedMenuItem
              key={item.id}
              item={item}
              selectedPath={selectedPath}
              onSelect={handleSelect}
              offlineBlocked={isPathOfflineBlocked(item.path)}
              isDark={isDark}
            />
          ))}
          {secondaryMenu.length > 0 && (
            <Box
              mt="3"
              pt="2"
              style={{
                width: "100%",
                borderTop: `1px solid ${isDark ? "#222" : "#eaeaea"}`,
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
                  isDark={isDark}
                />
              ))}
            </Box>
          )}
        </Flex>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea scrollbars="vertical" type="hover" style={{ height: "100%", width: "100%" }}>
      <Flex direction="column" gap="1" p="2" style={{ flex: 1 }}>
        <Flex direction="column">
          <SectionLabel label="Navigation" isDark={isDark} />
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
                isDark={isDark}
              />
            ))}
          </Flex>
        </Flex>

        <Box mx="2" my="1" style={{ height: 1, background: isDark ? "#222" : "#eaeaea", flexShrink: 0 }} />

        {secondaryMenu.length > 0 && (
          <Flex direction="column">
            <SectionLabel label="Support" isDark={isDark} />
            <Flex direction="column" gap="0.5">
              {secondaryMenu.map((item) => {
                const isSelected = item.path === selectedPath;
                const activeBg = isDark ? "#111" : "#fafafa";
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
                      padding: "7px 12px",
                      margin: "0 4px",
                      borderRadius: 6,
                      cursor: "pointer",
                      background: isSelected ? activeBg : undefined,
                      color: isSelected ? (isDark ? "#fafafa" : "#171717") : defaultColor,
                      transition: "background 100ms ease, color 100ms ease",
                      userSelect: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLElement).style.background = isDark ? "#111" : "#fafafa";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLElement).style.background = "";
                    }}
                  >
                    <Box
                      style={{
                        width: 18,
                        height: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: "inherit",
                        opacity: isSelected ? 1 : 0.65,
                        transition: "opacity 100ms ease",
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Text
                      size="2"
                      weight={isSelected ? "medium" : "regular"}
                      style={{ color: "inherit", fontSize: 13 }}
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
