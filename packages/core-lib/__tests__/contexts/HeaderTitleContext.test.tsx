import React from "react";
import { render, screen } from "@testing-library/react";
import "../test-utils";
import {
  HeaderTitleContextProvider,
  useHeaderTitleContext,
} from "../../core/contexts/HeaderTitleContext";

const mockTitle = "Test Page";

jest.mock("../../core/router", () => ({
  useRouter: jest.fn(() => ({
    ...require("../test-utils").mockRouter(),
    title: mockTitle,
  })),
}));

describe("HeaderTitleContextProvider", () => {
  it("renders children without crashing", () => {
    render(
      <HeaderTitleContextProvider>
        <div data-testid="child">Content</div>
      </HeaderTitleContextProvider>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    render(
      <HeaderTitleContextProvider>
        <span data-testid="first">First</span>
        <span data-testid="second">Second</span>
      </HeaderTitleContextProvider>
    );
    expect(screen.getByTestId("first")).toBeInTheDocument();
    expect(screen.getByTestId("second")).toBeInTheDocument();
  });
});

describe("useHeaderTitleContext", () => {
  it("returns context value when inside provider", () => {
    const TestComponent = () => {
      const ctx = useHeaderTitleContext();
      return <div data-testid="ctx">{typeof ctx === "object" ? "ok" : "fail"}</div>;
    };

    render(
      <HeaderTitleContextProvider>
        <TestComponent />
      </HeaderTitleContextProvider>
    );

    expect(screen.getByTestId("ctx")).toHaveTextContent("ok");
  });
});
