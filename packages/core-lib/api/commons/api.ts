import { AxiosInstance } from "axios";
import qs from "query-string";
import { ApiResponse, Car, Driver, User } from "../types";
import { UserInfoResponse } from "./types";

export class CommonsApi {
  constructor(
    private readonly axios: AxiosInstance,
    private readonly ssrAxios: AxiosInstance
  ) {} //axios = client-side, ssrAxios = server-side (next)

  public getByUrl<T = unknown>(url: string) {
    return this.axios.get<T>(url);
  }

  public postByUrl<T = unknown>(url: string, body: object) {
    return this.axios.post<T>(url, body);
  }

  public dataSummary<T = Record<string, object>>(
    url: string,
    params: Record<string, any> = {}
  ) {
    return this.axios.get<T>(`${url}?${qs.stringify(params)}`);
  }

  public getAllCars(includes: string[]) {
    const params = includes
      .map((s) => `Includes=${encodeURIComponent(s)}`)
      .join("&");
    const path = `/vehicle-api/api/vehicle?${params}`;
    return this.axios.get<ApiResponse<Car[]>>(path);
  }

  public getUserById() {
    return this.ssrAxios.get<UserInfoResponse>(`/api/commons/get-user-info`);
  }

  public getRoleById(roleId?: string) {
    return this.axios.get<ApiResponse<{ roleName: string }>>(
      `/api/v1/role-api/role/${roleId}`
    );
  }
}
