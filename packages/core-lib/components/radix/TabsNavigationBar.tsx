import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, ContextMenu, Text } from "@radix-ui/themes";
import { Cross2Icon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { NavTab, useTabsNavigation } from "../../core/contexts/TabsNavigationContext";
import { useFilteredMenu } from "../menu/hooks/useFilteredMenu";

const BAR_HEIGHT = 50;
const TAB_HEIGHT_ACTIVE = 34;
const TAB_HEIGHT_INACTIVE = 32;

interface SingleTabProps {
  tab: NavTab;
  icon?: React.ReactNode;
  isActive: boolean;
  tabIndex: number;
  allTabs: NavTab[];
  onActivate: (path: string) => void;
  onClose: (path: string, e: React.MouseEvent) => void;
  closeOtherTabs: (path: string) => void;
  closeTabsToRight: (path: string) => void;
  closeAllTabs: () => void;
  closeTab: (path: string) => void;
  tabRef?: (el: HTMLDivElement | null) => void;
}

const SingleTab: React.FC<SingleTabProps> = ({
  tab,
  icon,
  isActive,
  tabIndex,
  allTabs,
  onActivate,
  onClose,
  closeOtherTabs,
  closeTabsToRight,
  closeAllTabs,
  closeTab,
  tabRef,
}) => {
  const [hovered, setHovered] = useState(false);

  const hasOtherClosableTabs = allTabs.some((t) => t.closable && t.path !== tab.path);
  const hasTabsToRight = allTabs.slice(tabIndex + 1).some((t) => t.closable);
  const hasAnyClosableTab = allTabs.some((t) => t.closable);

  const tabHeight = isActive ? TAB_HEIGHT_ACTIVE : TAB_HEIGHT_INACTIVE;

  const tabStyle: React.CSSProperties = isActive
    ? {
      height: tabHeight,
      background: "var(--color-panel-solid)",
      borderTop: "2px solid var(--accent-9)",
      borderLeft: "1px solid var(--gray-a4)",
      borderRight: "1px solid var(--gray-a4)",
      borderBottom: "none",
      color: "var(--accent-11)",
    }
    : {
      height: tabHeight,
      background: hovered ? "var(--gray-a3)" : "transparent",
      borderTop: `1px solid ${hovered ? "var(--gray-a4)" : "transparent"}`,
      borderLeft: `1px solid ${hovered ? "var(--gray-a4)" : "transparent"}`,
      borderRight: `1px solid ${hovered ? "var(--gray-a4)" : "transparent"}`,
      borderBottom: "none",
      color: "var(--gray-11)",
    };

  return (
    <motion.div
      layout
      ref={tabRef}
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -4 }}
      transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
      style={{ flexShrink: 0, alignSelf: "flex-end", position: 'relative', zIndex: isActive ? 2 : 1, }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <div
            onClick={() => onActivate(tab.path)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "0 8px 0 10px",
              maxWidth: 180,
              minWidth: 72,
              cursor: "pointer",
              userSelect: "none",
              borderRadius: "var(--radius-2) var(--radius-2) 0 0",
              transition: "background 120ms ease, border-color 120ms ease",
              ...tabStyle,
            }}
          >
            {/* Icon */}
            {icon && (
              <Box
                style={{
                  display: "inline-flex",
                  flexShrink: 0,
                  fontSize: 14,
                  opacity: isActive ? 1 : 0.65,
                  color: isActive ? "var(--accent-11)" : "var(--gray-11)",
                }}
              >
                {icon}
              </Box>
            )}

            {/* Label */}
            <Text
              size="1"
              weight={isActive ? "bold" : "regular"}
              style={{
                color: "inherit",
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </Text>

            {/* Close button */}
            {tab.closable && (
              <motion.div
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.1 }}
                onClick={(e) => onClose(tab.path, e)}
                style={{
                  width: 14,
                  height: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  opacity: hovered || isActive ? 0.6 : 0,
                  transition: "opacity 120ms ease, color 120ms ease",
                  cursor: "pointer",
                  color: "var(--gray-11)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = "1";
                  (e.currentTarget as HTMLElement).style.color = "var(--red-9)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity =
                    hovered || isActive ? "0.6" : "0";
                  (e.currentTarget as HTMLElement).style.color = "var(--gray-11)";
                }}
              >
                <Cross2Icon width={9} height={9} />
              </motion.div>
            )}
          </div>
        </ContextMenu.Trigger>

        <ContextMenu.Content size="1">
          {tab.closable && (
            <ContextMenu.Item onSelect={() => closeTab(tab.path)}>
              Close
            </ContextMenu.Item>
          )}
          {tab.closable && hasOtherClosableTabs && (
            <ContextMenu.Item onSelect={() => closeOtherTabs(tab.path)}>
              Close Others
            </ContextMenu.Item>
          )}
          {hasTabsToRight && (
            <ContextMenu.Item onSelect={() => closeTabsToRight(tab.path)}>
              Close to the Right
            </ContextMenu.Item>
          )}
          {hasAnyClosableTab && (
            <ContextMenu.Item onSelect={closeAllTabs}>
              Close All Tabs
            </ContextMenu.Item>
          )}
          <ContextMenu.Separator />
          <ContextMenu.Item
            onSelect={() => {
              if (typeof navigator !== "undefined") {
                navigator.clipboard.writeText(tab.path).catch(() => { });
              }
            }}
          >
            Copy Path
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
    </motion.div>
  );
};

interface TabsNavigationBarProps {
  role?: string;
}

export const TabsNavigationBar: React.FC<TabsNavigationBarProps> = ({ role }) => {
  const { tabs, closeTab, closeOtherTabs, closeTabsToRight, closeAllTabs } =
    useTabsNavigation();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevTabCount = useRef(tabs.length);

  // Derive path → icon map from the live menu (same source as the sidebar)
  const { mainMenu, secondaryMenu } = useFilteredMenu(role ?? "");
  const pathIconMap = useMemo(() => {
    const map: Record<string, React.ReactNode> = {};
    [...mainMenu, ...secondaryMenu].forEach((item) => {
      if (item.path) map[item.path] = item.icon;
      item.nestedItems?.forEach((n) => {
        if (n.path) map[n.path] = n.icon;
      });
    });
    return map;
  }, [mainMenu, secondaryMenu]);

  // Auto-scroll to newly added tab
  useEffect(() => {
    if (tabs.length > prevTabCount.current) {
      const lastTab = tabs[tabs.length - 1];
      if (!lastTab) return;
      const el = tabRefs.current.get(lastTab.path);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", inline: "end", block: "nearest" });
        }, 50);
      }
    }
    prevTabCount.current = tabs.length;
  }, [tabs]);

  // Scroll active tab into view on path change
  useEffect(() => {
    const el = tabRefs.current.get(router.pathname);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
      }, 50);
    }
  }, [router.pathname]);

  const handleActivate = useCallback(
    (path: string) => {
      if (router.pathname !== path) {
        router.push(path);
      }
    },
    [router],
  );

  const handleClose = useCallback(
    (path: string, e: React.MouseEvent) => {
      e.stopPropagation();
      closeTab(path);
    },
    [closeTab],
  );

  if (tabs.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        background: "var(--gray-a2)",
        borderBottom: "1px solid var(--gray-a5)",
        minWidth: 0,
        width: "100%",
        height: BAR_HEIGHT,
        flexShrink: 0,
        paddingLeft: 6,
        paddingTop: 4,
        boxSizing: "border-box",
        position: "relative",
        overflow: "visible",
      }}
    >
      <div
        ref={scrollRef}
        style={{
          flex: "1 1 0",
          minWidth: 0,
          overflow: "auto visible",
          scrollbarWidth: "thin",
          msOverflowStyle: "auto",
          display: "flex",
          alignItems: "flex-end",
          height: BAR_HEIGHT,

          paddingTop: "4px",
          marginTop: "0",

        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            minWidth: "max-content",
            height: BAR_HEIGHT,
          }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {tabs.map((tab, idx) => (
              <SingleTab
                key={tab.path}
                tab={tab}
                icon={pathIconMap[tab.path]}
                isActive={router.pathname === tab.path}
                tabIndex={idx}
                allTabs={tabs}
                onActivate={handleActivate}
                onClose={handleClose}
                closeTab={closeTab}
                closeOtherTabs={closeOtherTabs}
                closeTabsToRight={closeTabsToRight}
                closeAllTabs={closeAllTabs}
                tabRef={(el) => {
                  if (el) tabRefs.current.set(tab.path, el);
                  else tabRefs.current.delete(tab.path);
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};