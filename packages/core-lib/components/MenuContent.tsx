import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "../core/router";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import { alpha, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { MenuItem } from "./menu/config/menuConfig";
import { useFilteredMenu } from "./menu/hooks/useFilteredMenu";
import { usePageLoaderContext } from "../core/contexts";

interface NestedMenuProps {
  item: MenuItem;
  depth?: number;
  selectedPath: string;
  onSelect: (path: string) => void;
  openStates: { [key: string]: boolean };
  onToggle: (itemId: string) => void;
}

const NestedMenuItem = ({
  item,
  depth = 0,
  selectedPath,
  onSelect,
  openStates,
  onToggle,
}: NestedMenuProps) => {
  const theme = useTheme();
  const hasNested = item.nestedItems && item.nestedItems.length > 0;
  const isOpen = openStates[item.id] || false;

  const isSelected = item.path === selectedPath;
  const hasSelectedChild = item.nestedItems?.some(
    (nestedItem) => nestedItem.path === selectedPath,
  );

  const handleClick = () => {
    if (hasNested) {
      onToggle(item.id);
    } else if (item.path) {
      onSelect(item.path);
    }
  };

  return (
    <>
      <ListItem disablePadding sx={{ display: "block" }}>
        <ListItemButton
          onClick={handleClick}
          selected={isSelected || hasSelectedChild}
          sx={{
            pl: depth * 2 + 1,
            pr: 2,
            py: 1,
            borderLeft: isSelected || hasSelectedChild ? 3 : 0,
            borderColor: "primary.main",
            backgroundColor:
              isSelected || hasSelectedChild
                ? alpha(theme.palette.primary.main, 0.08)
                : "transparent",
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
            },
            "&.Mui-selected": {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.16),
              },
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 40,
              color:
                isSelected || hasSelectedChild ? "primary.main" : "inherit",
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.text}
            primaryTypographyProps={{
              fontSize: depth === 0 ? "0.9rem" : "0.85rem",
              fontWeight: isSelected || hasSelectedChild ? 600 : 400,
              color:
                isSelected || hasSelectedChild ? "primary.main" : "inherit",
            }}
          />
          {hasNested && (isOpen ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </ListItem>

      {hasNested && (
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.nestedItems?.map((nestedItem) => (
              <ListItem key={nestedItem.id} disablePadding>
                <ListItemButton
                  sx={{
                    pl: depth * 2 + 3,
                    py: 0.75,
                    borderLeft: nestedItem.path === selectedPath ? 3 : 0,
                    borderColor: "primary.main",
                    backgroundColor:
                      nestedItem.path === selectedPath
                        ? alpha(theme.palette.primary.main, 0.08)
                        : "transparent",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                  onClick={() => onSelect(nestedItem.path)}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color:
                        nestedItem.path === selectedPath
                          ? "primary.main"
                          : "text.secondary",
                    }}
                  >
                    {nestedItem.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={nestedItem.text}
                    primaryTypographyProps={{
                      fontSize: "0.85rem",
                      color:
                        nestedItem.path === selectedPath
                          ? "primary.main"
                          : "text.secondary",
                      fontWeight: nestedItem.path === selectedPath ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

interface MenuContentProps {
  roleName: string;
  loading?: boolean;
}

export default function MenuContent({ roleName, loading }: MenuContentProps) {
  const router = useRouter();
  const theme = useTheme();
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [openStates, setOpenStates] = useState<{ [key: string]: boolean }>({});
  const { startContentTransition } = usePageLoaderContext();

  const { mainMenu, secondaryMenu } = useFilteredMenu(roleName);

  const mainMenuString = useMemo(() => JSON.stringify(mainMenu), [mainMenu]);

  useEffect(() => {
    setSelectedPath(router.pathname);
  }, [router.pathname]);

  useEffect(() => {
    const newOpenStates: { [key: string]: boolean } = {};

    mainMenu.forEach((item) => {
      if (item.nestedItems) {
        const hasSelectedChild = item.nestedItems.some(
          (nestedItem) => nestedItem.path === router.pathname,
        );
        if (hasSelectedChild) {
          newOpenStates[item.id] = true;
        }
      }
    });

    setOpenStates((prev) => {
      const hasChanges = Object.keys(newOpenStates).some(
        (key) => prev[key] !== newOpenStates[key],
      );
      return hasChanges ? { ...prev, ...newOpenStates } : prev;
    });
  }, [router.pathname, mainMenuString]);

  const handleSelect = useCallback(
    (path: string) => {
      setSelectedPath(path);
      startContentTransition();
      router.push(path);
    },
    [router, startContentTransition],
  );

  const handleToggle = useCallback((itemId: string) => {
    setOpenStates((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  const RoleBadge = useCallback(
    () => (
      <Box
        sx={{
          mx: 2,
          my: 1,
          p: 1,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <Typography variant="caption" color="text.secondary" display="block">
          Logged in as
        </Typography>
        <Typography variant="body2" fontWeight={600} color="primary.main">
          {roleName?.toUpperCase()}
        </Typography>
      </Box>
    ),
    [roleName, theme],
  );

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <Box>
        <RoleBadge />
        <List dense>
          {mainMenu.map((item) => (
            <NestedMenuItem
              key={item.id}
              item={item}
              selectedPath={selectedPath}
              onSelect={handleSelect}
              openStates={openStates}
              onToggle={handleToggle}
            />
          ))}
        </List>
      </Box>

      {secondaryMenu.length > 0 && (
        <List dense>
          {secondaryMenu.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                onClick={() => item.path && handleSelect(item.path)}
                selected={item.path === selectedPath}
                sx={{
                  borderLeft: item.path === selectedPath ? 3 : 0,
                  borderColor: "primary.main",
                  backgroundColor:
                    item.path === selectedPath
                      ? alpha(theme.palette.primary.main, 0.08)
                      : "transparent",
                }}
              >
                <ListItemIcon
                  sx={{
                    color:
                      item.path === selectedPath ? "primary.main" : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    color:
                      item.path === selectedPath ? "primary.main" : "inherit",
                    fontWeight: item.path === selectedPath ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Stack>
  );
}
