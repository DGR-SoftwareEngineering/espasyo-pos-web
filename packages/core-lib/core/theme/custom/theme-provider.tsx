import type { ThemeProviderProps as MuiThemeProviderProps } from "@mui/material/styles";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider as ThemeVarsProvider } from "@mui/material/styles";

import { createTheme } from "./create-theme";
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
  const baseOptions = tenantTheme() as ThemeOptions;

  const mergedOptions = deepmerge(
    baseOptions,
    themeOverrides ?? {}
  ) as ThemeOptions;

  const theme = createTheme(mergedOptions);

  return (
    <ThemeVarsProvider disableTransitionOnChange theme={theme} {...other}>
      <CssBaseline />
      {children}
    </ThemeVarsProvider>
  );
}
