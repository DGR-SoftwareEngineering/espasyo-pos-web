import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Box, Flex } from "@radix-ui/themes";
import { useRouter } from "next/router";
import { useResolution } from "../../core/hooks";
import { usePublicSettings } from "../../core/contexts";
import { TabsNavigationProvider } from "../../core/contexts/TabsNavigationContext";
import { PAGE_KEYS } from "../../business/settings";
import { SideMenu } from "./SideMenu";
import { Header } from "./Header";
import { TabsNavigationBar } from "./TabsNavigationBar";
import {
  MaintenanceBanner,
  MaintenancePageBlock,
} from "./MaintenanceBanner";

const SIDEBAR_COLLAPSED_KEY_PREFIX = "espasyo.sidebarCollapsed.";
// Legacy single-key (kept for one-time cleanup so old prefs don't leak across roles).
const LEGACY_SIDEBAR_COLLAPSED_KEY = "espasyo.sidebarCollapsed";

const routeToPageKey = (pathname: string): string | null => {
  if (!pathname) return null;
  const path = pathname.toLowerCase();
  if (path.includes("/pos") || path.includes("/sales") || path.includes("/cashier")) return PAGE_KEYS.POS;
  if (path.includes("/inventory")) return PAGE_KEYS.Inventory;
  if (path.includes("/reports")) return PAGE_KEYS.Reports;
  if (path.includes("/settings")) return PAGE_KEYS.Settings;
  if (path.includes("/user-management")) return PAGE_KEYS.Users;
  if (path.includes("/supplier-management")) return PAGE_KEYS.Suppliers;
  if (path === "/admin/hub") return PAGE_KEYS.Dashboard;
  return null;
};

interface Props {
  logout: () => Promise<void>;
  loading?: boolean;
  role?: string;
  initials?: string;
  email?: string;
  children: ReactNode;
}

export const RadixDashboard: React.FC<Props> = ({
  children,
  logout,
  loading,
  role,
  initials,
  email,
}) => {
  const { isMobile } = useResolution();
  const router = useRouter();
  const { maintenance } = usePublicSettings();
  const isAdmin = (role ?? "").toLowerCase() === "admin";

  const normalizedRole = (role ?? "").trim().toLowerCase();
  const isCashier = normalizedRole === "cashier";
  // Per-role storage key — cashier and admin track collapse state independently
  // so they don't leak across roles when sharing a browser.
  const storageKey = normalizedRole
    ? `${SIDEBAR_COLLAPSED_KEY_PREFIX}${normalizedRole}`
    : null;

  // Admin defaults to expanded. Cashier defaults to collapsed so the POS gets
  // maximum horizontal space. User's manual toggle is persisted per role.
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(isCashier);

  useEffect(() => {
    if (typeof window === "undefined" || !storageKey) return;
    try {
      // One-time cleanup of the legacy global key so it doesn't override.
      window.localStorage.removeItem(LEGACY_SIDEBAR_COLLAPSED_KEY);

      const stored = window.localStorage.getItem(storageKey);
      if (stored === "1") setSidebarCollapsed(true);
      else if (stored === "0") setSidebarCollapsed(false);
      else setSidebarCollapsed(isCashier);
    } catch {
      // localStorage unavailable (private mode, etc.) — silently use the default.
    }
  }, [storageKey, isCashier]);

  const handleToggleSidebar = useCallback(
    (next: boolean) => {
      setSidebarCollapsed(next);
      if (typeof window === "undefined" || !storageKey) return;
      try {
        window.localStorage.setItem(storageKey, next ? "1" : "0");
      } catch {
        // Persistence is best-effort.
      }
    },
    [storageKey],
  );

  const currentPageKey = useMemo(
    () => routeToPageKey(router?.pathname ?? ""),
    [router?.pathname],
  );

  const pageInMaintenance =
    !!currentPageKey &&
    maintenance.pages.includes(currentPageKey) &&
    !(currentPageKey === PAGE_KEYS.Settings && isAdmin);

  // Pages that manage their own full-screen layout — skip the dashboard chrome.
  const STANDALONE_ROUTES = ["/cashier/shift/open", "/404"];
  const isLoginPage = (router?.pathname ?? "") === "/";
  const isStandaloneRoute =
    isLoginPage ||
    STANDALONE_ROUTES.some((r) => (router?.pathname ?? "").startsWith(r));
  if (isStandaloneRoute) {
    return <>{children}</>;
  }

  const homePath = isAdmin ? "/admin/hub" : "/cashier/pos";

  return (
    <TabsNavigationProvider homePath={homePath} homeLabel="Dashboard">
      <Flex
        direction={isMobile ? "column" : "row"}
        style={{ minHeight: "100vh" }}
      >
        <SideMenu
          logout={logout}
          loading={loading}
          role={role}
          initials={initials}
          email={email}
          collapsible
          collapsed={sidebarCollapsed}
          onToggleCollapsed={handleToggleSidebar}
        />

        <Flex
          direction="column"
          style={{ flex: 1, minWidth: 0, height: "100vh", overflow: "hidden" }}
        >
          <MaintenanceBanner />
          <Header
            user={{ initials, email, role }}
            logout={logout}
            loading={loading}
          />
          {isAdmin && <TabsNavigationBar role={role} />}
          <Box
            style={{
              flex: 1,
              overflowY: "auto",
              padding: isMobile ? "16px" : "24px 32px",
            }}
          >
            {pageInMaintenance ? (
              <MaintenancePageBlock pageKey={currentPageKey!} />
            ) : (
              children
            )}
          </Box>
        </Flex>
      </Flex>
    </TabsNavigationProvider>
  );
};
