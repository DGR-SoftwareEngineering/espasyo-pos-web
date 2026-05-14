import React, { ReactNode } from "react";
import { Box, Flex } from "@radix-ui/themes";
import { SideMenu } from "./SideMenu";
import { Header } from "./Header";

interface Props {
  logout: () => Promise<void>;
  loading?: boolean;
  role?: string;
  initials?: string;
  email?: string;
  children: ReactNode;
}

/**
 * Authenticated app shell built on Radix Themes primitives — parallel to
 * `core-lib/components/shared-theme/templates/dashboard/Dashboard.tsx` for the
 * MUI path.
 *
 * Layout: [ SideMenu ] [ Header / main content ]
 *   - SideMenu: brand + permission-filtered nav + user footer
 *   - Header:   breadcrumb + page title (driven by route + HeaderTitleContext)
 *
 * Mounted by `RadixThemeFramework` when the user is authenticated. Unauth'd
 * routes (login page) bypass this and render bare children.
 */
export const RadixDashboard: React.FC<Props> = ({
  children,
  logout,
  loading,
  role,
  initials,
  email,
}) => (
  <Flex style={{ minHeight: "100vh" }}>
    <SideMenu
      logout={logout}
      loading={loading}
      role={role}
      initials={initials}
      email={email}
    />

    <Flex direction="column" style={{ flex: 1, minWidth: 0, overflow: "auto" }}>
      <Header />
      <Box style={{ flex: 1, padding: "24px 32px" }}>{children}</Box>
    </Flex>
  </Flex>
);
