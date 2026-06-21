import React from "react";
import { render, screen, act } from "@testing-library/react";
import {
  PageLoaderContextProvider,
  usePageLoaderContext,
} from "../../core/contexts/PageLoaderContext";

jest.mock("../../components/radix/BrandedLoader", () => ({
  BrandedLoader: ({ message }: { message?: string }) => (
    <div data-testid="branded-loader">{message}</div>
  ),
}));

jest.mock("../../components/radix/RouteTransitionLoader", () => ({
  RouteTransitionLoader: () => <div data-testid="route-transition-loader" />,
}));

const mockRouterEvents = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
};

jest.mock("../../core/router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn().mockResolvedValue(true),
    events: mockRouterEvents,
    asPath: "/",
    loading: false,
    pathname: "/",
    query: {},
    title: "",
    staticRoutes: {},
  })),
}));

const TestConsumer = () => {
  const { isLoading, isContentTransition, startContentTransition, endContentTransition } =
    usePageLoaderContext();
  return (
    <div>
      <span data-testid="isLoading">{String(isLoading)}</span>
      <span data-testid="isContentTransition">{String(isContentTransition)}</span>
      <button data-testid="start" onClick={startContentTransition}>
        Start
      </button>
      <button data-testid="end" onClick={endContentTransition}>
        End
      </button>
    </div>
  );
};

describe("PageLoaderContextProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children in a wrapper div when not loading", () => {
    render(
      <PageLoaderContextProvider>
        <div data-testid="child">Content</div>
      </PageLoaderContextProvider>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("shows children-component wrapper by default", () => {
    render(
      <PageLoaderContextProvider>
        <div data-testid="child">Content</div>
      </PageLoaderContextProvider>
    );
    expect(screen.getByTestId("children-component")).toBeInTheDocument();
  });

  it("starts with isLoading false", () => {
    render(
      <PageLoaderContextProvider>
        <TestConsumer />
      </PageLoaderContextProvider>
    );
    expect(screen.getByTestId("isLoading")).toHaveTextContent("false");
  });

  it("starts with isContentTransition false", () => {
    render(
      <PageLoaderContextProvider>
        <TestConsumer />
      </PageLoaderContextProvider>
    );
    expect(screen.getByTestId("isContentTransition")).toHaveTextContent("false");
  });

  it("startContentTransition sets isContentTransition to true", () => {
    render(
      <PageLoaderContextProvider isAuthenticated>
        <TestConsumer />
      </PageLoaderContextProvider>
    );

    act(() => {
      screen.getByTestId("start").click();
    });

    expect(screen.getByTestId("isContentTransition")).toHaveTextContent("true");
  });

  it("endContentTransition sets isContentTransition back to false", () => {
    render(
      <PageLoaderContextProvider isAuthenticated>
        <TestConsumer />
      </PageLoaderContextProvider>
    );

    act(() => {
      screen.getByTestId("start").click();
    });
    act(() => {
      screen.getByTestId("end").click();
    });

    expect(screen.getByTestId("isContentTransition")).toHaveTextContent("false");
  });

  it("throws when used outside provider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow(
      "usePageLoaderContext must be used within a PageLoaderContextProvider"
    );

    consoleError.mockRestore();
  });
});
