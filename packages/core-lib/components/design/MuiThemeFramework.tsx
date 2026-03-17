"use client";
import React, { ReactNode } from "react";
import { ThemeProvider } from "../../core/theme/custom";
import {
  DialogContextProvider,
  FormSubmissionContextProvider,
  HeaderTitleContextProvider,
  NotificationsContextProvider,
  PageLoaderContextProvider,
  TabContextProvider,
  ToastContextProvider,
} from "../../core/contexts";
import { Toastify } from "../toast/Toastify";
import { ErrorBoundary } from "../ErrorBoundary";
import { Box } from "@mui/material";
import { MuiDashboard } from "../shared-theme/templates/dashboard/Dashboard";
import { PermissionProvider } from "../menu/contexts/PermissionContext";
interface Props {
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  children: ReactNode;
  loading?: boolean;
  role: string;
  initials: string;
  email: string;
}

export const MuiThemeFramework: React.FC<Props> = ({
  isAuthenticated,
  logout,
  loading,
  children,
  role,
  ...rest
}) => {
  return (
    <ThemeProvider>
      <ToastContextProvider>
        <DialogContextProvider>
          <HeaderTitleContextProvider>
            <Toastify autoClose={5000} hideProgressBar={false} />
            <PageLoaderContextProvider isAuthenticated={isAuthenticated}>
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
                        {isAuthenticated ? (
                          <PermissionProvider roleName={role}>
                            <MuiDashboard
                              logout={logout}
                              loading={loading}
                              role={role}
                              {...rest}
                            >
                              {children}
                            </MuiDashboard>
                          </PermissionProvider>
                        ) : (
                          <>{children}</>
                        )}
                      </TabContextProvider>
                    </Box>
                  </FormSubmissionContextProvider>
                </NotificationsContextProvider>
              </ErrorBoundary>
            </PageLoaderContextProvider>
          </HeaderTitleContextProvider>
        </DialogContextProvider>
      </ToastContextProvider>
    </ThemeProvider>
  );
};
