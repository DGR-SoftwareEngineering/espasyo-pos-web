import type { ThemeProps } from "@radix-ui/themes";

export interface SpacingTokens {
  px: number;
  0.5: number;
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  7: number;
  8: number;
  9: number;
}

export const spacing: SpacingTokens = {
  px: 1,
  0.5: 2,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
};

export interface FontSizeTokens {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
  "3xl": number;
  "4xl": number;
  "5xl": number;
  "6xl": number;
  "7xl": number;
  "8xl": number;
  "9xl": number;
}

export const fontSize: FontSizeTokens = {
  xs: 12,
  sm: 13,
  md: 14,
  lg: 16,
  xl: 18,
  "2xl": 20,
  "3xl": 24,
  "4xl": 28,
  "5xl": 32,
  "6xl": 40,
  "7xl": 48,
  "8xl": 56,
  "9xl": 64,
};

export interface RadiusTokens {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export const radius: RadiusTokens = {
  none: 0,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  full: 9999,
};

export interface ShadowTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
}

export const shadow: ShadowTokens = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
};

export interface BreakpointTokens {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
}

export const breakpoints: BreakpointTokens = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

export type RadixAccentColor = NonNullable<ThemeProps["accentColor"]>;
export type RadixGrayColor = NonNullable<ThemeProps["grayColor"]>;

export interface DesignTokens {
  spacing: SpacingTokens;
  fontSize: FontSizeTokens;
  radius: RadiusTokens;
  shadow: ShadowTokens;
  breakpoints: BreakpointTokens;
}

export const designTokens: DesignTokens = {
  spacing,
  fontSize,
  radius,
  shadow,
  breakpoints,
};
