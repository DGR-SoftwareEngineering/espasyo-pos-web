import React, { createContext, useContext, useMemo } from "react";
import { useAuthentication } from "./hooks/useAuthentication";
import { AUTH_METHODS, AuthMethod, AuthService } from "./types";

const context = createContext<AuthService | undefined>(undefined);

const mapAuthService = (authService: AuthService) => ({
  loading: authService.loading,
  isAuthenticating: authService.isAuthenticating,
  isAuthenticated: authService.isAuthenticated,
  login: authService.login,
  logout: authService.logout,
  softLogout: authService.softLogout,
  setIsAuthenticated: authService.setIsAuthenticated,
});

const AuthenticationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const authService = useAuthentication();
  const value = useMemo(() => mapAuthService(authService), [authService]);
  return <context.Provider value={value}>{children}</context.Provider>;
};

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  authMethod?: AuthMethod;
}> = ({ children, authMethod = AUTH_METHODS.STANDARD_AUTH }) => {
  if (authMethod === AUTH_METHODS.AUTH0) {
    // Return Auth0 provider or reuse the existing
    return <></>;
  }

  return <AuthenticationProvider>{children}</AuthenticationProvider>;
};

export const useAuthContext = () => {
  const authContext = useContext(context);
  if (!authContext) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return authContext;
};

export const useSafeAuthContext = () => {
  const authContext = useContext(context);
  if (!authContext) {
    return {
      loading: false,
      isAuthenticating: false,
      isAuthenticated: false,
      login: async () => {},
      logout: async () => {},
      softLogout: async () => {},
      setIsAuthenticated: () => {},
    };
  }
  return authContext;
};
