import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// next/router is already handled by moduleNameMapper -> __mocks__/nextRouter.js

jest.mock("../../core/hooks", () => ({
  useResolution: jest.fn(() => require("../test-utils").mockResolution()),
}));

jest.mock("../../core/contexts", () => ({
  usePublicSettings: jest.fn(() => ({ maintenance: { pages: [] } })),
}));

jest.mock("../../core/contexts/TabsNavigationContext", () => ({
  TabsNavigationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTabsNavigation: jest.fn(() => ({ openTab: jest.fn(), tabs: [], activeTab: null })),
}));

jest.mock("../../components/radix/SideMenu", () => ({
  SideMenu: ({ onToggleCollapsed, onNavigate, collapsed }: any) => (
    <div data-testid="side-menu" data-collapsed={String(collapsed)}>
      <button
        data-testid="sidebar-toggle"
        onClick={() => {
          onToggleCollapsed?.(true);
          onNavigate?.();
        }}
      >
        toggle
      </button>
    </div>
  ),
}));

jest.mock("../../components/radix/Header", () => ({
  Header: () => <div data-testid="header" />,
}));

jest.mock("../../components/radix/TabsNavigationBar", () => ({
  TabsNavigationBar: () => <div data-testid="tabs-nav-bar" />,
}));

jest.mock("../../components/radix/BottomNav", () => ({
  BottomNav: () => <div data-testid="bottom-nav" />,
}));

jest.mock("../../components/radix/MaintenanceBanner", () => ({
  MaintenanceBanner: () => null,
  MaintenancePageBlock: () => <div data-testid="maintenance-block" />,
}));

jest.mock("../../components/radix/OfflineIndicatorBar", () => ({
  OfflineIndicatorBar: () => null,
}));

jest.mock("../../components/radix/OfflineDisconnectDialog", () => ({
  OfflineDisconnectDialog: () => null,
}));

jest.mock("../../components/radix/SyncOfflineDialog", () => ({
  SyncOfflineDialog: () => null,
}));

import { RadixDashboard } from "../../components/radix/Dashboard";
import { useResolution } from "../../core/hooks";
import { useRouter } from "next/router";
import { usePublicSettings } from "../../core/contexts";
import { PAGE_KEYS } from "../../business/settings";
import { mockResolution, mockRouter } from "../test-utils";

const logout = jest.fn();

describe("RadixDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    (useRouter as jest.Mock).mockReturnValue(mockRouter({ pathname: "/admin/hub" }));
    (useResolution as jest.Mock).mockReturnValue(mockResolution());
    (usePublicSettings as jest.Mock).mockReturnValue({ maintenance: { pages: [] } });
  });

  it("renders children on a normal route", () => {
    render(
      <RadixDashboard logout={logout} role="admin">
        <div data-testid="page-content">Dashboard Page</div>
      </RadixDashboard>,
    );
    expect(screen.getByTestId("page-content")).toBeInTheDocument();
  });

  it("renders SideMenu on a non-standalone route", () => {
    render(
      <RadixDashboard logout={logout} role="admin">
        <div>Content</div>
      </RadixDashboard>,
    );
    expect(screen.getByTestId("side-menu")).toBeInTheDocument();
  });

  it("renders Header on a non-standalone route", () => {
    render(
      <RadixDashboard logout={logout} role="admin">
        <div>Content</div>
      </RadixDashboard>,
    );
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("renders only children on the login page (standalone route)", () => {
    (useRouter as jest.Mock).mockReturnValue({ pathname: "/", push: jest.fn() });
    render(
      <RadixDashboard logout={logout} role="admin">
        <div data-testid="login-content">Login</div>
      </RadixDashboard>,
    );
    expect(screen.getByTestId("login-content")).toBeInTheDocument();
    expect(screen.queryByTestId("side-menu")).toBeNull();
    expect(screen.queryByTestId("header")).toBeNull();
  });

  it("renders only children on a cashier shift-open route (standalone)", () => {
    (useRouter as jest.Mock).mockReturnValue({ pathname: "/cashier/shift/open", push: jest.fn() });
    render(
      <RadixDashboard logout={logout} role="cashier">
        <div data-testid="shift-content">Open Shift</div>
      </RadixDashboard>,
    );
    expect(screen.getByTestId("shift-content")).toBeInTheDocument();
    expect(screen.queryByTestId("side-menu")).toBeNull();
  });

  it("does not render BottomNav on desktop", () => {
    render(
      <RadixDashboard logout={logout} role="cashier">
        <div>Content</div>
      </RadixDashboard>,
    );
    expect(screen.queryByTestId("bottom-nav")).toBeNull();
  });

  it("renders BottomNav on small mobile", () => {
    (useResolution as jest.Mock).mockReturnValue(
      mockResolution({ isMobile: true, isSmallMobile: true, isTablet: false, isDesktop: false }),
    );
    render(
      <RadixDashboard logout={logout} role="admin">
        <div>Content</div>
      </RadixDashboard>,
    );
    expect(screen.getByTestId("bottom-nav")).toBeInTheDocument();
  });

  const routeCases: Array<[string, string]> = [
    ["/admin/hub", PAGE_KEYS.Dashboard],
    ["/cashier/pos", PAGE_KEYS.POS],
    ["/admin/hub/inventory", PAGE_KEYS.Inventory],
    ["/admin/hub/reports", PAGE_KEYS.Reports],
    ["/admin/hub/settings", PAGE_KEYS.Settings],
    ["/admin/hub/user-management", PAGE_KEYS.Users],
    ["/admin/hub/supplier-management", PAGE_KEYS.Suppliers],
  ];
  it.each(routeCases)("maps %s to the %s page key without crashing", (pathname) => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter({ pathname }));
    render(
      <RadixDashboard logout={logout} role="admin">
        <div data-testid="page-content">Page</div>
      </RadixDashboard>,
    );
    expect(screen.getByTestId("page-content")).toBeInTheDocument();
  });

  it("shows the MaintenancePageBlock when the current page is in maintenance for a non-admin", () => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter({ pathname: "/admin/hub/settings" }));
    (usePublicSettings as jest.Mock).mockReturnValue({
      maintenance: { pages: [PAGE_KEYS.Settings] },
    });
    render(
      <RadixDashboard logout={logout} role="cashier">
        <div data-testid="page-content">Settings</div>
      </RadixDashboard>,
    );
    expect(screen.getByTestId("maintenance-block")).toBeInTheDocument();
    expect(screen.queryByTestId("page-content")).toBeNull();
  });

  it("does NOT show maintenance for an admin on a maintenance-marked settings page", () => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter({ pathname: "/admin/hub/settings" }));
    (usePublicSettings as jest.Mock).mockReturnValue({
      maintenance: { pages: [PAGE_KEYS.Settings] },
    });
    render(
      <RadixDashboard logout={logout} role="admin">
        <div data-testid="page-content">Settings</div>
      </RadixDashboard>,
    );
    expect(screen.getByTestId("page-content")).toBeInTheDocument();
    expect(screen.queryByTestId("maintenance-block")).toBeNull();
  });

  it("persists the sidebar collapse state to localStorage via the toggle handler", () => {
    (useResolution as jest.Mock).mockReturnValue(
      mockResolution({ isMobile: false, isSmallMobile: false, isTablet: false, isDesktop: false }),
    );
    render(
      <RadixDashboard logout={logout} role="admin">
        <div>Content</div>
      </RadixDashboard>,
    );
    fireEvent.click(screen.getByTestId("sidebar-toggle"));
    expect(window.localStorage.getItem("espasyo.sidebarCollapsed.admin")).toBe("1");
  });

  it("initializes the collapsed state as true for the cashier role", () => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter({ pathname: "/cashier/pos" }));
    render(
      <RadixDashboard logout={logout} role="cashier">
        <div>Content</div>
      </RadixDashboard>,
    );
    expect(screen.getByTestId("side-menu").getAttribute("data-collapsed")).toBe("true");
  });

  it("reads the collapsed state from localStorage when present (true)", () => {
    window.localStorage.setItem("espasyo.sidebarCollapsed.admin", "1");
    render(
      <RadixDashboard logout={logout} role="admin">
        <div>Content</div>
      </RadixDashboard>,
    );
    expect(screen.getByTestId("side-menu").getAttribute("data-collapsed")).toBe("true");
  });

  it("reads the collapsed state from localStorage when present (false)", () => {
    window.localStorage.setItem("espasyo.sidebarCollapsed.admin", "0");
    render(
      <RadixDashboard logout={logout} role="admin">
        <div>Content</div>
      </RadixDashboard>,
    );
    expect(screen.getByTestId("side-menu").getAttribute("data-collapsed")).toBe("false");
  });

  it("handles a missing role (null storage key) without crashing", () => {
    render(
      <RadixDashboard logout={logout}>
        <div data-testid="page-content">No Role</div>
      </RadixDashboard>,
    );
    expect(screen.getByTestId("page-content")).toBeInTheDocument();
  });

  it("renders children for an unknown route path", () => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter({ pathname: "/admin/hub/something-random" }));
    render(
      <RadixDashboard logout={logout} role="admin">
        <div data-testid="page-content">Page</div>
      </RadixDashboard>,
    );
    expect(screen.getByTestId("page-content")).toBeInTheDocument();
    expect(screen.queryByTestId("maintenance-block")).toBeNull();
  });

  it("renders children for a sales route path", () => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter({ pathname: "/admin/hub/sales" }));
    render(
      <RadixDashboard logout={logout} role="admin">
        <div data-testid="page-content">Page</div>
      </RadixDashboard>,
    );
    expect(screen.getByTestId("page-content")).toBeInTheDocument();
  });
});
