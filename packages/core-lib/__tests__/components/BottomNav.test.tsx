import React from "react";
import { render, screen } from "@testing-library/react";
import "../test-utils";

// next/router is handled by moduleNameMapper → __mocks__/nextRouter.js

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

describe("BottomNav", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFilteredMenu as jest.Mock).mockReturnValue({ mainMenu: [], secondaryMenu: [] });
  });

  it("returns null when loading is true", () => {
    const { container } = render(<BottomNav roleName="admin" loading={true} />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when menu is empty", () => {
    (useFilteredMenu as jest.Mock).mockReturnValue({ mainMenu: [], secondaryMenu: [] });
    const { container } = render(<BottomNav roleName="admin" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nav items when menu has items", () => {
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [
        { id: "1", text: "Dashboard", path: "/admin/hub" },
        { id: "2", text: "Products", path: "/admin/hub/product/product-list" },
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
      secondaryMenu: [{ id: "3", text: "Help", path: "/admin/hub/documentation" }],
    });
    render(<BottomNav roleName="admin" />);
    expect(screen.getByText("Help")).toBeInTheDocument();
  });

  it("renders all combined menu items from both sections", () => {
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [{ id: "4", text: "Sales", path: "/cashier/pos" }],
      secondaryMenu: [{ id: "5", text: "Support", path: "/admin/hub/documentation" }],
    });
    render(<BottomNav roleName="cashier" />);
    expect(screen.getByText("Sales")).toBeInTheDocument();
    expect(screen.getByText("Support")).toBeInTheDocument();
  });
});
