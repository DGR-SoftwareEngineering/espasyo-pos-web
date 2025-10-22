import * as React from "react";
import type { Theme, SxProps, Breakpoint } from "@mui/material/styles";
import { useTheme, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Collapse from "@mui/material/Collapse";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { EvaIcon } from "../EvaIcon";
import { varAlpha } from "minimal-shared/utils";
import { Scrollbar } from "./component/scrollbar/scrollbar";
import { Logo } from "./component/logo/Logo";
import {
  WorkspacesPopover,
  type WorkspacesPopoverProps,
} from "./component/workspaces-popover";

import type { MenuItemsChildren as MenuItemInput } from "./layouts/nav-config-dashboard";
import type { NavNode } from "./layouts/nav-config-dashboard";
import {
  buildTree,
  isActive,
  hasActiveDescendant,
  getLeftIconName,
  getExpanderIconName,
} from "./layouts/utils/nav-utils";

export type NavContentProps = {
  data: MenuItemInput[];
  slots?: { topArea?: React.ReactNode; bottomArea?: React.ReactNode };
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
        [theme.breakpoints.up(layoutQuery)]: { display: "flex" },
        ...sx,
      }}
    >
      <NavContent data={data} slots={slots} workspaces={workspaces} />
    </Box>
  );
}

export function NavContent({ data, slots, workspaces, sx }: NavContentProps) {
  const tree = React.useMemo(() => buildTree(data), [data]);
  const pathname = usePathname();
  return (
    <>
      <Logo />
      {slots?.topArea}
      <WorkspacesPopover data={workspaces} sx={{ my: 2 }} />

      <Scrollbar fillContent>
        <Box
          component="nav"
          sx={[
            { display: "flex", flex: "1 1 auto", flexDirection: "column" },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          {/* Root UL */}
          <List
            disablePadding
            sx={{ gap: 0.5, display: "flex", flexDirection: "column" }}
          >
            {tree.map((node) => (
              <NavNodeItem key={node.id} node={node} pathname={pathname} />
            ))}
          </List>
        </Box>
      </Scrollbar>

      {slots?.bottomArea}
    </>
  );
}

const NavNodeItem = React.memo(function NavNodeItem({
  node,
  pathname,
}: {
  node: NavNode;
  pathname: string | null;
}) {
  const theme = useTheme();
  const hasChildren = !!node.children?.length;
  const isCategoryOnly = hasChildren && (!node.path || node.path === "#");
  const active = pathname ? isActive(pathname, node) : false;
  const defaultOpen = pathname ? hasActiveDescendant(pathname, node) : false;
  const [open, setOpen] = React.useState(defaultOpen);

  React.useEffect(() => {
    if (pathname && hasActiveDescendant(pathname, node)) setOpen(true);
  }, [pathname, node.id]);

  const leftIcon = getLeftIconName(node);
  const rightIcon = hasChildren ? getExpanderIconName(open) : null;
  const indent = 2 + node.depth * 2;

  const buttonSx = (t: Theme) => ({
    pl: indent,
    py: 1,
    gap: 2,
    pr: 1.5,
    borderRadius: 0.75,
    typography: "body2",
    minHeight: 44,
    ...(active && {
      fontWeight: t.typography.fontWeightSemiBold,
      color: t.vars?.palette?.primary?.main ?? t.palette.primary.main,
      bgcolor: t.vars
        ? varAlpha(t.vars.palette.primary.mainChannel, 0.08)
        : alpha(t.palette.primary.main, 0.08),
      "&:hover": {
        bgcolor: t.vars
          ? varAlpha(t.vars.palette.primary.mainChannel, 0.16)
          : alpha(t.palette.primary.main, 0.16),
      },
    }),
  });

  if (isCategoryOnly) {
    return (
      <React.Fragment>
        {/* Header row as an li */}
        <ListItem disableGutters disablePadding component="li">
          <ListSubheader
            disableSticky
            component="div" // not an <li>
            sx={{
              mt: node.depth === 0 ? 1 : 0.5,
              mb: 0.5,
              lineHeight: 1.75,
              fontWeight: 700,
              color: theme.palette.text.secondary,
              bgcolor: "transparent",
              px: indent,
              width: "100%",
            }}
          >
            {node.label}
          </ListSubheader>
        </ListItem>

        <List disablePadding>
          {node.children!.map((c) => (
            <NavNodeItem key={c.id} node={c} pathname={pathname} />
          ))}
        </List>
      </React.Fragment>
    );
  }

  // --- PARENT WITH CHILDREN (collapsible) ---
  if (hasChildren) {
    return (
      <React.Fragment>
        <ListItem disableGutters disablePadding component="li">
          <ListItemButton
            onClick={() => setOpen((v) => !v)}
            sx={buttonSx(theme)}
            aria-expanded={open}
          >
            <Box component="span" sx={{ width: 24, height: 24 }}>
              <EvaIcon name={leftIcon} />
            </Box>
            <ListItemText primary={node.label} />
            {rightIcon && (
              <Box
                component="span"
                sx={{ width: 20, height: 20, color: "text.secondary" }}
              >
                <EvaIcon name={rightIcon} />
              </Box>
            )}
          </ListItemButton>
        </ListItem>

        <Collapse in={open} unmountOnExit>
          {/* Children list as a new UL */}
          <List disablePadding>
            {node.children!.map((c) => (
              <NavNodeItem key={c.id} node={c} pathname={pathname} />
            ))}
          </List>
        </Collapse>
      </React.Fragment>
    );
  }

  // --- LEAF (link) ---
  return (
    <ListItem disableGutters disablePadding component="li">
      {/* ✅ No legacyBehavior. Render the button as the Link itself. */}
      <ListItemButton
        component={Link}
        href={node.path || "#"}
        sx={buttonSx(theme)}
        aria-current={active ? "page" : undefined}
      >
        <Box component="span" sx={{ width: 24, height: 24 }}>
          <EvaIcon name={leftIcon} />
        </Box>
        <ListItemText primary={node.label} />
      </ListItemButton>
    </ListItem>
  );
});
