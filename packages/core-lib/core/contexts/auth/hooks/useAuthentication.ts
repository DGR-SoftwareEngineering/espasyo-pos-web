import { useCallback, useEffect, useState } from "react";
import {
  LoginParams,
  LogoutParams,
  SsoSessionParams,
} from "../../../../api/authentication/types";
import { clearSession, useApi, useApiCallback } from "../../../hooks";
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
  const [userInitials, setUserInitials] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [roleID, setRoleID] = useState<string | null>(null);

  const loginCb = useApiCallback((api, p: LoginParams) =>
    api.authentication.login(p),
  );
  const logoutCb = useApiCallback((api, p: LogoutParams) =>
    api.authentication.logout(p),
  );
  const logoutWithClearCookiesCb = useApiCallback((api) =>
    api.authentication.logoutWithClearCookies(),
  );
  const createSessionCb = useApiCallback((api, p: SsoSessionParams) =>
    api.authentication.createSession(p),
  );
  const userInfoCb = useApi(
    async (api) => (isAuthenticated ? await api.commons.getUserById() : null),
    [isAuthenticated],
  );

  const roleCb = useApi(
    async (api) => (roleID ? await api.commons.getRoleById(roleID) : null),
    [roleID],
  );

  const authSessionIdleTimer = useSessionIdleTimer({
    onSessionExpired: async () => {
      await logout();
      await goToExpiredSessionPage();
    },
    sessionId: accessToken ? parseTokenId(accessToken) : accessToken,
  });

  const loading =
    loginCb.loading ||
    logoutCb.loading ||
    createSessionCb.loading ||
    userInfoCb.loading ||
    roleCb.loading;

  useEffect(() => {
    setIsAuthenticated(!!accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (!isAuthenticated) return;
  }, [isAuthenticated]);

  useEffect(() => {
    if (userInfoCb.result?.data?.response?.roleID) {
      setRoleID(userInfoCb.result.data.response.roleID);
    }
  }, [userInfoCb.result]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("authSessionIdleTimer.start() called");
      return authSessionIdleTimer.start();
    } else {
      return authSessionIdleTimer.stop();
    }
  }, [isAuthenticated, accessToken]);

  useEffect(() => {
    if (roleCb.result?.data?.response?.roleName) {
      setRole(roleCb.result.data.response.roleName);
    }
  }, [roleCb.result]);

  useEffect(() => {
    if (userInfoCb.result?.data?.response?.userInfo) {
      const userData = userInfoCb.result.data.response.userInfo;
      const firstName = userData.firstName || "";
      const lastName = userData.lastName || "";
      const initials = `${firstName.charAt(0)}${lastName.charAt(
        0,
      )}`.toUpperCase();
      setEmail(userData.email || "");
      setUserInitials(initials);
    }
  }, [userInfoCb.result]);

  const logout = useCallback(async () => {
    try {
      let currentAccessToken = accessToken;
      let currentRefreshToken = refreshToken;

      if (!currentAccessToken || !currentRefreshToken) {
        if (!ssoCookie) {
          throw new Error(
            "SSO Cookie is not set. Cannot create session for logout",
          );
        }

        const { data } = await createSessionCb.execute({
          id: ssoCookie,
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
      logoutWithClearCookiesCb.execute();
      clearSsoCookie();
      clearCookies!();
      clearSession();
      setIsAuthenticated(false);
      setRoleID("");
      authSessionIdleTimer.stop();
      console.log("authSessionIdleTimer.stop() called!");
    }
  }, [accessToken, refreshToken, createSessionCb, logoutCb]);

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
    role,
    initials: userInitials,
    email,
  };
};
