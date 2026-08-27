import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "../test-utils";

jest.mock("../../core/contexts", () => ({
  usePublicSettings: jest.fn(() => ({
    theme: { logoUrl: null },
    systemName: "TestApp",
  })),
}));

jest.mock("../../core/contexts/theme/ThemePreferenceContext", () => ({
  useThemePreference: jest.fn(() => require("../test-utils").mockThemePreference()),
}));

jest.mock("../../components/radix/menu/RadixMenuContent", () => ({
  RadixMenuContent: ({ onNavigate }: { onNavigate?: () => void }) => (
    <button data-testid="menu-content" onClick={onNavigate}>
      menu-content
    </button>
  ),
}));

jest.mock("../../components/radix/buttons/Button", () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="logout-btn">
      {children}
    </button>
  ),
}));

import { SideMenuMobile } from "../../components/radix/SideMenuMobile";
import { usePublicSettings } from "../../core/contexts";

describe("SideMenuMobile", () => {
  const onOpenChange = jest.fn();
  const logout = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    (usePublicSettings as jest.Mock).mockReturnValue({
      theme: { logoUrl: null },
      systemName: "TestApp",
    });
  });

  it("renders without crashing when closed", () => {
    const { container } = render(
      <SideMenuMobile open={false} onOpenChange={onOpenChange} />,
    );
    expect(container).toBeTruthy();
  });

  it("shows menu content when open", () => {
    render(<SideMenuMobile open={true} onOpenChange={onOpenChange} role="admin" />);
    expect(screen.getByTestId("menu-content")).toBeInTheDocument();
  });

  it("does not show menu content when closed", () => {
    render(<SideMenuMobile open={false} onOpenChange={onOpenChange} role="admin" />);
    expect(screen.queryByTestId("menu-content")).toBeNull();
  });

  it("calls onOpenChange(false) when close button clicked", () => {
    render(<SideMenuMobile open={true} onOpenChange={onOpenChange} role="admin" />);
    const closeBtn = screen.getByLabelText("Close menu");
    fireEvent.click(closeBtn);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls logout when logout button clicked", async () => {
    render(
      <SideMenuMobile
        open={true}
        onOpenChange={onOpenChange}
        logout={logout}
        role="admin"
      />,
    );
    const logoutBtn = screen.getByTestId("logout-btn");
    fireEvent.click(logoutBtn);
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it("renders brand name", () => {
    render(
      <SideMenuMobile open={true} onOpenChange={onOpenChange} brand="MyBrand" />,
    );
    expect(screen.getByText("MyBrand")).toBeInTheDocument();
  });

  it("renders a brand logo image when theme.logoUrl is set", () => {
    (usePublicSettings as jest.Mock).mockReturnValue({
      theme: { logoUrl: "http://example.com/logo.png" },
      systemName: "X",
    });
    render(
      <SideMenuMobile open={true} onOpenChange={onOpenChange} brand="MyBrand" />,
    );
    expect(screen.getByRole("img", { name: "MyBrand" })).toBeInTheDocument();
  });

  it("calls onNavigate and onOpenChange(false) when menu content navigates", () => {
    const onNavigate = jest.fn();
    render(
      <SideMenuMobile
        open={true}
        onOpenChange={onOpenChange}
        onNavigate={onNavigate}
        role="admin"
      />,
    );
    fireEvent.click(screen.getByTestId("menu-content"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onNavigate).toHaveBeenCalled();
  });

  it("renders the user email and initials when provided", () => {
    render(
      <SideMenuMobile
        open={true}
        onOpenChange={onOpenChange}
        email="a@b.c"
        initials="JD"
        role="admin"
      />,
    );
    expect(screen.getByText("a@b.c")).toBeInTheDocument();
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("disables the logout button while loading", () => {
    render(
      <SideMenuMobile
        open={true}
        onOpenChange={onOpenChange}
        logout={logout}
        loading
        role="admin"
      />,
    );
    expect(screen.getByTestId("logout-btn")).toBeDisabled();
  });
});
