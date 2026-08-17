import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Dialog,
  Flex,
  ScrollArea,
  Text,
} from "@radix-ui/themes";
import { useRouter } from "next/router";
import { useFilteredMenu } from "../menu/hooks/useFilteredMenu";
import { useOfflineMode, usePageLoaderContext } from "../../core/contexts";
import { useThemePreference } from "../../core/contexts/theme/ThemePreferenceContext";
import { useTabsNavigation, deriveLabel } from "../../core/contexts/TabsNavigationContext";
import { MenuItem } from "../menu/config/menuConfig";

interface BottomNavProps {
  roleName: string;
  loading?: boolean;
}

const OFFLINE_ALLOWED_PATHS = ["/cashier/pos", "/cashier/orders"];

export const BottomNav: React.FC<BottomNavProps> = ({ roleName, loading }) => {
  const router = useRouter();
  const { isOnline } = useOfflineMode();
  const { appearance } = useThemePreference();
  const isDark = appearance === "dark";
  const { startContentTransition } = usePageLoaderContext();
  const { openTab } = useTabsNavigation();
  const { mainMenu, secondaryMenu } = useFilteredMenu(roleName);
  const [sheetItem, setSheetItem] = useState<MenuItem | null>(null);

  const allItems = useMemo(() => [...mainMenu, ...secondaryMenu], [mainMenu, secondaryMenu]);

  const isPathActive = useCallback(
    (path: string | undefined) => {
      if (!path) return false;
      return router.pathname.startsWith(path);
    },
    [router.pathname],
  );

  const isItemActive = useCallback(
    (item: MenuItem): boolean => {
      if (item.path && isPathActive(item.path)) return true;
      if (item.nestedItems?.some((n) => n.path && isPathActive(n.path))) return true;
      return false;
    },
    [isPathActive],
  );

  const isOfflineBlocked = useCallback(
    (path: string | undefined) =>
      !isOnline && !!path && !OFFLINE_ALLOWED_PATHS.some((allowed) => path?.startsWith(allowed)),
    [isOnline],
  );

  const handleNavigate = useCallback(
    (path: string, label?: string) => {
      setSheetItem(null);
      const tabLabel = label ?? deriveLabel(path);
      openTab(path, tabLabel);
      startContentTransition();
      router.push(path);
    },
    [router, openTab, startContentTransition],
  );

  const handleItemTap = useCallback(
    (item: MenuItem) => {
      if (isOfflineBlocked(item.path)) return;
      if (item.path) {
        handleNavigate(item.path, item.text);
      } else if (item.nestedItems?.length) {
        setSheetItem(item);
      }
    },
    [isOfflineBlocked, handleNavigate],
  );

  const handleNestedTap = useCallback(
    (nested: { path: string; text: string }) => {
      if (isOfflineBlocked(nested.path)) return;
      handleNavigate(nested.path, nested.text);
    },
    [isOfflineBlocked, handleNavigate],
  );

  if (loading || allItems.length === 0) return null;

  const textPrimary = isDark ? "#fafafa" : "#171717";
  const bg = isDark ? "#000" : "#fff";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const dividerColor = isDark ? "#222" : "#eaeaea";
  const defaultColor = isDark ? "#666" : "#888";
  const activeColor = isDark ? "#fafafa" : "#171717";
  const activeBg = isDark ? "#111" : "#fafafa";

  return (
    <>
      <Box
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: bg,
          boxShadow: `0 0 0 1px ${borderColor}`,
          paddingTop: 4,
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 4px)",
        }}
      >
        <style>{`
          .bottom-nav-scrollbar::-webkit-scrollbar { display: none; }
          .bottom-nav-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        `}</style>
        <Flex
          className="bottom-nav-scrollbar"
          gap="1"
          style={{
            overflowX: "auto",
            overflowY: "hidden",
            padding: "0 8px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {allItems.map((item) => {
            const active = isItemActive(item);
            const blocked = !item.path ? false : isOfflineBlocked(item.path);
            const hasNested = !!item.nestedItems?.length;

            return (
              <Flex
                key={item.id}
                direction="column"
                align="center"
                gap="1"
                role="button"
                tabIndex={0}
                aria-current={active ? "page" : undefined}
                title={blocked ? "Available when online" : item.text}
                onClick={() => handleItemTap(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleItemTap(item);
                  }
                }}
                style={{
                  flexShrink: 0,
                  cursor: blocked ? "not-allowed" : "pointer",
                  opacity: blocked ? 0.4 : 1,
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: active ? activeBg : undefined,
                  minWidth: 0,
                  color: active ? activeColor : defaultColor,
                  transition: "background 100ms ease, color 100ms ease",
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
                    opacity: active ? 1 : 0.65,
                    transition: "opacity 100ms ease",
                  }}
                >
                  {item.icon}
                </Box>
                <Text
                  size="1"
                  weight={active ? "medium" : "regular"}
                  style={{ color: "inherit", whiteSpace: "nowrap", fontSize: 10 }}
                >
                  {item.text}
                </Text>
              </Flex>
            );
          })}
        </Flex>
      </Box>

      <Dialog.Root
        open={!!sheetItem}
        onOpenChange={(open) => {
          if (!open) setSheetItem(null);
        }}
      >
        <Dialog.Content
          aria-describedby={undefined}
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            top: "auto",
            transform: "none",
            maxWidth: "100vw",
            width: "100%",
            maxHeight: "50vh",
            margin: 0,
            padding: 0,
            borderRadius: "12px 12px 0 0",
            background: bg,
          }}
        >
          <Dialog.Title>
            <Flex
              align="center"
              gap="2"
              px="4"
              py="3"
              style={{ borderBottom: `1px solid ${dividerColor}` }}
            >
              <Box
                style={{
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: defaultColor,
                }}
              >
                {sheetItem?.icon}
              </Box>
              <Text size="3" weight="bold" style={{ color: textPrimary }}>
                {sheetItem?.text}
              </Text>
            </Flex>
          </Dialog.Title>

          <ScrollArea scrollbars="vertical" style={{ maxHeight: "calc(50vh - 56px)" }}>
            <Flex direction="column" gap="1" p="2">
              {sheetItem?.nestedItems?.map((nested) => {
                const isNestedActive = isPathActive(nested.path);
                const nestedBlocked = isOfflineBlocked(nested.path);

                return (
                  <Flex
                    key={nested.id}
                    align="center"
                    gap="2"
                    role="link"
                    tabIndex={0}
                    aria-current={isNestedActive ? "page" : undefined}
                    aria-disabled={nestedBlocked}
                    title={nestedBlocked ? "Available when online" : undefined}
                    onClick={() => handleNestedTap(nested)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleNestedTap(nested);
                      }
                    }}
                    style={{
                      padding: "8px 12px",
                      margin: "0 4px",
                      borderRadius: 6,
                      cursor: nestedBlocked ? "not-allowed" : "pointer",
                      opacity: nestedBlocked ? 0.4 : 1,
                      background: isNestedActive ? activeBg : undefined,
                      color: isNestedActive ? activeColor : defaultColor,
                      transition: "background 100ms ease, color 100ms ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isNestedActive) (e.currentTarget as HTMLElement).style.background = activeBg;
                    }}
                    onMouseLeave={(e) => {
                      if (!isNestedActive) (e.currentTarget as HTMLElement).style.background = "";
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
                        opacity: isNestedActive ? 1 : 0.65,
                      }}
                    >
                      {nested.icon}
                    </Box>
                    <Text
                      size="2"
                      weight={isNestedActive ? "medium" : "regular"}
                      style={{ color: "inherit", fontSize: 13 }}
                    >
                      {nested.text}
                    </Text>
                  </Flex>
                );
              })}
            </Flex>
          </ScrollArea>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
};
