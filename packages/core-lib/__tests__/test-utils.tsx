"use client";
import React, { ReactElement } from "react";
import { render as rtlRender, RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemePreferenceProvider } from "../core/contexts/theme/ThemePreferenceContext";
import { DesignProvider } from "../design-system";
import { TenantContextProvider } from "../core/contexts/TenantContext";
import type { CmsTenant } from "../api/content/types/tenant";

export * from "@testing-library/react";
export { userEvent };

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  tenant?: CmsTenant | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

/**
 * Drop-in replacement for RTL's render(). Wraps ui in the real
 * ThemePreferenceProvider + DesignProvider + TenantContextProvider —
 * the only three context providers in the tree that are pure/synchronous
 * (no useApi/useAsync fetch on mount) and therefore safe to use for real
 * in a unit test instead of mocking.
 */
export function render(ui: ReactElement, options?: CustomRenderOptions) {
  const { tenant = null, primaryColor, secondaryColor, ...rtlOptions } = options ?? {};

  // ThemePreferenceProvider calls window.matchMedia on mount; mock it so tests don't fail
  if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  }

  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <TenantContextProvider tenant={tenant as CmsTenant}>
        <ThemePreferenceProvider>
          <DesignProvider primaryColor={primaryColor} secondaryColor={secondaryColor}>
            {children}
          </DesignProvider>
        </ThemePreferenceProvider>
      </TenantContextProvider>
    ),
    ...rtlOptions,
  });
}

/** Wrapper component form, for renderHook({ wrapper: TestProviders }). */
export const TestProviders: React.FC<React.PropsWithChildren<{ tenant?: CmsTenant | null }>> = ({
  children,
  tenant = null,
}) => (
  <TenantContextProvider tenant={tenant as CmsTenant}>
    <ThemePreferenceProvider>
      <DesignProvider>{children}</DesignProvider>
    </ThemePreferenceProvider>
  </TenantContextProvider>
);

// ---- Shared default mock shapes (consumed from inside jest.mock() factories) ----

export const mockRouter = (overrides: Record<string, unknown> = {}) => ({
  pathname: "/",
  asPath: "/",
  route: "/",
  query: {},
  push: jest.fn(),
  replace: jest.fn(),
  events: { on: jest.fn(), off: jest.fn() },
  isReady: true,
  loading: false,
  staticRoutes: {},
  title: "",
  ...overrides,
});

export const mockResolution = (overrides: Record<string, boolean> = {}) => ({
  isMobile: false,
  isSmallMobile: false,
  isTablet: false,
  isDesktop: true,
  ...overrides,
});

export const mockThemePreference = (overrides: Record<string, unknown> = {}) => ({
  appearance: "light" as const,
  toggleAppearance: jest.fn(),
  ...overrides,
});

export const mockDesignTokens = (overrides: Record<string, unknown> = {}) => ({
  accentColor: "indigo",
  spacing: { 5: "20px" },
  tokens: { accentColor: "indigo" },
  ...overrides,
});

export const mockApiCallback = (overrides: Record<string, unknown> = {}) => ({
  execute: jest.fn(),
  loading: false,
  error: undefined,
  result: undefined,
  status: "success",
  ...overrides,
});

export const mockApiResult = (overrides: Record<string, unknown> = {}) => ({
  loading: false,
  error: undefined,
  result: undefined,
  status: "success",
  ...overrides,
});

export const mockFramerMotion = () => {
  const r = require("react");
  return {
    motion: {
      aside: r.forwardRef((props: any, ref: any) => r.createElement("aside", { ...props, ref }, props.children)),
      div: r.forwardRef((props: any, ref: any) => r.createElement("div", { ...props, ref }, props.children)),
    },
    AnimatePresence: ({ children }: any) => children,
  };
};
