import { useCallback, useEffect, useState } from "react";
import {
  LoginParams,
  LogoutParams,
  SsoSessionParams,
} from "../../../../api/authentication/types";
import { isTrue } from "../../../../business/boolean";
import { config } from "../../../../config";
import { clearSession, useApiCallback } from "../../../hooks";
import { useRouter } from "../../../router";
import { AuthService, LoginOptions } from "../types";
import { useClearCookies } from "../../../hooks";
import { useSSOCookie } from "../../../hooks/useCookie";
import { useAccessToken, useRefreshToken } from "../hooks";
import { useSessionIdleTimer } from "./useSessionIdleTimer";
import { parseTokenId } from "../access-token";

export const useAuthentication = (): AuthService => {
  const router = useRouter();
  const [clearCookies] = useClearCookies();
  const [ssoCookie, setSsoCookie, clearSsoCookie] = useSSOCookie();
  const [accessToken, setAccessToken, clearAccessToken] = useAccessToken();
  const [refreshToken, setRefreshToken, clearRefreshToken] = useRefreshToken();
  const [isAuthenticated, setIsAuthenticated] = useState(!!accessToken);

  const loginCb = useApiCallback((api, p: LoginParams) =>
    api.authentication.login(p)
  );
  const logoutCb = useApiCallback((api, p: LogoutParams) =>
    api.authentication.logout(p)
  );
  const createSessionCb = useApiCallback((api, p: SsoSessionParams) =>
    api.authentication.createSession(p)
  );

  const authSessionIdleTimer = useSessionIdleTimer({
    onSessionExpired: async () => {
      await logout();
      await goToExpiredSessionPage();
    },
    sessionId: accessToken ? parseTokenId(accessToken) : accessToken,
  });

  const loading = loginCb.loading || logoutCb.loading;

  useEffect(() => {
    setIsAuthenticated(!!accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (!isAuthenticated) return;
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("authSessionIdleTimer.start() called");
      authSessionIdleTimer.start();
    }
    return authSessionIdleTimer.stop;
  }, [isAuthenticated]);

  const logout = useCallback(async () => {
    try {
      let currentAccessToken = accessToken;
      let currentRefreshToken = refreshToken;

      if (!currentAccessToken || !currentRefreshToken) {
        if (!ssoCookie) {
          throw new Error(
            "SSO Cookie is not set. Cannot create session for logout"
          );
        }

        const { data } = await createSessionCb.execute({
          tokenId: ssoCookie,
        });

        currentAccessToken = data.accessToken;
        currentRefreshToken = data.refreshToken;
      }

      if (currentAccessToken && currentRefreshToken) {
        await logoutCb.execute({
          refreshToken: currentRefreshToken,
          accessToken: currentAccessToken,
        });
      }
    } catch (error) {
      console.error("Failed executing the logout service", error as object);
    } finally {
      clearSsoCookie();
      clearCookies!();
      clearSession();
      setIsAuthenticated(false);
      authSessionIdleTimer.stop();
    }
  }, [refreshToken, accessToken, createSessionCb, logoutCb]);

  const softLogout = useCallback(async () => {
    clearSession();
  }, [refreshToken, accessToken]);

  async function goToExpiredSessionPage() {
    await router.replace((routes) => routes.home, { shallow: false });
  }

  return {
    loading,
    isAuthenticated,
    login: async (options?: LoginOptions) => {
      const { userName, password } = options || {};

      if (!userName || !password) {
        throw new Error("Username and password are required");
      }

      try {
        const result = await loginCb.execute({
          userName: userName,
          password: password,
        });
        setAccessToken(result.data.response.accessToken);
        setRefreshToken(result.data.response.refreshToken);
        setSsoCookie(parseTokenId(result.data.response.accessToken), {
          path: "/",
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
          domain: `.${window.location.hostname}`,
        });
        setIsAuthenticated(true);
      } catch (err) {
        clearAccessToken();
        clearRefreshToken();
        clearSsoCookie();
        setIsAuthenticated(false);
        throw err;
      }
    },
    logout,
    softLogout,
    setIsAuthenticated,
    isAuthenticating: false,
  };
};
