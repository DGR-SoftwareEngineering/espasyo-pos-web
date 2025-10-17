import type { ThemeProviderProps as MuiThemeProviderProps } from "@mui/material/styles";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider as ThemeVarsProvider } from "@mui/material/styles";

import { createTheme } from "./create-theme";

import type {} from "./extend-theme-types"; //temporarily
import type { ThemeOptions } from "./types";
import { theme as tenantTheme } from "../theme";
import { CmsTenant } from "../../../api/content/types/tenant";
import deepmerge from "deepmerge";

// ----------------------------------------------------------------------

export type ThemeProviderProps = Partial<MuiThemeProviderProps> & {
  themeOverrides?: ThemeOptions;
  tenant?: CmsTenant | null;
};

export function ThemeProvider({
  themeOverrides,
  children,
  tenant,
  ...other
}: ThemeProviderProps) {
  const baseTheme = tenantTheme();

  const mergedTheme = deepmerge(baseTheme, themeOverrides ?? {});

  return (
    <ThemeVarsProvider disableTransitionOnChange theme={mergedTheme} {...other}>
      <CssBaseline />
      {children}
    </ThemeVarsProvider>
  );
}
