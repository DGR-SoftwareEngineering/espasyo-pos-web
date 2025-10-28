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
import { useRefreshTokenHandler, useLogout } from "../core/hooks";

interface Props {} //pass props from top-level to lower-level components.

/**
 * Remove `React.PropsWithChildren` if the application needs to be purely dynamic
 * Create PageContainer & PageContent for dynamic switching of components blocks.
 */

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
  children,
}) => {
  const { logout } = useLogout();
  const { isAuthenticated, loading } = useAuthContext();

  useRefreshTokenHandler(logout);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider>
        <DialogContextProvider>
          <HeaderTitleContextProvider>
            <ToastContextProvider>
              <Toastify autoClose={5000} hideProgressBar={false} />
              <PageLoaderContextProvider
                isAuthenticated={isAuthenticated}
                loading={loading}
              >
                <ErrorBoundary errorMessage="Application Error">
                  <NotificationsContextProvider>
                    <FormSubmissionContextProvider>
                      <Box
                        minHeight="100vh"
                        display="flex"
                        flexDirection="column"
                      >
                        {/* set loading to false by default for now. */}
                        <TabContextProvider>
                          <LoadablePageContent loading={false}>
                            {isAuthenticated ? (
                              <DashboardLayout
                                logout={logout}
                                loading={loading}
                              >
                                <Suspense fallback={renderFallback()}>
                                  {children}
                                </Suspense>
                              </DashboardLayout>
                            ) : (
                              <Suspense fallback={renderFallback()}>
                                {children}
                              </Suspense>
                            )}
                          </LoadablePageContent>
                        </TabContextProvider>
                      </Box>
                    </FormSubmissionContextProvider>
                  </NotificationsContextProvider>
                </ErrorBoundary>
              </PageLoaderContextProvider>
            </ToastContextProvider>
          </HeaderTitleContextProvider>
        </DialogContextProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
};
