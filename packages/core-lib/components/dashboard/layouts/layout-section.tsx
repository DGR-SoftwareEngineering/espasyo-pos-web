import type { Theme, SxProps, CSSObject } from "@mui/material/styles";
import { mergeClasses } from "minimal-shared/utils";
import { styled } from "@mui/material/styles";
import GlobalStyles from "@mui/material/GlobalStyles";
import { layoutClasses } from "../../../core/theme/classes";

export function layoutSectionVars(theme: Theme) {
  return {
    "--layout-nav-zIndex": theme.zIndex.drawer + 1,
    "--layout-nav-mobile-width": "288px",
    "--layout-header-blur": "8px",
    "--layout-header-zIndex": theme.zIndex.appBar + 1,
    "--layout-header-mobile-height": "64px",
    "--layout-header-desktop-height": "72px",
  };
}

export type LayoutSectionProps = React.ComponentProps<"div"> & {
  sx?: SxProps<Theme>;
  cssVars?: CSSObject;
  children?: React.ReactNode;
  footerSection?: React.ReactNode;
  headerSection?: React.ReactNode;
  sidebarSection?: React.ReactNode;
};

export function LayoutSection({
  sx,
  cssVars,
  children,
  footerSection,
  headerSection,
  sidebarSection,
  className,
  ...other
}: LayoutSectionProps) {
  const inputGlobalStyles = (
    <GlobalStyles
      styles={(theme) => ({
        body: { ...layoutSectionVars(theme), ...cssVars },
      })}
    />
  );

  return (
    <>
      {inputGlobalStyles}

      <LayoutRoot
        id="root__layout"
        className={mergeClasses([layoutClasses.root, className])}
        sx={sx}
        {...other}
      >
        {sidebarSection ? (
          <>
            {sidebarSection}
            <LayoutSidebarContainer className={layoutClasses.sidebarContainer}>
              {headerSection}
              {children}
              {footerSection}
            </LayoutSidebarContainer>
          </>
        ) : (
          <>
            {headerSection}
            {children}
            {footerSection}
          </>
        )}
      </LayoutRoot>
    </>
  );
}

const LayoutRoot = styled("div")``;

const LayoutSidebarContainer = styled("div")(() => ({
  display: "flex",
  flex: "1 1 auto",
  flexDirection: "column",
}));
