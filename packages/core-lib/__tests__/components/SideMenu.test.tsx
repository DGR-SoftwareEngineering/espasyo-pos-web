import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "../test-utils";

jest.mock("framer-motion", () => require("../test-utils").mockFramerMotion());

// Override the radix mock so DropdownMenu.Item forwards onSelect -> onClick
// (the shared mock only forwards onClick, which would leave the user-menu
// handlers in SideMenu uncovered).
jest.mock("@radix-ui/themes", () => {
  const ReactMod = require("react");
  const base = require("../__mocks__/radixThemes.js");
  return {
    ...base,
    DropdownMenu: {
      ...base.DropdownMenu,
      Item: ({ children, onClick, onSelect, disabled, ...rest }: any) =>
        ReactMod.createElement(
          "button",
          { onClick: onClick || onSelect, disabled, ...rest },
          children,
        ),
    },
  };
});

jest.mock("../../core/hooks", () => ({
  useResolution: jest.fn(() => require("../test-utils").mockResolution()),
}));

jest.mock("../../core/contexts", () => ({
  usePublicSettings: jest.fn(() => ({
    systemName: "TestBrand",
    theme: { logoUrl: null },
  })),
  useOfflineMode: jest.fn(() => ({ isOnline: true, pendingSalesCount: 0 })),
}));

const toggleAppearance = jest.fn();
jest.mock("../../core/contexts/theme/ThemePreferenceContext", () => ({
  useThemePreference: jest.fn(() => ({ appearance: "light", toggleAppearance: jest.fn() })),
}));

jest.mock("../../components/radix/menu/RadixMenuContent", () => ({
  RadixMenuContent: function () {
    return require("react").createElement("div", { "data-testid": "menu-content" });
  },
}));

jest.mock("../../components/radix/security/MpinManagementDialog", () => ({
  MpinManagementDialog: function ({ open }: { open: boolean }) {
    const React = require("react");
    return open ? React.createElement("div", { "data-testid": "mpin-dialog" }) : null;
  },
}));

import { SideMenu } from "../../components/radix/SideMenu";
import { useResolution } from "../../core/hooks";
import { useOfflineMode, usePublicSettings } from "../../core/contexts";
import { useThemePreference } from "../../core/contexts/theme/ThemePreferenceContext";
import { useRouter } from "next/router";
import { mockResolution, mockRouter } from "../test-utils";

const logout = jest.fn().mockResolvedValue(undefined);
let routerMock: ReturnType<typeof mockRouter>;

describe("SideMenu", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    routerMock = mockRouter({ pathname: "/admin/hub" });
    (useResolution as jest.Mock).mockReturnValue(mockResolution());
    (usePublicSettings as jest.Mock).mockReturnValue({
      systemName: "TestBrand",
      theme: { logoUrl: null },
    });
    (useOfflineMode as jest.Mock).mockReturnValue({ isOnline: true, pendingSalesCount: 0 });
    (useThemePreference as jest.Mock).mockReturnValue({ appearance: "light", toggleAppearance });
    (useRouter as jest.Mock).mockReturnValue(routerMock);
  });

  it("renders without crashing", () => {
    const { container } = render(<SideMenu logout={logout} />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders brand name on desktop", () => {
    render(<SideMenu logout={logout} role="admin" />);
    expect(screen.getByText("TestBrand")).toBeInTheDocument();
  });

  it("renders RadixMenuContent on desktop", () => {
    render(<SideMenu logout={logout} role="admin" />);
    expect(screen.getByTestId("menu-content")).toBeInTheDocument();
  });

  it("renders an aside element on desktop", () => {
    const { container } = render(<SideMenu logout={logout} role="admin" />);
    expect(container.querySelector("aside")).toBeInTheDocument();
  });

  it("does not render aside element on mobile", () => {
    (useResolution as jest.Mock).mockReturnValue(mockResolution({ isMobile: true, isSmallMobile: true }));
    const { container } = render(<SideMenu logout={logout} role="admin" />);
    expect(container.querySelector("aside")).toBeNull();
  });

  it("renders a collapse button when collapsible and toggles state", () => {
    const onToggleCollapsed = jest.fn();
    render(
      <SideMenu
        logout={logout}
        role="admin"
        collapsible
        collapsed={false}
        onToggleCollapsed={onToggleCollapsed}
      />,
    );
    const btn = screen.getByLabelText("Collapse sidebar");
    fireEvent.click(btn);
    expect(onToggleCollapsed).toHaveBeenCalledWith(true);
  });

  it("renders the collapsed avatar dropdown on desktop", () => {
    render(<SideMenu logout={logout} role="admin" collapsible collapsed />);
    expect(screen.getByTestId("menu-content")).toBeInTheDocument();
  });

  it("toggles the theme via the theme button", () => {
    render(<SideMenu logout={logout} role="admin" />);
    const btn = screen.getByTitle(/Switch to/i);
    fireEvent.click(btn);
    expect(toggleAppearance).toHaveBeenCalled();
  });

  it("renders a brand logo image when theme.logoUrl is set", () => {
    (usePublicSettings as jest.Mock).mockReturnValue({
      systemName: "TestBrand",
      theme: { logoUrl: "http://example.com/logo.png" },
    });
    render(<SideMenu logout={logout} role="admin" />);
    expect(screen.getByRole("img", { name: "TestBrand" })).toBeInTheDocument();
  });

  it("hides the Settings item for non-admin roles", () => {
    render(<SideMenu logout={logout} role="cashier" />);
    expect(screen.queryByText("Settings")).toBeNull();
  });

  it("disables Logout when offline", () => {
    (useOfflineMode as jest.Mock).mockReturnValue({ isOnline: false, pendingSalesCount: 0 });
    render(<SideMenu logout={logout} role="admin" />);
    const logoutBtn = screen.getByText("Logout").closest("button");
    expect(logoutBtn).toBeDisabled();
  });

  it("disables Logout when there are pending sales", () => {
    (useOfflineMode as jest.Mock).mockReturnValue({ isOnline: true, pendingSalesCount: 3 });
    render(<SideMenu logout={logout} role="admin" />);
    const logoutBtn = screen.getByText("Logout").closest("button");
    expect(logoutBtn).toBeDisabled();
  });

  it("opens the MPIN management dialog when MPIN Security is selected", () => {
    render(<SideMenu logout={logout} role="admin" />);
    fireEvent.click(screen.getByText("MPIN Security"));
    expect(screen.getByTestId("mpin-dialog")).toBeInTheDocument();
  });

  it("navigates to settings when Settings is selected", () => {
    render(<SideMenu logout={logout} role="admin" />);
    fireEvent.click(screen.getByText("Settings"));
    expect(routerMock.push).toHaveBeenCalledWith("/admin/hub/settings");
  });

  it("calls logout when Logout is selected", () => {
    render(<SideMenu logout={logout} role="admin" />);
    fireEvent.click(screen.getByText("Logout"));
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
