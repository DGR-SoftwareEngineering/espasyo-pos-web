import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "../test-utils";

jest.mock("framer-motion", () => require("../test-utils").mockFramerMotion());

jest.mock("../../core/router", () => ({
  useRouter: jest.fn(() => require("../test-utils").mockRouter({ pathname: "/admin/hub" })),
}));

jest.mock("../../core/contexts", () => ({
  usePageLoaderContext: jest.fn(() => ({ startContentTransition: jest.fn() })),
  useOfflineMode: jest.fn(() => ({ isOnline: true })),
}));

jest.mock("../../core/contexts/TabsNavigationContext", () => ({
  useTabsNavigation: jest.fn(() => ({ openTab: jest.fn() })),
  deriveLabel: jest.fn((path: string) => path),
}));

jest.mock("../../components/menu/hooks/useFilteredMenu", () => ({
  useFilteredMenu: jest.fn(() => ({ mainMenu: [], secondaryMenu: [] })),
}));

import { RadixMenuContent } from "../../components/radix/menu/RadixMenuContent";
import { useRouter } from "../../core/router";
import { useOfflineMode, usePageLoaderContext } from "../../core/contexts";
import { useTabsNavigation, deriveLabel } from "../../core/contexts/TabsNavigationContext";
import { useFilteredMenu } from "../../components/menu/hooks/useFilteredMenu";
import { mockRouter } from "../test-utils";

const icon = <span data-testid="ic" />;
const flat = (id: string, text: string, path: string) => ({
  id,
  text,
  icon,
  path,
  permissionKey: id,
});
const group = (id: string, text: string, nested: any[]) => ({
  id,
  text,
  icon,
  path: undefined,
  permissionKey: id,
  nestedItems: nested,
});

const openTab = jest.fn();
const startContentTransition = jest.fn();
const onNavigate = jest.fn();
let routerMock: ReturnType<typeof mockRouter>;

function hoverAll(container: HTMLElement) {
  container.querySelectorAll<HTMLElement>("*").forEach((el) => {
    fireEvent.mouseEnter(el);
    fireEvent.mouseLeave(el);
  });
}

describe("RadixMenuContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    openTab.mockClear();
    startContentTransition.mockClear();
    onNavigate.mockClear();
    routerMock = mockRouter({ pathname: "/admin/hub" });
    (useRouter as jest.Mock).mockReturnValue(routerMock);
    (useOfflineMode as jest.Mock).mockReturnValue({ isOnline: true });
    (usePageLoaderContext as jest.Mock).mockReturnValue({ startContentTransition });
    (useTabsNavigation as jest.Mock).mockReturnValue({ openTab, deriveLabel: (p: string) => p });
    (useFilteredMenu as jest.Mock).mockReturnValue({ mainMenu: [], secondaryMenu: [] });
  });

  it("renders a spinner when loading", () => {
    const { container } = render(<RadixMenuContent roleName="admin" loading />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    hoverAll(container);
  });

  it("renders the navigation section with flat and nested items, auto-opens and marks the active child", () => {
    const childPath = "/admin/hub/inventory/list";
    routerMock = mockRouter({ pathname: childPath });
    (useRouter as jest.Mock).mockReturnValue(routerMock);
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [
        flat("dash", "Dashboard", "/admin/hub"),
        group("inv", "Inventory", [
          { id: "inv-list", text: "Inventory List", icon, path: childPath, permissionKey: "inv.list" },
        ]),
      ],
      secondaryMenu: [],
    });

    const { container } = render(<RadixMenuContent roleName="admin" />);

    expect(screen.getByText("Navigation")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Inventory")).toBeInTheDocument();
    // nested item auto-opened because its path matches the router
    const activeChild = screen.getByText("Inventory List");
    expect(activeChild).toBeInTheDocument();
    expect(activeChild.closest('[aria-current="page"]')).toBeTruthy();
    hoverAll(container);
  });

  it("navigates when a flat item is clicked", () => {
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [flat("dash", "Dashboard", "/admin/hub")],
      secondaryMenu: [],
    });
    render(<RadixMenuContent roleName="admin" onNavigate={onNavigate} />);

    fireEvent.click(screen.getByText("Dashboard"));

    expect(openTab).toHaveBeenCalledWith("/admin/hub", "Dashboard");
    expect(startContentTransition).toHaveBeenCalled();
    expect(routerMock.push).toHaveBeenCalledWith("/admin/hub");
    expect(onNavigate).toHaveBeenCalled();
  });

  it("navigates when a nested item is clicked", () => {
    const childPath = "/admin/hub/inventory/list";
    routerMock = mockRouter({ pathname: childPath });
    (useRouter as jest.Mock).mockReturnValue(routerMock);
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [
        group("inv", "Inventory", [
          { id: "inv-list", text: "Inventory List", icon, path: childPath, permissionKey: "inv.list" },
        ]),
      ],
      secondaryMenu: [],
    });
    render(<RadixMenuContent roleName="admin" onNavigate={onNavigate} />);

    fireEvent.click(screen.getByText("Inventory List"));

    expect(openTab).toHaveBeenCalledWith(childPath, "Inventory List");
    expect(routerMock.push).toHaveBeenCalledWith(childPath);
    expect(onNavigate).toHaveBeenCalled();
  });

  it("toggles a grouped parent open/closed when its header is clicked", () => {
    const childPath = "/admin/hub/inventory/list";
    routerMock = mockRouter({ pathname: childPath });
    (useRouter as jest.Mock).mockReturnValue(routerMock);
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [
        group("inv", "Inventory", [
          { id: "inv-list", text: "Inventory List", icon, path: "/admin/hub/inventory/list", permissionKey: "inv.list" },
        ]),
      ],
      secondaryMenu: [],
    });
    render(<RadixMenuContent roleName="admin" />);

    expect(screen.getByText("Inventory List")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Inventory"));
    expect(screen.queryByText("Inventory List")).toBeNull();
  });

  it("navigates on Enter key for a flat item", () => {
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [flat("dash", "Dashboard", "/admin/hub")],
      secondaryMenu: [],
    });
    render(<RadixMenuContent roleName="admin" onNavigate={onNavigate} />);

    fireEvent.keyDown(screen.getByText("Dashboard"), { key: "Enter" });

    expect(openTab).toHaveBeenCalledWith("/admin/hub", "Dashboard");
    expect(onNavigate).toHaveBeenCalled();
  });

  it("renders the secondary Support section", () => {
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [],
      secondaryMenu: [flat("settings", "Settings", "/admin/hub/settings")],
    });
    const { container } = render(<RadixMenuContent roleName="admin" />);

    expect(screen.getByText("Support")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    hoverAll(container);
  });

  it("navigates when a secondary item is clicked", () => {
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [],
      secondaryMenu: [flat("settings", "Settings", "/admin/hub/settings")],
    });
    render(<RadixMenuContent roleName="admin" onNavigate={onNavigate} />);

    fireEvent.click(screen.getByText("Settings"));

    expect(routerMock.push).toHaveBeenCalledWith("/admin/hub/settings");
    expect(onNavigate).toHaveBeenCalled();
  });

  it("renders collapsed flat items in a tooltip and grouped items in a popover, with secondary block", () => {
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [
        flat("dash", "Dashboard", "/admin/hub"),
        group("inv", "Inventory", [
          { id: "inv-list", text: "Inventory List", icon, path: "/admin/hub/inventory/list", permissionKey: "inv.list" },
        ]),
      ],
      secondaryMenu: [flat("settings", "Settings", "/admin/hub/settings")],
    });
    const { container } = render(<RadixMenuContent roleName="admin" collapsed />);

    // Collapsed items render their text only inside a Tooltip (dropped by the
    // mock), so we assert on the icons and the rendered nested (popover) item.
    expect(screen.getAllByTestId("ic").length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText("Inventory List")).toBeInTheDocument();
    hoverAll(container);
  });

  it("blocks navigation for non-allowed paths when offline", () => {
    (useOfflineMode as jest.Mock).mockReturnValue({ isOnline: false });
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [flat("settings", "Settings", "/admin/hub/settings")],
      secondaryMenu: [],
    });
    const { container } = render(<RadixMenuContent roleName="admin" />);

    const item = screen.getByRole("button", { name: "Settings" });
    expect(item.getAttribute("aria-disabled")).toBe("true");
    expect(item.getAttribute("title")).toBe("Available when online");

    fireEvent.click(item);
    expect(routerMock.push).not.toHaveBeenCalled();
    hoverAll(container);
  });

  it("allows navigation for allowed offline paths when offline", () => {
    (useOfflineMode as jest.Mock).mockReturnValue({ isOnline: false });
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [flat("pos", "POS", "/cashier/pos")],
      secondaryMenu: [],
    });
    const { container } = render(<RadixMenuContent roleName="admin" />);

    expect(screen.getByText("POS").getAttribute("aria-disabled")).toBeNull();
    hoverAll(container);
  });

  it("applies dark mode styling", () => {
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [flat("dash", "Dashboard", "/admin/hub")],
      secondaryMenu: [],
    });
    const { container } = render(<RadixMenuContent roleName="admin" isDark />);
    expect(container).toBeTruthy();
    hoverAll(container);
  });

  it("navigates when a collapsed flat item is clicked", () => {
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [flat("dash", "Dashboard", "/admin/hub")],
      secondaryMenu: [],
    });
    render(<RadixMenuContent roleName="admin" collapsed onNavigate={onNavigate} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(openTab).toHaveBeenCalledWith("/admin/hub", "Dashboard");
    expect(routerMock.push).toHaveBeenCalledWith("/admin/hub");
  });

  it("navigates on Enter key for a collapsed flat item", () => {
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [flat("dash", "Dashboard", "/admin/hub")],
      secondaryMenu: [],
    });
    render(<RadixMenuContent roleName="admin" collapsed onNavigate={onNavigate} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.keyDown(buttons[0], { key: "Enter" });
    expect(openTab).toHaveBeenCalledWith("/admin/hub", "Dashboard");
    expect(routerMock.push).toHaveBeenCalledWith("/admin/hub");
  });

  it("blocks collapsed flat item when offline", () => {
    (useOfflineMode as jest.Mock).mockReturnValue({ isOnline: false });
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [flat("settings", "Settings", "/admin/hub/settings")],
      secondaryMenu: [],
    });
    render(<RadixMenuContent roleName="admin" collapsed />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("toggles collapsed grouped item popover on click", () => {
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [
        group("inv", "Inventory", [
          { id: "inv-list", text: "Inventory List", icon, path: "/admin/hub/inventory/list", permissionKey: "inv.list" },
        ]),
      ],
      secondaryMenu: [],
    });
    const { container } = render(<RadixMenuContent roleName="admin" collapsed />);
    fireEvent.click(screen.getByText("Inventory"));
    hoverAll(container);
  });

  it("navigates from collapsed popover nested item", () => {
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [
        group("inv", "Inventory", [
          { id: "inv-list", text: "Inventory List", icon, path: "/admin/hub/inventory/list", permissionKey: "inv.list" },
        ]),
      ],
      secondaryMenu: [],
    });
    render(<RadixMenuContent roleName="admin" collapsed onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText("Inventory"));
    fireEvent.click(screen.getByText("Inventory List"));
    expect(routerMock.push).toHaveBeenCalledWith("/admin/hub/inventory/list");
  });

  it("navigates from collapsed popover nested item on Enter", () => {
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [
        group("inv", "Inventory", [
          { id: "inv-list", text: "Inventory List", icon, path: "/admin/hub/inventory/list", permissionKey: "inv.list" },
        ]),
      ],
      secondaryMenu: [],
    });
    render(<RadixMenuContent roleName="admin" collapsed onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText("Inventory"));
    fireEvent.keyDown(screen.getByText("Inventory List"), { key: "Enter" });
    expect(routerMock.push).toHaveBeenCalledWith("/admin/hub/inventory/list");
  });

  it("navigates on Enter key for secondary item", () => {
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [],
      secondaryMenu: [flat("settings", "Settings", "/admin/hub/settings")],
    });
    render(<RadixMenuContent roleName="admin" onNavigate={onNavigate} />);
    const item = screen.getByRole("link", { name: "Settings" });
    fireEvent.keyDown(item, { key: "Enter" });
    expect(routerMock.push).toHaveBeenCalledWith("/admin/hub/settings");
  });

  it("applies hover style to secondary items", () => {
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [],
      secondaryMenu: [flat("settings", "Settings", "/admin/hub/settings")],
    });
    const { container } = render(<RadixMenuContent roleName="admin" />);
    const secondaryItem = screen.getByText("Settings");
    fireEvent.mouseEnter(secondaryItem);
    fireEvent.mouseLeave(secondaryItem);
    hoverAll(container);
  });

  it("does not apply hover style to active items", () => {
    routerMock = mockRouter({ pathname: "/admin/hub" });
    (useRouter as jest.Mock).mockReturnValue(routerMock);
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [flat("dash", "Dashboard", "/admin/hub")],
      secondaryMenu: [],
    });
    const { container } = render(<RadixMenuContent roleName="admin" />);
    const activeItem = screen.getByText("Dashboard");
    fireEvent.mouseEnter(activeItem);
    fireEvent.mouseLeave(activeItem);
    hoverAll(container);
  });

  it("renders dark mode expanded with active item", () => {
    routerMock = mockRouter({ pathname: "/admin/hub" });
    (useRouter as jest.Mock).mockReturnValue(routerMock);
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [
        flat("dash", "Dashboard", "/admin/hub"),
        group("inv", "Inventory", [
          { id: "inv-list", text: "Inventory List", icon, path: "/admin/hub/inventory/list", permissionKey: "inv.list" },
        ]),
      ],
      secondaryMenu: [],
    });
    const { container } = render(<RadixMenuContent roleName="admin" isDark />);
    const activeItem = screen.getByText("Dashboard");
    expect(activeItem.closest('[aria-current="page"]')).toBeTruthy();
    fireEvent.mouseEnter(activeItem);
    fireEvent.mouseLeave(activeItem);
    hoverAll(container);
  });

  it("renders dark mode collapsed with active grouped item", () => {
    const childPath = "/admin/hub/inventory/list";
    routerMock = mockRouter({ pathname: childPath });
    (useRouter as jest.Mock).mockReturnValue(routerMock);
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [
        group("inv", "Inventory", [
          { id: "inv-list", text: "Inventory List", icon, path: childPath, permissionKey: "inv.list" },
        ]),
      ],
      secondaryMenu: [flat("settings", "Settings", "/admin/hub/settings")],
    });
    const { container } = render(<RadixMenuContent roleName="admin" collapsed isDark />);
    const trigger = screen.getAllByRole("button")[0];
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: "Enter" });
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseLeave(trigger);
    hoverAll(container);
  });

  it("renders dark mode secondary items with selected state", () => {
    routerMock = mockRouter({ pathname: "/admin/hub/settings" });
    (useRouter as jest.Mock).mockReturnValue(routerMock);
    (useFilteredMenu as jest.Mock).mockReturnValue({
      mainMenu: [],
      secondaryMenu: [flat("settings", "Settings", "/admin/hub/settings")],
    });
    const { container } = render(<RadixMenuContent roleName="admin" isDark />);
    const selected = screen.getByRole("link", { name: "Settings" });
    expect(selected.getAttribute("aria-current")).toBe("page");
    fireEvent.mouseEnter(selected);
    fireEvent.mouseLeave(selected);
    hoverAll(container);
  });
});
