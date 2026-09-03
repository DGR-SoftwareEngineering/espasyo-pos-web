"use client";
import React from "react";
import { Theme, type ThemeProps, Flex } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { DesignProvider, type RadixAccentColor } from "../../../design-system";
import {
  DialogContextProvider,
  FormSubmissionContextProvider,
  HeaderTitleContextProvider,
  NotificationsContextProvider,
  PageLoaderContextProvider,
  ToastContextProvider,
} from "../../../core/contexts";
import { useThemePreference } from "../../../core/contexts/theme/ThemePreferenceContext";
import { Toastify } from "../../toast/Toastify";
import { ErrorBoundary } from "../../ErrorBoundary";
import { PermissionProvider } from "../../menu/contexts/PermissionContext";

interface AppShellProps {
  isAuthenticated: boolean;
  loading?: boolean;
  accentColor?: RadixAccentColor;
  grayColor?: ThemeProps["grayColor"];
  radius?: ThemeProps["radius"];
  scaling?: ThemeProps["scaling"];
  panelBackground?: ThemeProps["panelBackground"];
  primaryColor?: string | null;
  secondaryColor?: string | null;
  logout: () => Promise<void>;
  role?: string;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  isAuthenticated,
  loading,
  accentColor,
  grayColor = "slate",
  radius = "medium",
  scaling = "100%",
  panelBackground = "solid",
  primaryColor,
  secondaryColor,
  role,
  children,
}) => {
  const { appearance } = useThemePreference();

  return (
    <Theme
      appearance={appearance}
      accentColor={accentColor ?? "indigo"}
      grayColor={grayColor}
      radius={radius}
      scaling={scaling}
      panelBackground={panelBackground}
    >
      <DesignProvider
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        accentColor={accentColor}
        grayColor={grayColor}
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
                        style={{ minHeight: "100vh", background: "var(--gray-2)" }}
                      >
                        <PermissionProvider roleName={role ?? ""}>
                          {children}
                        </PermissionProvider>
                      </Flex>
                    </FormSubmissionContextProvider>
                  </NotificationsContextProvider>
                </ErrorBoundary>
              </PageLoaderContextProvider>
            </HeaderTitleContextProvider>
          </DialogContextProvider>
        </ToastContextProvider>
      </DesignProvider>
    </Theme>
  );
};
