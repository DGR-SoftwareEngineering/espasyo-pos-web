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
import { CircularProgress } from "@mui/material";

interface Props {
  logout: () => Promise<void>;
  loading?: boolean;
  role: string;
  initials: string;
  email: string;
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

export default function SideMenu({
  logout,
  loading,
  role,
  initials,
  email,
}: Props) {
  if (loading) {
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
        <MenuContent roleName={role} loading={loading} />
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
          alt={initials}
          src="/static/images/avatar/7.jpg"
          sx={{ width: 36, height: 36, bgcolor: "primary.main" }}
        >
          {initials}
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
            {initials}
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
  );
}
