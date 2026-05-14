"use client";
import React, { ReactNode } from "react";
import { Theme, ThemeProps, Flex } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import {
  DialogContextProvider,
  FormSubmissionContextProvider,
  HeaderTitleContextProvider,
  NotificationsContextProvider,
  PageLoaderContextProvider,
  ToastContextProvider,
} from "../../core/contexts";
import { Toastify } from "../toast/Toastify";
import { ErrorBoundary } from "../ErrorBoundary";
import { PermissionProvider } from "../menu/contexts/PermissionContext";
import { RadixDashboard } from "../radix/Dashboard";

export interface RadixThemeFrameworkProps {
  isAuthenticated: boolean;
  loading?: boolean;
  appearance?: ThemeProps["appearance"];
  accentColor?: ThemeProps["accentColor"];
  grayColor?: ThemeProps["grayColor"];
  radius?: ThemeProps["radius"];
  scaling?: ThemeProps["scaling"];
  panelBackground?: ThemeProps["panelBackground"];
  logout: () => Promise<void>;
  role?: string;
  initials?: string;
  email?: string;
  children: ReactNode;
}

export const RadixThemeFramework: React.FC<RadixThemeFrameworkProps> = ({
  isAuthenticated,
  loading,
  appearance = "light",
  accentColor = "indigo",
  grayColor = "slate",
  radius = "medium",
  scaling = "100%",
  panelBackground = "solid",
  logout,
  role,
  initials,
  email,
  children,
}) => {
  return (
    <Theme
      appearance={appearance}
      accentColor={accentColor}
      grayColor={grayColor}
      radius={radius}
      scaling={scaling}
      panelBackground={panelBackground}
    >
      <ToastContextProvider>
        <DialogContextProvider>
          <HeaderTitleContextProvider>
            <Toastify autoClose={5000} hideProgressBar={false} />
            <PageLoaderContextProvider isAuthenticated={isAuthenticated}>
              <ErrorBoundary errorMessage="Application Error">
                <NotificationsContextProvider>
                  <FormSubmissionContextProvider>
                    <Flex
                      direction="column"
                      style={{
                        minHeight: "100vh",
                        background: "var(--gray-2)",
                      }}
                    >
                      {isAuthenticated ? (
                        <PermissionProvider roleName={role ?? ""}>
                          <RadixDashboard
                            logout={logout}
                            loading={loading}
                            role={role}
                            initials={initials}
                            email={email}
                          >
                            {children}
                          </RadixDashboard>
                        </PermissionProvider>
                      ) : (
                        <>{children}</>
                      )}
                    </Flex>
                  </FormSubmissionContextProvider>
                </NotificationsContextProvider>
              </ErrorBoundary>
            </PageLoaderContextProvider>
          </HeaderTitleContextProvider>
        </DialogContextProvider>
      </ToastContextProvider>
    </Theme>
  );
};
