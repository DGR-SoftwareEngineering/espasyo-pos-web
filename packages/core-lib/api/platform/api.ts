import { AxiosInstance } from "axios";
import {
  PlatformDto,
  CreatePlatformParams,
  UpdatePlatformParams,
  PlatformListResponse,
  PlatformResponse,
  PlatformUserDto,
  PlatformUsersResponse,
} from "./types";

export class PlatformApi {
  constructor(private readonly axios: AxiosInstance) {}

  public list() {
    return this.axios.get<PlatformListResponse>(
      `/api/v1/platform-api/platforms`
    );
  }

  public getById(id: string) {
    return this.axios.get<PlatformResponse>(
      `/api/v1/platform-api/platforms/${id}`
    );
  }

  public create(params: CreatePlatformParams) {
    return this.axios.post<PlatformResponse>(
      `/api/v1/platform-api/platforms`,
      params
    );
  }

  public update(id: string, params: UpdatePlatformParams) {
    return this.axios.put<PlatformResponse>(
      `/api/v1/platform-api/platforms/${id}`,
      params
    );
  }

  public delete(id: string) {
    return this.axios.delete(`/api/v1/platform-api/platforms/${id}`);
  }

  public getByUser(userId: string) {
    return this.axios.get<PlatformDto[]>(
      `/api/v1/platform-api/platforms/user/${userId}/platforms`
    );
  }

  public getUsersByPlatform(platformId: string) {
    return this.axios.get<PlatformUsersResponse>(
      `/api/v1/platform-api/platforms/${platformId}/users`
    );
  }

  public assignUser(platformId: string, userId: string) {
    return this.axios.post(
      `/api/v1/platform-api/platforms/${platformId}/users/${userId}`
    );
  }

  public removeUser(platformId: string, userId: string) {
    return this.axios.delete(
      `/api/v1/platform-api/platforms/${platformId}/users/${userId}`
    );
  }
}
