import React from "react";
import { render, screen } from "../test-utils";

jest.mock("../../core/contexts", () => ({
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

import { AppShell } from "../../components/radix/primitives/AppShell";

describe("AppShell", () => {
  const logout = jest.fn();

  it("renders children", () => {
    render(
      <AppShell isAuthenticated={false} logout={logout}>
        <div data-testid="child">hello</div>
      </AppShell>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    render(
      <AppShell isAuthenticated={true} logout={logout} role="admin">
        <span data-testid="page-content">Dashboard</span>
      </AppShell>
    );
    expect(screen.getByTestId("page-content")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeTruthy();
  });

  it("renders children when not authenticated", () => {
    render(
      <AppShell isAuthenticated={false} logout={logout}>
        <span data-testid="login-form">Login</span>
      </AppShell>
    );
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });

  it("accepts role prop without crashing", () => {
    expect(() =>
      render(
        <AppShell isAuthenticated={true} logout={logout} role="cashier">
          <div>child</div>
        </AppShell>
      )
    ).not.toThrow();
  });
});
