import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MenuContent from "./MenuContent";
import CardAlert from "./CardAlert";
import OptionsMenu from "./OptionsMenu";
import { useApi } from "../core/hooks";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { PermissionProvider } from "./menu/contexts/PermissionContext";

interface Props {
  logout: () => Promise<void>;
  loading?: boolean;
}

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

export default function SideMenu({ logout, loading }: Props) {
  const [userInitials, setUserInitials] = useState("");
  const [role, setRole] = useState("");

  // Get user info
  const {
    result: userInfoResult,
    loading: userInfoLoading,
    error: userInfoError,
  } = useApi(async (api) => await api.commons.getUserById());

  const userData = userInfoResult?.data?.response?.userInfo;
  const roleID = userInfoResult?.data?.response?.roleID;

  // Get role info based on roleID
  const {
    result: roleResult,
    loading: roleLoading,
    error: roleError,
  } = useApi(
    async (api) => (roleID ? await api.commons.getRoleById(roleID) : null),
    [roleID],
  );

  // Set user initials
  useEffect(() => {
    if (userInfoResult?.data?.response?.userInfo) {
      const userData = userInfoResult.data.response.userInfo;
      const firstName = userData.firstName || "";
      const lastName = userData.lastName || "";
      const initials = `${firstName.charAt(0)}${lastName.charAt(
        0,
      )}`.toUpperCase();
      setUserInitials(initials);
    }
  }, [userInfoResult]);

  // Set role name
  useEffect(() => {
    if (roleResult?.data?.response?.roleName) {
      setRole(roleResult.data.response.roleName);
    }
  }, [roleResult]);

  // Show loading state
  if (userInfoLoading || (roleID && roleLoading)) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          [`& .${drawerClasses.paper}`]: {
            backgroundColor: "background.paper",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <CircularProgress />
        </Box>
      </Drawer>
    );
  }

  if (userInfoError) {
    console.error("Failed to load user info:", userInfoError);
  }
  if (roleError) {
    console.error("Failed to load role:", roleError);
  }

  const firstName = userData?.firstName || "";
  const lastName = userData?.lastName || "";
  const middleName = userData?.middleName || "";
  const email = userData?.email || "user@example.com";
  const displayName = `${firstName} ${middleName} ${lastName}`.trim() || "User";

  return (
    <PermissionProvider
      roleName={roleResult?.data?.response?.roleName || role}
      roleData={roleResult?.data?.response}
    >
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          [`& .${drawerClasses.paper}`]: {
            backgroundColor: "background.paper",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            mt: "calc(var(--template-frame-height, 0px) + 4px)",
            p: 1.5,
          }}
        >
          <Box
            sx={{
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              px: 2,
              py: 0.5,
              borderRadius: 1,
              fontSize: "0.875rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Espasyo Coffee House
          </Box>
        </Box>
        <Divider />
        <Box
          sx={{
            overflow: "auto",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <MenuContent />
          <CardAlert />
        </Box>
        <Stack
          direction="row"
          sx={{
            p: 2,
            gap: 1,
            alignItems: "center",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Avatar
            sizes="small"
            alt={displayName}
            src="/static/images/avatar/7.jpg"
            sx={{ width: 36, height: 36, bgcolor: "primary.main" }}
          >
            {userInitials || displayName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ mr: "auto", overflow: "hidden" }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                lineHeight: "16px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "150px",
              }}
            >
              {displayName}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "150px",
                display: "block",
              }}
            >
              {email}
            </Typography>
          </Box>
          <OptionsMenu logout={logout} loading={loading} />
        </Stack>
      </Drawer>
    </PermissionProvider>
  );
}
