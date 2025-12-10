import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Box } from "@mui/material";
import { ErrorBoundary } from "./ErrorBoundary";
import { LoadablePageContent } from "./page/LoadablePageContent";
import {
  NotificationsContextProvider,
  PageLoaderContextProvider,
  ToastContextProvider,
  useAuthContext,
  FormSubmissionContextProvider,
  HeaderTitleContextProvider,
  TabContextProvider,
  DialogContextProvider,
} from "../core/contexts";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { varAlpha } from "minimal-shared/utils";
import { DashboardLayout } from "./dashboard";
import { Suspense } from "react";
import { ThemeProvider } from "../core/theme/custom";
import { Toastify } from "./toast/Toastify";
import {
  useRefreshTokenHandler,
  useLogout,
  usePreventDuplicateSession,
} from "../core/hooks";
import { DuplicationSessionBlock } from "./blocks";
import { MuiThemeFramework } from "./design/MuiThemeFramework";
import { RadixThemeFramework } from "./design/RadixThemeFramework";

export type Framework = "Radix" | "MUI";

interface Props {
  framework: Framework;
}

const renderFallback = () => (
  <Box
    sx={{
      display: "flex",
      flex: "1 1 auto",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) =>
          varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: "text.primary" },
      }}
    />
  </Box>
);

export const Layout: React.FC<React.PropsWithChildren<Props>> = ({
  framework,
  children,
}) => {
  const { logout } = useLogout();
  const { isAuthenticated, loading } = useAuthContext();
  const { hasDuplicateSession } = usePreventDuplicateSession();
  useRefreshTokenHandler(logout);

  if (hasDuplicateSession) {
    return <DuplicationSessionBlock />;
  }

  const renderWithFramework = () => {
    switch (framework) {
      case "MUI":
        return (
          <Suspense fallback={renderFallback()}>
            <MuiThemeFramework
              isAuthenticated={isAuthenticated}
              loading={loading}
              logout={logout}
              children={children}
            />
          </Suspense>
        );
      case "Radix":
        return (
          <Suspense fallback={renderFallback()}>
            <RadixThemeFramework
              isAuthenticated={isAuthenticated}
              loading={loading}
              appearance="light"
              logout={logout}
              children={children}
            />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {renderWithFramework()}
    </LocalizationProvider>
  );
};
