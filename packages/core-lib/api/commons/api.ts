import { AxiosInstance } from "axios";
import qs from 'query-string'

export class CommonsApi {
    constructor(private readonly axios: AxiosInstance, private readonly ssrAxios: AxiosInstance) {} //axios = client-side, ssrAxios = server-side (next)
    
    public getByUrl<T = unknown>(url: string) {
        return this.axios.get<T>(url);
    }

    public postByUrl<T = unknown>(url: string, body: object) {
        return this.axios.post<T>(url, body)
    }

    public dataSummary<T = Record<string, object>>(url: string, params: Record<string, any> = {}) {
        return this.axios.get<T>(`${url}?${qs.stringify(params)}`);
    }
}