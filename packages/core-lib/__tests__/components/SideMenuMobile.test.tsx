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
  RadixMenuContent: () => <div data-testid="menu-content" />,
}));

jest.mock("../../components/radix/buttons/Button", () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="logout-btn">
      {children}
    </button>
  ),
}));

import { SideMenuMobile } from "../../components/radix/SideMenuMobile";

describe("SideMenuMobile", () => {
  const onOpenChange = jest.fn();
  const logout = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing when closed", () => {
    const { container } = render(
      <SideMenuMobile open={false} onOpenChange={onOpenChange} />
    );
    expect(container).toBeTruthy();
  });

  it("shows menu content when open", () => {
    render(
      <SideMenuMobile open={true} onOpenChange={onOpenChange} role="admin" />
    );
    expect(screen.getByTestId("menu-content")).toBeInTheDocument();
  });

  it("does not show menu content when closed", () => {
    render(
      <SideMenuMobile open={false} onOpenChange={onOpenChange} role="admin" />
    );
    expect(screen.queryByTestId("menu-content")).toBeNull();
  });

  it("calls onOpenChange(false) when close button clicked", () => {
    render(
      <SideMenuMobile open={true} onOpenChange={onOpenChange} role="admin" />
    );
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
      />
    );
    const logoutBtn = screen.getByTestId("logout-btn");
    fireEvent.click(logoutBtn);
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it("renders brand name", () => {
    render(
      <SideMenuMobile open={true} onOpenChange={onOpenChange} brand="MyBrand" />
    );
    expect(screen.getByText("MyBrand")).toBeInTheDocument();
  });
});
