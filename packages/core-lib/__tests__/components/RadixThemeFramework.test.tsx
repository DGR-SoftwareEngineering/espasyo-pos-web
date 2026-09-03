import React from "react";
import { render, screen } from "../test-utils";

jest.mock("../../core/contexts", () => ({
  usePublicSettings: jest.fn(() => ({
    theme: { primaryColor: null, secondaryColor: null },
  })),
  ToastContextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DialogContextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  HeaderTitleContextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PageLoaderContextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  NotificationsContextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  FormSubmissionContextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("../../components/toast/Toastify", () => ({
  Toastify: () => null,
}));

jest.mock("../../components/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("../../components/menu/contexts/PermissionContext", () => ({
  PermissionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("../../components/radix/Dashboard", () => ({
  RadixDashboard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="radix-dashboard">{children}</div>
  ),
}));

jest.mock("../../components/radix/customer", () => ({
  CustomerShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="customer-shell">{children}</div>
  ),
}));

import { RadixThemeFramework } from "../../components/design/RadixThemeFramework";

const logout = jest.fn();

describe("RadixThemeFramework", () => {
  it("renders children without a shell when not authenticated", () => {
    render(
      <RadixThemeFramework isAuthenticated={false} logout={logout}>
        <div data-testid="login-page">Login</div>
      </RadixThemeFramework>
    );
    expect(screen.getByTestId("login-page")).toBeInTheDocument();
    expect(screen.queryByTestId("radix-dashboard")).toBeNull();
    expect(screen.queryByTestId("customer-shell")).toBeNull();
  });

  it("renders RadixDashboard for POS platform when authenticated", () => {
    render(
      <RadixThemeFramework isAuthenticated={true} logout={logout} platform="POS" role="admin">
        <div data-testid="dashboard-content">Admin</div>
      </RadixThemeFramework>
    );
    expect(screen.getByTestId("radix-dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-content")).toBeInTheDocument();
    expect(screen.queryByTestId("customer-shell")).toBeNull();
  });

  it("renders RadixDashboard by default when platform is not specified", () => {
    render(
      <RadixThemeFramework isAuthenticated={true} logout={logout}>
        <div data-testid="content">Content</div>
      </RadixThemeFramework>
    );
    expect(screen.getByTestId("radix-dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("renders CustomerShell for CustomerEngagement platform when authenticated", () => {
    render(
      <RadixThemeFramework
        isAuthenticated={true}
        logout={logout}
        platform="CustomerEngagement"
        role="customer"
      >
        <div data-testid="customer-content">Menu</div>
      </RadixThemeFramework>
    );
    expect(screen.getByTestId("customer-shell")).toBeInTheDocument();
    expect(screen.getByTestId("customer-content")).toBeInTheDocument();
    expect(screen.queryByTestId("radix-dashboard")).toBeNull();
  });
});
