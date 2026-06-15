import clsx, { ClassValue } from "clsx";

export const cn = (...inputs: ClassValue[]): string => clsx(...inputs);

export type MuiSemanticColor =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "default";

/**
 * Subset of Radix accent colors we actually use in components. Radix Themes
 * supports the full set ("ruby", "tomato", "crimson", "pink", ...) — extend
 * this union when a component needs one.
 */
export type RadixAccent =
  | "indigo"
  | "violet"
  | "green"
  | "amber"
  | "red"
  | "blue"
  | "gray"
  | "teal"
  | "orange"
  | "cyan";

/**
 * Closest Radix accent for each MUI semantic palette name.
 *   primary   → indigo  (matches the brand-leaning purple the tenant theme
 *                         defaults to: `#8E2ADD`; if you switch a tenant to
 *                         a different family the right answer is the future
 *                         bridge from `tenant.primaryColor`)
 *   secondary → violet
 *   success   → green   (matches `ui_rag.Green.400` = #00703C)
 *   warning   → amber   (matches `ui_rag.Amber.400` = #FCB900)
 *   error     → red     (matches `ui_rag.Red.400`   = #CF223F)
 *   info      → blue
 *   default   → gray
 */
export const muiToRadixAccent: Record<MuiSemanticColor, RadixAccent> = {
  primary: "indigo",
  secondary: "violet",
  success: "green",
  warning: "amber",
  error: "red",
  info: "blue",
  default: "gray",
};

export const resolveAccent = (
  color: MuiSemanticColor | RadixAccent | undefined,
  fallback: RadixAccent = "indigo",
): RadixAccent => {
  if (!color) return fallback;
  if (color in muiToRadixAccent) {
    return muiToRadixAccent[color as MuiSemanticColor];
  }
  return color as RadixAccent;
};

/**
 * CSS-var helpers for ad-hoc styling on Radix surfaces.
 *
 * - `accent(c, n)` / `accentAlpha(c, n)` — Radix accent scale 1-12 (solid) / a1-a12 (alpha).
 * - `gray(n)` / `grayAlpha(n)` — Radix gray scale.
 * - `panelSolid` / `panelTranslucent` / `surface` / `background` — surface tokens.
 * - `radius{1..6}` — Radix radius tokens (radius `1` is tightest).
 *
 * Use these instead of MUI's `alpha(theme.palette.x.main, 0.1)`.
 */
export const radixVar = {
  accent: (accent: RadixAccent, step: number) => `var(--${accent}-${step})`,
  accentAlpha: (accent: RadixAccent, step: number) =>
    `var(--${accent}-a${step})`,
  gray: (step: number) => `var(--gray-${step})`,
  grayAlpha: (step: number) => `var(--gray-a${step})`,
  panelSolid: "var(--color-panel-solid)",
  panelTranslucent: "var(--color-panel-translucent)",
  surface: "var(--color-surface)",
  background: "var(--color-background)",
  radius1: "var(--radius-1)",
  radius2: "var(--radius-2)",
  radius3: "var(--radius-3)",
  radius4: "var(--radius-4)",
  radius5: "var(--radius-5)",
  radius6: "var(--radius-6)",
};

// =====================================================================
//  Custom typography variants (from MUI theme)
// =====================================================================
//
//  The MUI theme declares extra variants — `firstLevelValue`, `secondLevelValue`,
//  `badge`, `sublabel`, `accessibleText`. Radix `<Text>` / `<Heading>` only
//  expose size 1-9. We keep parity by exporting a styled-prop map that any
//  Radix component can spread.
//
//  Sizes are taken straight from `core-lib/core/theme/theme.ts`:
//    - accessibleText : 19px / 1.45 / 700
//    - badge          : 12px / 1.45 / 400
//    - sublabel       : 10px / 1.625 / 400
//    - firstLevelValue: 28px / 1.28 / 700
//    - secondLevelValue: 22px / 1.45 / 700

export type RadixTypoVariant =
  | "firstLevelValue"
  | "secondLevelValue"
  | "badge"
  | "sublabel"
  | "accessibleText";

export const radixTypography: Record<RadixTypoVariant, React.CSSProperties> = {
  firstLevelValue: { fontSize: "1.75rem", lineHeight: 1.28, fontWeight: 700 },
  secondLevelValue: { fontSize: "1.375rem", lineHeight: 1.45, fontWeight: 700 },
  badge: { fontSize: "0.75rem", lineHeight: 1.45, fontWeight: 400 },
  sublabel: { fontSize: "0.625rem", lineHeight: 1.625, fontWeight: 400 },
  accessibleText: { fontSize: "19px", lineHeight: 1.45, fontWeight: 700 },
};
