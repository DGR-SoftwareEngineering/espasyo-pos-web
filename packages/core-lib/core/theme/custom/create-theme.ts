// create-theme.ts
import {
  extendTheme,
  type CssVarsThemeOptions,
  type Theme,
} from "@mui/material/styles";

import { shadows } from "./core/shadows";
import { palette } from "./core/palette";
import { themeConfig } from "./theme-config";
import { components } from "./core/components";
import { typography } from "./core/typography";
import { customShadows } from "./core/custom-shadows";
import type { ThemeOptions } from "./types";

export const baseTheme: ThemeOptions & { sizes?: unknown } = {
  colorSchemes: {
    light: {
      palette: palette.light,
      shadows: shadows.light as any,
      customShadows: customShadows.light as any,
    },
  },
  components,
  typography,
  shape: { borderRadius: 8 },
  cssVariables: themeConfig.cssVariables,
  sizes: {} as any,
};

export function createTheme(overrides?: ThemeOptions): Theme {
  return extendTheme(
    baseTheme as CssVarsThemeOptions,
    (overrides ?? {}) as CssVarsThemeOptions
  );
}
