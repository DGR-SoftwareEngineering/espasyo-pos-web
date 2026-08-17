"use client";
import React, { createContext, useContext, useMemo } from "react";
import { useThemePreference } from "../core/contexts/theme/ThemePreferenceContext";
import { hexToRadixAccent } from "../business/colors";
import type { RadixAccentColor, RadixGrayColor, DesignTokens } from "./tokens";
import { designTokens } from "./tokens";

export interface ResolvedDesignTokens extends DesignTokens {
  appearance: "light" | "dark";
  accentColor: RadixAccentColor;
  grayColor: RadixGrayColor;
  primaryColor: string;
  secondaryColor: string;
  isDark: boolean;
  isLight: boolean;
}

interface DesignContextValue {
  tokens: ResolvedDesignTokens;
}

const DesignContext = createContext<DesignContextValue | null>(null);

interface DesignProviderProps {
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: RadixAccentColor;
  grayColor?: RadixGrayColor;
  children: React.ReactNode;
}

export const DesignProvider: React.FC<DesignProviderProps> = ({
  primaryColor,
  secondaryColor,
  accentColor,
  grayColor = "slate",
  children,
}) => {
  const { appearance } = useThemePreference();
  const isDark = appearance === "dark";
  const isLight = appearance === "light";

  const resolved = useMemo<ResolvedDesignTokens>(() => {
    const resolvedAccent =
      accentColor ??
      (primaryColor
        ? (hexToRadixAccent(primaryColor, "indigo") as RadixAccentColor)
        : "indigo");

    return {
      ...designTokens,
      appearance,
      accentColor: resolvedAccent,
      grayColor,
      primaryColor: primaryColor ?? "var(--indigo-9)",
      secondaryColor: secondaryColor ?? "var(--violet-9)",
      isDark,
      isLight,
    };
  }, [appearance, accentColor, primaryColor, secondaryColor, grayColor, isDark, isLight]);

  return (
    <DesignContext.Provider value={{ tokens: resolved }}>
      {children}
    </DesignContext.Provider>
  );
};

export const useDesignTokens = (): ResolvedDesignTokens => {
  const ctx = useContext(DesignContext);
  if (!ctx) {
    throw new Error("useDesignTokens must be used within a DesignProvider");
  }
  return ctx.tokens;
};
