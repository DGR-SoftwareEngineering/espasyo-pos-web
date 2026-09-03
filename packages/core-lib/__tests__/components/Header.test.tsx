import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("../../core/router", () => ({
  useRouter: jest.fn(() => ({ pathname: "/", asPath: "/", push: jest.fn() })),
}));

jest.mock("../../core/hooks", () => ({
  useResolution: jest.fn(() => ({
    isSmallMobile: false,
    isDesktop: true,
    isMobile: false,
    isTablet: false,
  })),
}));

jest.mock("../../core/contexts", () => ({
  useHeaderTitleContext: jest.fn(() => ({ headerTitle: "" })),
}));

jest.mock("../../components/radix/menu/HeaderSearch", () => ({
  HeaderSearch: () => <div data-testid="header-search" />,
}));

jest.mock("../../components/radix/menu/HeaderSalesTarget", () => ({
  HeaderSalesTarget: () => <div data-testid="header-sales-target" />,
}));

import { Header } from "../../components/radix/Header";
import { useRouter } from "../../core/router";
import { useResolution } from "../../core/hooks";

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ pathname: "/", asPath: "/", push: jest.fn() });
    (useResolution as jest.Mock).mockReturnValue({
      isSmallMobile: false, isDesktop: true, isMobile: false, isTablet: false,
    });
  });

  it("renders without crashing", () => {
    const { container } = render(<Header />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders the data-layout attribute", () => {
    const { container } = render(<Header />);
    const header = container.querySelector("[data-layout='app-header']");
    expect(header).toBeInTheDocument();
  });

  it("renders HeaderSalesTarget", () => {
    render(<Header />);
    expect(screen.getByTestId("header-sales-target")).toBeInTheDocument();
  });

  it("renders HeaderSearch on desktop", () => {
    render(<Header />);
    expect(screen.getByTestId("header-search")).toBeInTheDocument();
  });

  it("does not render HeaderSearch when not desktop", () => {
    (useResolution as jest.Mock).mockReturnValue({
      isSmallMobile: false, isDesktop: false, isMobile: true, isTablet: false,
    });
    render(<Header />);
    expect(screen.queryByTestId("header-search")).toBeNull();
  });

  it("renders endSlot when provided", () => {
    render(<Header endSlot={<button data-testid="action-btn">Action</button>} />);
    expect(screen.getByTestId("action-btn")).toBeInTheDocument();
  });

  it("renders Home breadcrumb link for multi-segment routes", () => {
    (useRouter as jest.Mock).mockReturnValue({
      pathname: "/admin/hub/products",
      asPath: "/admin/hub/products",
      push: jest.fn(),
    });
    render(<Header />);
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("does not render breadcrumb Home link on root path", () => {
    (useRouter as jest.Mock).mockReturnValue({ pathname: "/", asPath: "/", push: jest.fn() });
    render(<Header />);
    expect(screen.queryByText("Home")).toBeNull();
  });
});
