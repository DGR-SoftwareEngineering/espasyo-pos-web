import { AxiosInstance } from "axios";
import { useAsync, useAsyncCallback } from 'react-async-hook'
import { stringify } from 'qs'
import { Api } from "../../api/api";
import { AuthenticationApi } from "../../api/authentication/api";
import { CommonsApi } from "../../api/commons/api";
import Http, { HttpOptions } from "../http-client";
import { getItem } from "../session-storage";
import { config } from "../../config";

const HTTP_OPTIONS: HttpOptions = {
    headers: { ENV: config.value.NODE_ENV }, //Add ENVIRONMENT for (dev, uat, preprod and prod)
    paramsSerializer: params => stringify(params, {  encode: true ,arrayFormat: 'brackets' }),
    onRequest: req => {
        const accessToken = getItem<string | undefined>('accessToken');
        if (req.headers && accessToken) req.headers.Authorization = `Bearer ${accessToken}`;
    },
    onError: error => {
        const user = getItem<string | undefined>('user');
        console.error(`Error on response: ${JSON.stringify(error)}. User: ${JSON.stringify(user)}`); //change this to `datadog` logger.
    }
}

export const httpClient = new Http({ ...HTTP_OPTIONS, baseURL: '' }) //add API_URL from config. (Backend or gateway url)

export const httpSsrClient = new Http({
    ...HTTP_OPTIONS,
    baseURL:
        process.env.NODE_ENV === 'development'
            ? 'http://localhost:3000'
            : typeof window !== 'undefined'
                ? window.location.origin
                : undefined
});

export const httpSsrRefreshedClient = (url: string) =>
    new Http({
        ...HTTP_OPTIONS,
        baseURL: url
    });

/**
 * If planning to make the application purely dynamic and should capable of adding multiple tenants
 * Add : customBgroup?: string[] -> means Add inside the `updateHttpClient` the customBgroup (Custom Business Group) 
 */
const updateHttpClient = () => {
    let headers: Record<string, string>;

    headers = {
        ENV: '' //Add ENVIRONMENT for (dev, uat, preprod and prod)
    }

    httpClient.updateHeaders(headers)
}

export const useApi = <R, D extends unknown[]>(asyncFn: (api: Api) => Promise<R>, deps?: D) => {
    updateHttpClient();
    return useAsync(async () => {
        try {
            const api = createApi(httpClient.client, httpSsrClient.client);
            return await asyncFn(api);
        } catch (error) {
            throw handleError(error);
        }
    }, [httpClient, ...(deps || [])]);
}

export const useApiCallback = <R, A extends unknown>(asyncFn: (api: Api, args: A) => Promise<R>) => {
    updateHttpClient();
    return useAsyncCallback(
        async (args?: A) => {
            try {
                const api = createApi(httpClient.client, httpSsrClient.client);
                return await asyncFn(api, args as A);
            } catch (error) {
                throw handleError(error);
            }
        }
    )
}

function createApi(client: AxiosInstance, httpSsrClient: AxiosInstance) {
    return new Api(
        new AuthenticationApi(client, httpSsrClient), //auth api request for service
        new CommonsApi(client, httpSsrClient) //generic API requests for services
    )
}

function handleError(e: any) {
    console.error(`Error on client side response: ${JSON.stringify(e)}`);
    const rawErrors = e.response?.data?.errors;
    return Array.isArray(rawErrors) ? rawErrors.map(e => e.code ?? 'something_went_wrong') : ['something_went_wrong'];
}