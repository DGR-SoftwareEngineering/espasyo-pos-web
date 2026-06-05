import { AxiosError } from "axios";
import { useEffect, useRef } from "react";
import { RefreshParams } from "../../api/authentication/types";
import Http from "../http-client";
import { httpClient, useApiCallback } from "./useApi";
import { useAccessToken, useRefreshToken } from "../contexts/auth/hooks";
import { LogoutOptions } from "../contexts/auth/types";

export type LogoutFunction = AsyncFunction<[options?: LogoutOptions], void>;

export const useRefreshTokenHandler = (logout: LogoutFunction) => {
  const [accessToken, setAccessToken] = useAccessToken();
  const [refreshToken, setRefreshToken] = useRefreshToken();
  const retryInProgressRequest = useRef<Promise<void> | null>(null);
  const refreshTokenCb = useApiCallback((api, p: RefreshParams) =>
    api.authentication.refreshToken(p)
  );

  useEffect(
    () => httpClient.setupMiddlewareOptions({ onErrorHandler: handleRetry }),
    []
  );

  const handleRetry = async (err: AxiosError, http: Http) => {
    if (err.response?.status !== 401) {
      return Promise.reject(err);
    }

    if (isTokenInvalidError(err)) {
      return accessToken && refreshToken && logout();
    }

    if (!isTokenExpiredError(err)) {
      return Promise.reject(err);
    }

    if (!retryInProgressRequest.current) {
      retryInProgressRequest.current = refresh(err).then(() => {
        retryInProgressRequest.current = null;
      });
    }

    try {
      await retryInProgressRequest.current;
      http.options?.onRequest?.(err?.config!);

      return http.client(err?.config!);
    } catch {
      retryInProgressRequest.current = null;
    }

    return Promise.reject(err);
  };

  const refresh = async (error: AxiosError): Promise<void> => {
    if (accessToken && refreshToken) {
      try {
        const result = await refreshTokenCb.execute({ refreshToken });
        setAccessToken(result.data.response.accessToken);
        setRefreshToken(result.data.response.refreshToken);
        updateErrorHeaders(error, result.data.response.accessToken);

        return Promise.resolve();
      } catch {
        await logout();
      }
    }

    return Promise.reject(error);
  };
};

const isTokenExpiredError = (e: any) => {
  return e.response?.data?.errors?.some(
    (e: string) => e === "ERROR_ACCESS_TOKEN_EXPIRED"
  );
};

const isTokenInvalidError = (e: any) => {
  return e.response?.data?.errors?.some(
    (e: string) => e === "ERROR_INVALID_ACCESS_TOKEN"
  );
};

const updateErrorHeaders = (error: AxiosError, accessToken: string) => {
  if (error?.config?.headers)
    error.config.headers.Authorization = `Bearer ${accessToken}`;
};
