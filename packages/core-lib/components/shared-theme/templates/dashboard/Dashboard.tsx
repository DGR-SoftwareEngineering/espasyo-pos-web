import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import SideMenu from "../../../SideMenu";
import AppTheme from "../../AppTheme";
import AppNavbar from "../components/AppNavbar";
import Header from "../components/Header";
import { ContentArea } from "../../../ContentArea";

interface Props {
  logout: () => Promise<void>;
  loading?: boolean;
  disableCustomTheme?: boolean;
  role: string;
  initials: string;
  email: string;
}

export const MuiDashboard: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  logout,
  disableCustomTheme,
  loading,
  ...others
}) => {
  return (
    <AppTheme {...others}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu logout={logout} {...others} />
        <AppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: "auto",
          })}
        >
          <Stack
            //enable full width here to allow content to use the full width of the page. The ContentArea component will handle the maxWidth and centering.
            spacing={2}
            sx={{
              width: "100%",
              px: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
            <ContentArea>{children}</ContentArea>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
};
