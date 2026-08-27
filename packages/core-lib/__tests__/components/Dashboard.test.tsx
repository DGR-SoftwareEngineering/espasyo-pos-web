import React from "react";
import { render, screen } from "@testing-library/react";

// next/router is already handled by moduleNameMapper → __mocks__/nextRouter.js
// We just import and configure per-test

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
  SideMenu: () => <div data-testid="side-menu" />,
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
import { mockResolution, mockRouter } from "../test-utils";

const logout = jest.fn();

describe("RadixDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter({ pathname: "/admin/hub" }));
    (useResolution as jest.Mock).mockReturnValue(mockResolution());
  });

  it("renders children on a normal route", () => {
    render(
      <RadixDashboard logout={logout} role="admin">
        <div data-testid="page-content">Dashboard Page</div>
      </RadixDashboard>
    );
    expect(screen.getByTestId("page-content")).toBeInTheDocument();
  });

  it("renders SideMenu on a non-standalone route", () => {
    render(
      <RadixDashboard logout={logout} role="admin">
        <div>Content</div>
      </RadixDashboard>
    );
    expect(screen.getByTestId("side-menu")).toBeInTheDocument();
  });

  it("renders Header on a non-standalone route", () => {
    render(
      <RadixDashboard logout={logout} role="admin">
        <div>Content</div>
      </RadixDashboard>
    );
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("renders only children on the login page (standalone route)", () => {
    (useRouter as jest.Mock).mockReturnValue({ pathname: "/", push: jest.fn() });
    render(
      <RadixDashboard logout={logout} role="admin">
        <div data-testid="login-content">Login</div>
      </RadixDashboard>
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
      </RadixDashboard>
    );
    expect(screen.getByTestId("shift-content")).toBeInTheDocument();
    expect(screen.queryByTestId("side-menu")).toBeNull();
  });

  it("does not render BottomNav on desktop", () => {
    render(
      <RadixDashboard logout={logout} role="cashier">
        <div>Content</div>
      </RadixDashboard>
    );
    expect(screen.queryByTestId("bottom-nav")).toBeNull();
  });

  it("renders BottomNav on small mobile", () => {
    (useResolution as jest.Mock).mockReturnValue(mockResolution({
      isMobile: true, isSmallMobile: true, isTablet: false, isDesktop: false,
    }));
    render(
      <RadixDashboard logout={logout} role="admin">
        <div>Content</div>
      </RadixDashboard>
    );
    expect(screen.getByTestId("bottom-nav")).toBeInTheDocument();
  });
});
