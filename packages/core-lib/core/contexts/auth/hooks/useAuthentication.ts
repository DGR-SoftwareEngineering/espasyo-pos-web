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
import { parseTokenId, safeDecode } from "../access-token";
import { config } from "../../../../config";

// Claim-type URLs are not constants in the codebase — they're constructed from
// env vars (same pattern as src/proxy.ts) so the schema host stays out of git.
const ROLE_CLAIM =
  (process.env.NEXT_PUBLIC_CLAIMS_IDENTITY_URL ?? "") +
  "/ws/2008/06/identity/claims/role";
const NAME_CLAIM =
  (process.env.NEXT_PUBLIC_CLAIMS_NAME_IDENTIFIER ?? "") +
  "/ws/2005/05/identity/claims/name";

interface JwtIdentity {
  name: string | null;
  role: string | null;
}

const readJwtIdentity = (token: string | null): JwtIdentity => {
  if (!token) return { name: null, role: null };
  const claims = safeDecode<Record<string, string>>(token);
  if (!claims) return { name: null, role: null };
  const name = typeof claims[NAME_CLAIM] === "string" ? claims[NAME_CLAIM] : null;
  const role = typeof claims[ROLE_CLAIM] === "string" ? claims[ROLE_CLAIM] : null;
  return { name, role };
};

const deriveInitialsFromName = (name: string | null): string => {
  if (!name) return "";
  const cleaned = name.trim();
  if (!cleaned) return "";
  // Try "First Last" split first; fall back to first char(s) of the username.
  const parts = cleaned.split(/[\s._-]+/).filter(Boolean);
  const first = parts[0];
  const second = parts[1];
  if (first && second) {
    return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
};

export const useAuthentication = (): AuthService => {
  const router = useRouter();
  const [clearCookies] = useClearCookies();
  const [ssoCookie, setSsoCookie, clearSsoCookie] = useSSOCookie();
  const [accessToken, setAccessToken, clearAccessToken] = useAccessToken();
  const [refreshToken, setRefreshToken, clearRefreshToken] = useRefreshToken();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInitials, setUserInitials] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [userInfoLoading, setUserInfoLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);

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
  const validateTokenCb = useApi(
    async (api) =>
      accessToken ? await api.authentication.validateToken() : null,
    [accessToken],
  );
  const userInfoCallback = useApiCallback(async (api) =>
    api.commons.getUserById(),
  );
  const roleCallback = useApiCallback(async (api, roleID: string) =>
    api.commons.getRoleById(roleID),
  );

  const authSessionIdleTimer = useSessionIdleTimer({
    onSessionExpired: async () => {
      await logout();
      await goToExpiredSessionPage();
    },
    sessionId: accessToken
      ? (parseTokenId(accessToken) ?? undefined)
      : undefined,
  });

  const loading =
    loginCb.loading ||
    logoutCb.loading ||
    createSessionCb.loading ||
    userInfoLoading ||
    roleLoading ||
    validateTokenCb.loading;

  useEffect(() => {
    if (validateTokenCb.result?.data.success !== undefined) {
      setIsAuthenticated(
        !!(accessToken && validateTokenCb.result.data.success),
      );
    }
  }, [accessToken, validateTokenCb.result]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;
    let cancelled = false;

    // 1) Immediate, dependency-free defaults from the JWT itself. This means the
    //    Header avatar and the role-based menu light up the instant we have a
    //    token, even if the user-info API call below is slow or denied.
    const identity = readJwtIdentity(accessToken);
    if (identity.role) setRole(identity.role);
    if (identity.name) {
      const initials = deriveInitialsFromName(identity.name);
      if (initials) setUserInitials(initials);
    }

    // 2) Enhancement pass: try to fetch richer user info (firstName/lastName/email).
    //    The user endpoint may be admin-gated — if so, we keep the JWT-derived
    //    defaults and don't surface a console error stack.
    const fetchUserAndRole = async () => {
      setUserInfoLoading(true);
      try {
        const userResult = await userInfoCallback.execute();
        if (cancelled) return;
        const userInfoData = userResult?.data?.response;
        if (userInfoData?.userInfo) {
          const { firstName = "", lastName = "", email: userEmail = "" } =
            userInfoData.userInfo;
          const initials = `${firstName.charAt(0)}${lastName.charAt(
            0,
          )}`.toUpperCase();
          if (initials.trim()) setUserInitials(initials);
          if (userEmail) setEmail(userEmail);
        }
        const fetchedRoleID = userInfoData?.roleID;
        if (!fetchedRoleID) return;
        setRoleLoading(true);
        try {
          const roleResult = await roleCallback.execute(fetchedRoleID);
          if (cancelled) return;
          const roleName = roleResult?.data?.response?.roleName;
          if (roleName) setRole(roleName);
        } catch {
          // Role lookup may also be admin-gated for cashier — JWT role stands.
        } finally {
          if (!cancelled) setRoleLoading(false);
        }
      } catch (error) {
        // Treat 403 / 401 as "use JWT defaults" rather than a hard failure.
        const status =
          (error as { status?: number; response?: { status?: number } })
            ?.status ??
          (error as { response?: { status?: number } })?.response?.status;
        if (status !== 403 && status !== 401) {
          console.error(
            "Failed to enhance user identity after authentication",
            error,
          );
        }
      } finally {
        if (!cancelled) setUserInfoLoading(false);
      }
    };

    fetchUserAndRole();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, accessToken]);

  useEffect(() => {
    if (isAuthenticated) {
      return authSessionIdleTimer.start();
    } else {
      return authSessionIdleTimer.stop();
    }
  }, [isAuthenticated, accessToken]);

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      setIsAuthenticated(false);
      clearCookies!();
    }
  }, [accessToken, refreshToken])

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
      setRole("");
      setEmail("");
      setUserInitials("");
      authSessionIdleTimer.stop();
    }
  }, [accessToken, refreshToken, createSessionCb, logoutCb]);

  const softLogout = useCallback(async () => {
    clearSession();
  }, [refreshToken, accessToken]);

  async function goToExpiredSessionPage() {
    await router.replace((routes) => routes.home, { shallow: false });
  }

  const completeAuthentication = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

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
          password: password
        });
        setAccessToken(result.data.response.accessToken);
        setRefreshToken(result.data.response.refreshToken);
        setSsoCookie(parseTokenId(result.data.response.accessToken), {
          path: "/",
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
          domain: `.${window.location.hostname}`,
        });
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
    completeAuthentication,
    isAuthenticating: false,
    role,
    initials: userInitials,
    email,
  };
};
