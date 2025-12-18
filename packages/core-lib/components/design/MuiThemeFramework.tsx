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
import { LoadablePageContent } from "../page/LoadablePageContent";
import { DashboardLayout } from "../dashboard";

interface Props {
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  children: ReactNode;
}

export const MuiThemeFramework: React.FC<Props> = ({
  isAuthenticated,
  loading,
  logout,
  children,
}) => {
  return (
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
                            <DashboardLayout logout={logout} loading={loading}>
                              {children}
                            </DashboardLayout>
                          ) : (
                            <>{children}</>
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
  );
};
