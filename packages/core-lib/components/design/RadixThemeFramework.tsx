"use client";
import React, { ReactNode } from "react";
import { Theme, ThemeProps, Flex } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { DesignProvider } from "../../design-system";
import {
  DialogContextProvider,
  FormSubmissionContextProvider,
  HeaderTitleContextProvider,
  NotificationsContextProvider,
  PageLoaderContextProvider,
  ToastContextProvider,
  usePublicSettings,
} from "../../core/contexts";
import { Toastify } from "../toast/Toastify";
import { ErrorBoundary } from "../ErrorBoundary";
import { PermissionProvider } from "../menu/contexts/PermissionContext";
import { RadixDashboard } from "../radix/Dashboard";
import { CustomerShell } from "../radix/customer";

/**
 * Which product the framework renders for. Drives the authenticated shell:
 * "POS" → admin/cashier sidebar dashboard; "CustomerEngagement" → customer top-nav.
 * Defaults to POS when unset so the existing POS app is unaffected.
 */
export type Platform = "POS" | "CustomerEngagement";

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
  platform?: Platform;
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
  platform,
  children,
}) => {
  const { theme } = usePublicSettings();

  return (
    <Theme
      appearance={appearance}
      accentColor={accentColor}
      grayColor={grayColor}
      radius={radius}
      scaling={scaling}
      panelBackground={panelBackground}
    >
      <DesignProvider
        primaryColor={theme.primaryColor}
        secondaryColor={theme.secondaryColor}
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
                      style={{
                        minHeight: "100vh",
                        background: "var(--gray-2)",
                      }}
                    >
                      <PermissionProvider roleName={role ?? ""}>
                        {isAuthenticated ? (
                          platform === "CustomerEngagement" ? (
                            <CustomerShell
                              logout={logout}
                              loading={loading}
                              initials={initials}
                              email={email}
                            >
                              {children}
                            </CustomerShell>
                          ) : (
                            <RadixDashboard
                              logout={logout}
                              loading={loading}
                              role={role}
                              initials={initials}
                              email={email}
                            >
                              {children}
                            </RadixDashboard>
                          )
                        ) : (
                          <>{children}</>
                        )}
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
