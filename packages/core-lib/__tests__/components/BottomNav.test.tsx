import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "../test-utils";

// next/router is handled by moduleNameMapper -> __mocks__/nextRouter.js

const openTab = jest.fn();
const startContentTransition = jest.fn();
let routerMock: any;

jest.mock("../../components/menu/hooks/useFilteredMenu", () => ({
  useFilteredMenu: jest.fn(() => ({ mainMenu: [], secondaryMenu: [] })),
}));

jest.mock("../../core/contexts", () => ({
  useOfflineMode: jest.fn(() => ({ isOnline: true })),
  usePageLoaderContext: jest.fn(() => ({ startContentTransition: jest.fn() })),
}));

jest.mock("../../core/contexts/theme/ThemePreferenceContext", () => ({
  useThemePreference: jest.fn(() => require("../test-utils").mockThemePreference()),
}));

jest.mock("../../core/contexts/TabsNavigationContext", () => ({
  useTabsNavigation: jest.fn(() => ({ openTab: jest.fn() })),
  deriveLabel: jest.fn((path: string) => path.split("/").pop() || path),
}));

import { BottomNav } from "../../components/radix/BottomNav";
import { useFilteredMenu } from "../../components/menu/hooks/useFilteredMenu";
import { useOfflineMode } from "../../core/contexts";
import { useTabsNavigation } from "../../core/contexts/TabsNavigationContext";
import { useRouter } from "next/router";
import { mockRouter } from "../test-utils";

describe("BottomNav", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    openTab.mockClear();
    startContentTransition.mockClear();
    routerMock = mockRouter({ pathname: "/admin/hub" });
    (useRouter as jest.Mock).mockReturnValue(routerMock);
    (useFilteredMenu as jest.Mock).mockReturnValue({ mainMenu: [], secondaryMenu: [] });
    (useOfflineMode as jest.Mock).mockReturnValue({ isOnline: true });
    (useTabsNavigation as jest.Mock).mockReturnValue({ openTab, deriveLabel: (p: string) => p });
  });

  it("returns null when loading is true", () => {
    const { container } = render(<BottomNav roleName="admin" loading={true} />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when menu is empty", () => {
    const { container } = render(<BottomNav roleName="admin" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nav items when menu has items", () => {
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [
        { id: "1", text: "Dashboard", path: "/admin/hub", icon: <span /> },
        { id: "2", text: "Products", path: "/admin/hub/product/product-list", icon: <span /> },
      ],
      secondaryMenu: [],
    });
    render(<BottomNav roleName="admin" />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
  });

  it("renders secondary menu items", () => {
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [],
      secondaryMenu: [{ id: "3", text: "Help", path: "/admin/hub/documentation", icon: <span /> }],
    });
    render(<BottomNav roleName="admin" />);
    expect(screen.getByText("Help")).toBeInTheDocument();
  });

  it("renders all combined menu items from both sections", () => {
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [{ id: "4", text: "Sales", path: "/cashier/pos", icon: <span /> }],
      secondaryMenu: [{ id: "5", text: "Support", path: "/admin/hub/documentation", icon: <span /> }],
    });
    render(<BottomNav roleName="cashier" />);
    expect(screen.getByText("Sales")).toBeInTheDocument();
    expect(screen.getByText("Support")).toBeInTheDocument();
  });

  it("marks an item active when the router pathname matches", () => {
    routerMock = mockRouter({ pathname: "/admin/hub" });
    (useRouter as jest.Mock).mockReturnValue(routerMock);
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [{ id: "1", text: "Dashboard", path: "/admin/hub", icon: <span /> }],
      secondaryMenu: [],
    });
    render(<BottomNav roleName="admin" />);
    expect(screen.getByText("Dashboard").closest('[aria-current="page"]')).toBeTruthy();
  });

  it("opens a nested sheet for a grouped item and navigates on nested tap", () => {
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [
        {
          id: "m",
          text: "More",
          icon: <span />,
          path: undefined,
          permissionKey: "m",
          nestedItems: [
            { id: "s", text: "Sales", icon: <span />, path: "/cashier/pos", permissionKey: "s" },
          ],
        },
      ],
      secondaryMenu: [],
    });
    render(<BottomNav roleName="cashier" />);

    fireEvent.click(screen.getByText("More"));
    const nested = screen.getByText("Sales");
    expect(nested).toBeInTheDocument();

    fireEvent.click(nested);
    expect(openTab).toHaveBeenCalledWith("/cashier/pos", "Sales");
    expect(routerMock.push).toHaveBeenCalledWith("/cashier/pos");
    expect(startContentTransition).toHaveBeenCalled();
  });

  it("navigates on click of a top-level item when online", () => {
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [{ id: "p", text: "POS", path: "/cashier/pos", icon: <span /> }],
      secondaryMenu: [],
    });
    render(<BottomNav roleName="cashier" />);
    fireEvent.click(screen.getByText("POS"));
    expect(openTab).toHaveBeenCalledWith("/cashier/pos", "POS");
    expect(routerMock.push).toHaveBeenCalledWith("/cashier/pos");
  });

  it("navigates on Enter key for a top-level item", () => {
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [{ id: "p", text: "POS", path: "/cashier/pos", icon: <span /> }],
      secondaryMenu: [],
    });
    render(<BottomNav roleName="cashier" />);
    fireEvent.keyDown(screen.getByText("POS"), { key: "Enter" });
    expect(routerMock.push).toHaveBeenCalledWith("/cashier/pos");
  });

  it("blocks navigation for a non-allowed path when offline", () => {
    (useOfflineMode as jest.Mock).mockReturnValue({ isOnline: false });
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [{ id: "x", text: "Settings", path: "/admin/hub/settings", icon: <span /> }],
      secondaryMenu: [],
    });
    render(<BottomNav roleName="admin" />);
    const item = screen.getByText("Settings");
    expect(item.getAttribute("aria-disabled")).toBe("true");
    expect(item.getAttribute("title")).toBe("Available when online");
    fireEvent.click(item);
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("allows navigation for an allowed offline path", () => {
    (useOfflineMode as jest.Mock).mockReturnValue({ isOnline: false });
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [{ id: "p", text: "POS", path: "/cashier/pos", icon: <span /> }],
      secondaryMenu: [],
    });
    render(<BottomNav roleName="cashier" />);
    expect(screen.getByText("POS").getAttribute("aria-disabled")).toBeNull();
  });

  it("does not navigate on a nested tap when the nested path is offline-blocked", () => {
    (useOfflineMode as jest.Mock).mockReturnValue({ isOnline: false });
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [
        {
          id: "m",
          text: "More",
          icon: <span />,
          path: undefined,
          permissionKey: "m",
          nestedItems: [
            { id: "s", text: "Settings", icon: <span />, path: "/admin/hub/settings", permissionKey: "s" },
          ],
        },
      ],
      secondaryMenu: [],
    });
    render(<BottomNav roleName="admin" />);
    fireEvent.click(screen.getByText("More"));
    fireEvent.click(screen.getByText("Settings"));
    expect(routerMock.push).not.toHaveBeenCalled();
  });
});
