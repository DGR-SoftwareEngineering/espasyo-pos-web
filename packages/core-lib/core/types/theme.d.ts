import type * as React from "react";
import "@mui/material/styles";

interface AppColorOptions {
  light: string;
  transparentLight: string;
  dark: string;
  transparentDark: string;
}

interface EssencialColors {
  1000: string;
  800: string;
  500: string;
  300: string;
  100: string;
}

interface IncidentalColors {
  "075": string;
  "035": string;
  "025": string;
  "000": string;
}

interface UIRagColors {
  "Red.400": string;
  "Red.075": string;
  "Red.025": string;
  "Amber.400": string;
  "Amber.075": string;
  "Amber.025": string;
  "Green.400": string;
  "Green.075": string;
  "Green.025": string;
}

interface GreyColors {
  grey: string;
  grey050: string;
}

interface CustomPalette {
  appColors: {
    primary: string;
    secondary: AppColorOptions;
    tertiary: AppColorOptions;
    support60: AppColorOptions;
    support80: AppColorOptions;
    essential: EssencialColors;
    incidental: IncidentalColors;
    ui_rag: UIRagColors;
  } & GreyColors;

  email: {
    header?: string;
    footer: {
      first?: string;
      second?: string;
      third?: string;
      fourth?: string;
    };
  };

  footer: {
    text: string;
    darkText: string;
    light: string;
    dark: string;
  };

  input: {
    hoverBorder?: string;
  };

  radio: {
    outer: string;
    focus: string;
  };
}

interface ThemeSizes {
  contentWidth: number | string;
  contentPaddingX: number | string;
  mobileContentPaddingX: number | string;
  errorsTooltip: number | string;
  fieldTooltip: number | string;
  headerHeight: number | string;
  mobileHeaderHeight: number | string;
  stickOutPageWidth: number | string;
  numberFieldWidth: number | string;
  parentListPadding: number | string;
}

declare module "@mui/material/styles" {
  interface Palette extends CustomPalette {}
  interface PaletteOptions extends Partial<CustomPalette> {}

  interface Theme {
    sizes: ThemeSizes;
  }
  interface ThemeOptions {
    sizes?: Partial<ThemeSizes> | ThemeSizes;
  }

  interface ColorSystemPalette extends Palette {}
  interface ColorSystemPaletteOptions extends PaletteOptions {}

  interface TypographyVariants {
    firstLevelValue: React.CSSProperties;
    secondLevelValue: React.CSSProperties;
    badge: React.CSSProperties;
    sublabel: React.CSSProperties;
    accessibleText: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    firstLevelValue?: React.CSSProperties;
    secondLevelValue?: React.CSSProperties;
    badge?: React.CSSProperties;
    sublabel?: React.CSSProperties;
    accessibleText?: React.CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    firstLevelValue: true;
    secondLevelValue: true;
    badge: true;
    sublabel: true;
    accessibleText: true;
  }
}
