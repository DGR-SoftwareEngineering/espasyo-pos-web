import React, { ReactNode, useMemo } from "react";
import { Box, Flex } from "@radix-ui/themes";
import { useRouter } from "next/router";
import { useResolution } from "../../core/hooks";
import { usePublicSettings } from "../../core/contexts";
import { PAGE_KEYS } from "../../business/settings";
import { SideMenu } from "./SideMenu";
import { Header } from "./Header";
import {
  MaintenanceBanner,
  MaintenancePageBlock,
} from "./MaintenanceBanner";

const routeToPageKey = (pathname: string): string | null => {
  if (!pathname) return null;
  const path = pathname.toLowerCase();
  if (path.includes("/pos") || path.includes("/sales")) return PAGE_KEYS.POS;
  if (path.includes("/inventory")) return PAGE_KEYS.Inventory;
  if (path.includes("/reports")) return PAGE_KEYS.Reports;
  if (path.includes("/settings")) return PAGE_KEYS.Settings;
  if (path.includes("/user-management")) return PAGE_KEYS.Users;
  if (path.includes("/supplier-management")) return PAGE_KEYS.Suppliers;
  if (path === "/admin/hub" || path === "/hub") return PAGE_KEYS.Dashboard;
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

  const currentPageKey = useMemo(
    () => routeToPageKey(router?.pathname ?? ""),
    [router?.pathname],
  );

  const pageInMaintenance =
    !!currentPageKey &&
    maintenance.pages.includes(currentPageKey) &&
    !(currentPageKey === PAGE_KEYS.Settings && isAdmin);

  return (
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
      />

      <Flex
        direction="column"
        style={{ flex: 1, minWidth: 0, overflow: "auto" }}
      >
        <MaintenanceBanner />
        <Header />
        <Box
          style={{
            flex: 1,
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
  );
};
