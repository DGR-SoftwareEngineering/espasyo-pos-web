import axios, { AxiosInstance, CancelTokenSource } from "axios";
import { useAsync, useAsyncCallback } from "react-async-hook";
import { stringify } from "qs";
import { AccessApi } from "../../api/access/api";
import { Api } from "../../api/api";
import { AuthenticationApi } from "../../api/authentication/api";
import { CommonsApi } from "../../api/commons/api";
import Http, { HttpOptions } from "../http-client";
import { getItem } from "../session-storage";
import { config } from "../../config";

const source: CancelTokenSource = axios.CancelToken.source();

const HTTP_OPTIONS: HttpOptions = {
  headers: { ENV: config.value.NODE_ENV, "ngrok-skip-browser-warning": "true" },
  paramsSerializer: (params) =>
    stringify(params, { encode: true, arrayFormat: "brackets" }),
  onRequest: (req) => {
    const accessToken = getItem<string | undefined>("accessToken");
    if (req.headers && accessToken)
      req.headers.Authorization = `Bearer ${accessToken}`;
  },
  onError: (error) => {
    const status = (error as any)?.response?.status;
    if (status === 401 || status === 403) return;
    const user = getItem<string | undefined>("user");
    console.error(
      `Error on response: ${JSON.stringify(error)}. User: ${JSON.stringify(
        user,
      )}`,
    );
  },
  cancelToken: source.token,
  ...(process.env.NODE_ENV === "development" && {
    httpsAgent: new (require("https").Agent)({
      rejectUnauthorized: false,
    }),
  }),
};

export const httpClient = new Http({
  ...HTTP_OPTIONS,
  baseURL: config.value.APIURL,
});

export const httpSsrClient = new Http({
  ...HTTP_OPTIONS,
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : typeof window !== "undefined"
        ? window.location.origin
        : undefined,
});

export const httpSsrRefreshedClient = (url: string) =>
  new Http({
    ...HTTP_OPTIONS,
    baseURL: url,
  });

const updateHttpClient = () => {
  let headers: Record<string, string>;

  headers = {
    ENV: "",
  };

  httpClient.updateHeaders(headers);
};

export const useApi = <R, D extends unknown[]>(
  asyncFn: (api: Api) => Promise<R>,
  deps?: D,
) => {
  updateHttpClient();
  return useAsync(async () => {
    try {
      const api = createApi(httpClient.client, httpSsrClient.client);
      return await asyncFn(api);
    } catch (error) {
      throw handleError(error);
    }
  }, [httpClient, ...(deps || [])]);
};

export const useApiCallback = <R, A extends unknown>(
  asyncFn: (api: Api, args: A) => Promise<R>,
) => {
  updateHttpClient();
  return useAsyncCallback(async (args?: A) => {
    try {
      const api = createApi(httpClient.client, httpSsrClient.client);
      return await asyncFn(api, args as A);
    } catch (error) {
      throw handleError(error);
    }
  });
};

function createApi(client: AxiosInstance, httpSsrClient: AxiosInstance) {
  return new Api(
    new AuthenticationApi(client, httpSsrClient),
    new CommonsApi(client, httpSsrClient),
    new AccessApi(client),
  );
}

function handleError(e: any) {
  const status: number | undefined = e.response?.status;
  if (status !== 401 && status !== 403) {
    console.error(`Error on client side response: ${JSON.stringify(e)}`);
  }
  const body = e.response?.data;
  const rawErrors = body?.errors;

  let arr: string[];
  if (Array.isArray(rawErrors)) {
    arr = rawErrors.map((entry) =>
      typeof entry === "string"
        ? entry
        : (entry?.code ?? entry?.message ?? "something_went_wrong"),
    );
  } else if (rawErrors && typeof rawErrors === "object") {
    // RFC 7807 ProblemDetails — errors is { fieldName: ["message", ...] }
    // Emitted by ASP.NET's automatic ModelState validation before our service codes fire.
    arr = Object.entries(rawErrors as Record<string, unknown>).flatMap(
      ([field, messages]) => {
        const list = Array.isArray(messages) ? messages : [messages];
        return list
          .filter((m): m is string => typeof m === "string")
          .map((m) => (field && field !== "" ? `${field}: ${m}` : m));
      },
    );
    if (arr.length === 0) {
      arr = [body?.title ?? "something_went_wrong"];
    }
  } else {
    arr = [body?.title ?? body?.message ?? "something_went_wrong"];
  }

  const enriched = arr as string[] & { status?: number };
  if (status !== undefined) enriched.status = status;
  return enriched;
}
