import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/router";

export interface NavTab {
  path: string;
  label: string;
  closable: boolean;
}

interface TabsNavContextValue {
  tabs: NavTab[];
  openTab: (path: string, label: string) => void;
  closeTab: (path: string) => void;
  closeOtherTabs: (path: string) => void;
  closeTabsToRight: (path: string) => void;
  closeAllTabs: () => void;
}

const TabsNavContext = createContext<TabsNavContextValue>({
  tabs: [],
  openTab: () => {},
  closeTab: () => {},
  closeOtherTabs: () => {},
  closeTabsToRight: () => {},
  closeAllTabs: () => {},
});

export const useTabsNavigation = () => useContext(TabsNavContext);

const STORAGE_KEY = "espasyo.navTabs.v1";

const STANDALONE_ROUTES = ["/", "/cashier/shift/open", "/404"];

export function deriveLabel(path: string): string {
  const segment =
    path
      .split("/")
      .filter(Boolean)
      .pop() ?? "Page";
  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface Props {
  children: React.ReactNode;
  homePath: string;
  homeLabel: string;
}

export const TabsNavigationProvider: React.FC<Props> = ({
  children,
  homePath,
  homeLabel,
}) => {
  const router = useRouter();
  const homeTab: NavTab = { path: homePath, label: homeLabel, closable: false };

  const [tabs, setTabs] = useState<NavTab[]>(() => {
    if (typeof window === "undefined") return [homeTab];
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: NavTab[] = JSON.parse(stored);
        const valid = parsed.filter(
          (t) => t && typeof t.path === "string" && typeof t.label === "string",
        );
        // Ensure the home tab is always present and first, non-closable
        const withoutHome = valid.filter((t) => t.path !== homePath);
        return [homeTab, ...withoutHome];
      }
    } catch {
      // sessionStorage unavailable — use default
    }
    return [homeTab];
  });

  // Keep home tab in sync if homePath changes (role switch)
  const prevHomePath = useRef(homePath);
  useEffect(() => {
    if (prevHomePath.current === homePath) return;
    prevHomePath.current = homePath;
    setTabs((prev) => {
      const withoutOldHome = prev.filter((t) => t.closable);
      return [{ path: homePath, label: homeLabel, closable: false }, ...withoutOldHome];
    });
  }, [homePath, homeLabel]);

  // Persist to sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
    } catch {
      // best-effort
    }
  }, [tabs]);

  const openTab = useCallback((path: string, label: string) => {
    setTabs((prev) => {
      if (prev.some((t) => t.path === path)) return prev; // no duplicate
      return [...prev, { path, label, closable: true }];
    });
  }, []);

  const closeTab = useCallback(
    (path: string) => {
      setTabs((prev) => {
        const idx = prev.findIndex((t) => t.path === path);
        if (idx === -1) return prev;
        const tab = prev[idx];
        if (!tab?.closable) return prev; // cannot close home tab
        const newTabs = prev.filter((t) => t.path !== path);

        // If we're closing the currently active tab, navigate to the adjacent one
        if (router.pathname === path) {
          const nextIdx = Math.max(0, idx - 1);
          const destination = newTabs[nextIdx]?.path ?? homePath;
          router.push(destination);
        }

        return newTabs;
      });
    },
    [router, homePath],
  );

  const closeOtherTabs = useCallback(
    (path: string) => {
      setTabs((prev) => {
        const newTabs = prev.filter((t) => !t.closable || t.path === path);
        // If current page was removed, navigate to the kept tab
        if (router.pathname !== path && !newTabs.some((t) => t.path === router.pathname)) {
          router.push(path);
        }
        return newTabs;
      });
    },
    [router],
  );

  const closeTabsToRight = useCallback(
    (path: string) => {
      setTabs((prev) => {
        const anchorIdx = prev.findIndex((t) => t.path === path);
        if (anchorIdx === -1) return prev;
        // Keep all tabs up to and including the anchor; remove closable ones after it
        const newTabs = prev.filter((t, i) => i <= anchorIdx || !t.closable);
        // If the current active tab was removed, navigate to the anchor
        const currentIdx = prev.findIndex((t) => t.path === router.pathname);
        if (currentIdx > anchorIdx && prev[currentIdx]?.closable) {
          router.push(path);
        }
        return newTabs;
      });
    },
    [router],
  );

  const closeAllTabs = useCallback(() => {
    setTabs((prev) => prev.filter((t) => !t.closable));
    router.push(homePath);
  }, [router, homePath]);

  // Sync: when URL changes via browser back/forward or programmatic push outside
  // menu (e.g., a "View Details" link), ensure the current path is a tab.
  useEffect(() => {
    const pathname = router.pathname;
    if (!pathname) return;
    if (STANDALONE_ROUTES.some((r) => pathname.startsWith(r))) return;

    setTabs((prev) => {
      if (prev.some((t) => t.path === pathname)) return prev;
      const label = deriveLabel(pathname);
      return [...prev, { path: pathname, label, closable: true }];
    });
  }, [router.pathname]);

  return (
    <TabsNavContext.Provider
      value={{ tabs, openTab, closeTab, closeOtherTabs, closeTabsToRight, closeAllTabs }}
    >
      {children}
    </TabsNavContext.Provider>
  );
};
