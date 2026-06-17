import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Dialog,
  Flex,
  ScrollArea,
  Separator,
  Text,
} from "@radix-ui/themes";
import { useRouter } from "next/router";
import { useFilteredMenu } from "../menu/hooks/useFilteredMenu";
import { useOfflineMode, usePageLoaderContext } from "../../core/contexts";
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
  const { startContentTransition } = usePageLoaderContext();
  const { openTab } = useTabsNavigation();
  const { mainMenu, secondaryMenu } = useFilteredMenu(roleName);
  const [sheetItem, setSheetItem] = useState<MenuItem | null>(null);

  const allItems = useMemo(
    () => [...mainMenu, ...secondaryMenu],
    [mainMenu, secondaryMenu],
  );

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
      if (item.nestedItems?.some((n) => n.path && isPathActive(n.path)))
        return true;
      return false;
    },
    [isPathActive],
  );

  const isOfflineBlocked = useCallback(
    (path: string | undefined) =>
      !isOnline &&
      !!path &&
      !OFFLINE_ALLOWED_PATHS.some((allowed) => path?.startsWith(allowed)),
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

  return (
    <>
      <Box
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "var(--color-panel-solid)",
          borderTop: "1px solid var(--gray-a5)",
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
                title={
                  blocked
                    ? "Available when online"
                    : item.nestedItems
                      ? item.text
                      : item.text
                }
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
                  padding: "4px 12px",
                  borderRadius: "var(--radius-3)",
                  background: active ? "var(--accent-a3)" : undefined,
                  minWidth: 0,
                  color: active ? "var(--accent-11)" : "var(--gray-11)",
                  transition: "background 200ms ease, color 200ms ease",
                }}
              >
                <Box
                  style={{
                    width: 22,
                    height: 22,
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
                  size="1"
                  weight={active ? "bold" : "regular"}
                  style={{ color: "inherit", whiteSpace: "nowrap" }}
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
            borderRadius: "16px 16px 0 0",
            background: "var(--color-panel-solid)",
          }}
        >
          <Dialog.Title>
            <Flex
              align="center"
              gap="2"
              px="4"
              py="3"
              style={{
                borderBottom: "1px solid var(--gray-a4)",
              }}
            >
              <Box
                style={{
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-11)",
                }}
              >
                {sheetItem?.icon}
              </Box>
              <Text size="3" weight="bold">
                {sheetItem?.text}
              </Text>
            </Flex>
          </Dialog.Title>

          <ScrollArea
            scrollbars="vertical"
            style={{ maxHeight: "calc(50vh - 56px)" }}
          >
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
                      padding: "10px 12px",
                      borderRadius: "var(--radius-3)",
                      cursor: nestedBlocked ? "not-allowed" : "pointer",
                      opacity: nestedBlocked ? 0.4 : 1,
                      background: isNestedActive
                        ? "var(--accent-a3)"
                        : undefined,
                      color: isNestedActive
                        ? "var(--accent-11)"
                        : "var(--gray-11)",
                      transition: "background 200ms ease, color 200ms ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isNestedActive)
                        e.currentTarget.style.background = "var(--gray-a3)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isNestedActive)
                        e.currentTarget.style.background = "";
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
                      weight={isNestedActive ? "bold" : "regular"}
                      style={{ color: "inherit" }}
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
