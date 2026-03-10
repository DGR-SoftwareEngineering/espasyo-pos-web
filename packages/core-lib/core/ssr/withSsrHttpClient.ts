import axios, { AxiosError, AxiosInstance, CancelTokenSource } from "axios";
import { IronSession, IronSessionOptions } from "iron-session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { stringify } from "qs";
import { RefreshTokenResponse } from "../../api/authentication/types";
import { config } from "../../config";
import { httpSsrRefreshedClient } from "../hooks";
import Http from "../http-client";
import https from "https";

const source: CancelTokenSource = axios.CancelToken.source();
type Tokens = { accessToken?: string; refreshToken?: string };
interface NextApiRequestWithSession extends NextApiRequest {
  session: IronSession & Tokens;
}

type NextIronApiHandler<T = any> = (
  req: NextApiRequestWithSession,
  res: NextApiResponse<T>
) => unknown | Promise<unknown>;

type SsrHttpClient = AxiosInstance;
type SsrApiHandler = (client: SsrHttpClient) => NextIronApiHandler;

const client = (
  session: NextApiRequestWithSession["session"],
  req: NextApiRequest
): Http["client"] => {
  const isDev = process.env.NODE_ENV !== "production";

  return new Http(
    {
      baseURL: config.value.APIURL,
      headers: { ENV: config.value.NODE_ENV },
      paramsSerializer: (params) =>
        stringify(params, { encode: true, arrayFormat: "repeat" }),
      onError: (error) =>
        console.error(`Error on response: ${JSON.stringify(error)}`),
      onRequest: (req) => {
        if (req.headers && session.accessToken)
          req.headers.Authorization = `Bearer ${session.accessToken}`;
        return req;
      },
      cancelToken: source.token,
      // Add these options for self-signed certificates in development
      ...(isDev && {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      }),
    },
    { onErrorHandler: handleRetry(session, req) }
  ).client;
};

export const sessionOptions: IronSessionOptions = {
  cookieName: "session",
  password: "complex_password_at_least_32_characters_long",
  cookieOptions: { secure: process.env.NODE_ENV === "production" },
};

export const withSsrHttpClient = (handler: SsrApiHandler) =>
  withIronSessionApiRoute(
    async (req: NextApiRequestWithSession, res) =>
      handler(client(req.session, req))(req, res),
    sessionOptions
  );

let _retryInProgressRequest: Promise<void> | null = null;

const handleRetry =
  (session: NextApiRequestWithSession["session"], req: NextApiRequest) =>
  async (error: AxiosError, client: Http) => {
    if (!error.response) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (!_retryInProgressRequest) {
      _retryInProgressRequest = refresh(session, req, error).then(() => {
        _retryInProgressRequest = null;
      });
    }

    try {
      await _retryInProgressRequest;
      client.options?.onRequest?.(error?.config!);

      return client.client(error?.config!);
    } catch {
      _retryInProgressRequest = null;
    }

    return Promise.reject(error);
  };

const refresh = async (
  session: NextApiRequestWithSession["session"],
  req: NextApiRequest,
  error: AxiosError
): Promise<RefreshTokenResponse> => {
  try {
    const url = getServerSideBaseUrl(req);
    const result = await httpSsrRefreshedClient(
      url
    ).client.post<RefreshTokenResponse>(
      `/authentication-api/api/authentication/refresh-token`,
      {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      }
    );
    session.accessToken = result.data.response.accessToken;
    session.refreshToken = result.data.response.refreshToken;
    await session.save();
    updateErrorHeaders(error, result.data.response.accessToken);
    return Promise.resolve(result.data);
  } catch {
    return Promise.reject(error);
  }
};

const getServerSideBaseUrl = (req: NextApiRequest) => {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${protocol}://${host}`;
};

const updateErrorHeaders = (error: AxiosError, accessToken: string) => {
  if (error?.config?.headers)
    error.config.headers.Authorization = `Bearer ${accessToken}`;
};
