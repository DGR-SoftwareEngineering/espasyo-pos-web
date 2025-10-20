import type { Theme, SxProps, Breakpoint } from "@mui/material/styles";
import { varAlpha } from "minimal-shared/utils";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import { useTheme } from "@mui/material/styles";
import ListItemButton from "@mui/material/ListItemButton";
import { MenuItems } from "./layouts/nav-config-dashboard";
import {
  WorkspacesPopover,
  WorkspacesPopoverProps,
} from "./component/workspaces-popover";
import { Scrollbar } from "./component/scrollbar/scrollbar";
import { Logo } from "./component/logo/Logo";
import { useRouter } from "../../core/router";
import { usePathname } from "next/navigation";
import { EvaIcon } from "../EvaIcon";
import Link from "next/link";
import { alpha } from "@mui/material/styles";

export type NavContentProps = {
  data: MenuItems[];
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  workspaces: WorkspacesPopoverProps["data"];
  sx?: SxProps<Theme>;
};

export function NavDesktop({
  sx,
  data,
  slots,
  workspaces,
  layoutQuery,
}: NavContentProps & { layoutQuery: Breakpoint }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        pt: 2.5,
        px: 2.5,
        top: 0,
        left: 0,
        height: 1,
        display: "none",
        position: "fixed",
        flexDirection: "column",
        zIndex: "var(--layout-nav-zIndex)",
        width: "var(--layout-nav-vertical-width)",
        borderRight: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        [theme.breakpoints.up(layoutQuery)]: {
          display: "flex",
        },
        ...sx,
      }}
    >
      <NavContent data={data} slots={slots} workspaces={workspaces} />
    </Box>
  );
}

export function NavContent({ data, slots, workspaces, sx }: NavContentProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <>
      <Logo />

      {slots?.topArea}

      <WorkspacesPopover data={workspaces} sx={{ my: 2 }} />

      <Scrollbar fillContent>
        <Box
          component="nav"
          sx={[
            {
              display: "flex",
              flex: "1 1 auto",
              flexDirection: "column",
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          <Box
            component="ul"
            sx={{
              gap: 0.5,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {data.map((item) => {
              //   const isActived = item.path === pathname;

              return (
                <ListItem disableGutters disablePadding key={item.label}>
                  <Link href={item.path} passHref legacyBehavior>
                    <ListItemButton
                      disableGutters
                      LinkComponent="a"
                      sx={[
                        (theme) => ({
                          pl: 2,
                          py: 1,
                          gap: 2,
                          pr: 1.5,
                          borderRadius: 0.75,
                          typography: "body2",
                          minHeight: 44,
                          // add if isActivated
                          ...{
                            fontWeight: "fontWeightSemiBold",
                            color: theme.vars.palette.primary.main,
                            bgcolor: varAlpha(
                              theme.vars.palette.primary.mainChannel,
                              0.08
                            ),
                            "&:hover": {
                              bgcolor: varAlpha(
                                theme.vars.palette.primary.mainChannel,
                                0.16
                              ),
                            },
                          },
                        }),
                      ]}
                    >
                      <Box component="span" sx={{ width: 24, height: 24 }}>
                        <EvaIcon name={item.icon} />
                      </Box>

                      <Box component="span" sx={{ flexGrow: 1 }}>
                        {item.label}
                      </Box>

                      {/* {item.info && item.info} */}
                    </ListItemButton>
                  </Link>
                </ListItem>
              );
            })}
          </Box>
        </Box>
      </Scrollbar>

      {slots?.bottomArea}
    </>
  );
}
