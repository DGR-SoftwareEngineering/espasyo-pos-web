import React from "react";
import { renderHook, act } from "@testing-library/react";
import {
  ThemePreferenceProvider,
  useThemePreference,
} from "../../core/contexts/theme/ThemePreferenceContext";

const STORAGE_KEY = "espasyo.theme.appearance";

function mockMatchMedia(prefersDark: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: prefersDark,
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

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemePreferenceProvider>{children}</ThemePreferenceProvider>
);

describe("ThemePreferenceContext", () => {
  beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
  });

  it("defaults to light when nothing in localStorage", () => {
    const { result } = renderHook(() => useThemePreference(), { wrapper });
    expect(result.current.appearance).toBe("light");
  });

  it("reads stored light preference from localStorage", () => {
    localStorage.setItem(STORAGE_KEY, "light");
    const { result } = renderHook(() => useThemePreference(), { wrapper });
    act(() => {});
    expect(result.current.appearance).toBe("light");
  });

  it("reads stored dark preference from localStorage", () => {
    localStorage.setItem(STORAGE_KEY, "dark");
    const { result } = renderHook(() => useThemePreference(), { wrapper });
    act(() => {});
    expect(result.current.appearance).toBe("dark");
  });

  it("uses system preference when no localStorage and system prefers dark", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useThemePreference(), { wrapper });
    act(() => {});
    expect(result.current.appearance).toBe("dark");
  });

  it("toggleAppearance switches from light to dark", () => {
    const { result } = renderHook(() => useThemePreference(), { wrapper });

    act(() => {
      result.current.toggleAppearance();
    });

    expect(result.current.appearance).toBe("dark");
  });

  it("toggleAppearance switches from dark to light", () => {
    localStorage.setItem(STORAGE_KEY, "dark");
    const { result } = renderHook(() => useThemePreference(), { wrapper });
    act(() => {});

    act(() => {
      result.current.toggleAppearance();
    });

    expect(result.current.appearance).toBe("light");
  });

  it("toggleAppearance persists to localStorage", () => {
    const { result } = renderHook(() => useThemePreference(), { wrapper });

    act(() => {
      result.current.toggleAppearance();
    });

    expect(localStorage.getItem(STORAGE_KEY)).toBe("dark");
  });

  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useThemePreference());
    }).toThrow("useThemePreference must be used within ThemePreferenceProvider");
  });
});
