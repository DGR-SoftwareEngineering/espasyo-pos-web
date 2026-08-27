import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("framer-motion", () => require("../test-utils").mockFramerMotion());

// next/router is handled by moduleNameMapper → __mocks__/nextRouter.js

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

jest.mock("../../core/contexts/theme/ThemePreferenceContext", () => ({
  useThemePreference: jest.fn(() => require("../test-utils").mockThemePreference()),
}));

jest.mock("../../components/radix/menu/RadixMenuContent", () => ({
  RadixMenuContent: function() { return require("react").createElement("div", { "data-testid": "menu-content" }); },
}));

jest.mock("../../components/radix/security/MpinManagementDialog", () => ({
  MpinManagementDialog: function() { return null; },
}));

import { SideMenu } from "../../components/radix/SideMenu";
import { useResolution } from "../../core/hooks";
import { useOfflineMode, usePublicSettings } from "../../core/contexts";
import { mockResolution } from "../test-utils";

const logout = jest.fn().mockResolvedValue(undefined);

describe("SideMenu", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useResolution as jest.Mock).mockReturnValue(mockResolution());
    (usePublicSettings as jest.Mock).mockReturnValue({
      systemName: "TestBrand",
      theme: { logoUrl: null },
    });
    (useOfflineMode as jest.Mock).mockReturnValue({ isOnline: true, pendingSalesCount: 0 });
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
});
