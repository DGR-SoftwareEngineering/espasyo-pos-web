import type { Breakpoint } from "@mui/material/styles";
import { merge } from "es-toolkit";
import { useBoolean } from "minimal-shared/hooks";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import { useTheme } from "@mui/material/styles";
import { NavDesktop } from "../nav";
import { layoutClasses } from "../../../core/theme/classes";
import { dashboardLayoutVars } from "../css-vars";
import { _account, authorizedNav } from "./nav-config-dashboard";
import { MainSection } from "../main-section";
import { MenuButton } from "../component/menu-button";
import { AuthHeader } from "../../Headers/dashboard/AuthHeader";
import { LayoutSection } from "./layout-section";

import type { MainSectionProps } from "../main-section";
import type { AuthHeaderProps } from "../../Headers/dashboard/AuthHeader";
import type { LayoutSectionProps } from "./layout-section";
import { AccountPopover } from "../component/AccountPopover";
import { LogoutOptions } from "../../../core/contexts/auth/types";

type LayoutBaseProps = Pick<LayoutSectionProps, "sx" | "children" | "cssVars">;

export type DashboardLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: AuthHeaderProps;
    main?: MainSectionProps;
  };
  logout: (options?: LogoutOptions | undefined) => Promise<void>;
  loading?: boolean;
};

export function DashboardLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = "lg",
  logout,
  loading,
}: DashboardLayoutProps) {
  const theme = useTheme();
  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const renderHeader = () => {
    const headerSlotProps: AuthHeaderProps["slotProps"] = {
      container: {
        maxWidth: false,
      },
    };

    const headerSlots: AuthHeaderProps["slots"] = {
      topArea: (
        <Alert severity="info" sx={{ display: "none", borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      leftArea: (
        <>
          {/** @slot Nav mobile */}
          <MenuButton
            onClick={onOpen}
            sx={{
              mr: 1,
              ml: -1,
              [theme.breakpoints.up(layoutQuery)]: { display: "none" },
            }}
          />
          {/* <NavMobile data={navData} open={open} onClose={onClose} workspaces={_workspaces} /> */}
        </>
      ),
      rightArea: (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0, sm: 0.75 },
          }}
        >
          {/** @slot Searchbar */}
          {/* <Searchbar /> */}

          {/** @slot Language popover */}
          {/* <LanguagePopover data={_langs} /> */}

          {/** @slot Notifications popover */}
          {/* <NotificationsPopover data={_notifications} /> */}

          {/** @slot Account drawer */}
          <AccountPopover data={_account} logout={logout} />
        </Box>
      ),
    };

    return (
      <AuthHeader
        disableElevation
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={slotProps?.header?.sx}
      />
    );
  };

  const renderFooter = () => null;

  const renderMain = () => (
    <MainSection {...slotProps?.main}>{children}</MainSection>
  );

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
       * @Sidebar
       *************************************** */
      sidebarSection={
        <NavDesktop
          data={authorizedNav}
          layoutQuery={layoutQuery}
          workspaces={[]}
        />
      }
      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={{ ...dashboardLayoutVars(theme), ...cssVars }}
      sx={[
        {
          [`& .${layoutClasses.sidebarContainer}`]: {
            [theme.breakpoints.up(layoutQuery)]: {
              pl: "var(--layout-nav-vertical-width)",
              transition: theme.transitions.create(["padding-left"], {
                easing: "var(--layout-transition-easing)",
                duration: "var(--layout-transition-duration)",
              }),
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {renderMain()}
    </LayoutSection>
  );
}
