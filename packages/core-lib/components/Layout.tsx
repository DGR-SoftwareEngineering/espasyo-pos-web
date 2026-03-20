import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Box } from "@mui/material";
import { useAuthContext } from "../core/contexts";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { varAlpha } from "minimal-shared/utils";
import { Suspense } from "react";
import {
  useRefreshTokenHandler,
  useLogout,
  usePreventDuplicateSession,
} from "../core/hooks";
import { DuplicationSessionBlock } from "./blocks";
import { MuiThemeFramework } from "./design/MuiThemeFramework";
import { RadixThemeFramework } from "./design/RadixThemeFramework";
import { ErrorBoundary } from "./ErrorBoundary";

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
  const { isAuthenticated, loading, email, role, initials } = useAuthContext();
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
            <ErrorBoundary errorMessage="MUI Framework Error">
              <MuiThemeFramework
                isAuthenticated={isAuthenticated}
                loading={loading}
                logout={logout}
                children={children}
                email={email}
                role={role}
                initials={initials}
              />
            </ErrorBoundary>
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
      <ErrorBoundary errorMessage="Layout Error">
        {renderWithFramework()}
      </ErrorBoundary>
    </LocalizationProvider>
  );
};
