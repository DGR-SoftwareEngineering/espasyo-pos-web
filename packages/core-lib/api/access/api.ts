import { AxiosInstance } from "axios";
import { ApiResponse } from "../types";
import {
  AccessMeResponse,
  AccessRoleListResponse,
  AccessRoleResponse,
  CreateAccessRoleParams,
  CreateMenuItemParams,
  MenuItemListResponse,
  MenuItemResponse,
  ReorderMenuItemParams,
  RolePermissionsResponse,
  UpdateAccessRoleParams,
  UpdateMenuItemParams,
  UpdateRolePermissionsParams,
} from "./types";

const BASE = "/api/v1/access-api";

export class AccessApi {
  constructor(private readonly axios: AxiosInstance) {}

  public me() {
    return this.axios.get<AccessMeResponse>(`${BASE}/Access/me`);
  }

  // ===== Roles =====

  public roleList() {
    return this.axios.get<AccessRoleListResponse>(`${BASE}/Role`);
  }

  public roleGetById(id: string) {
    return this.axios.get<AccessRoleResponse>(`${BASE}/Role/${id}`);
  }

  public createRole(params: CreateAccessRoleParams) {
    return this.axios.post<AccessRoleResponse>(`${BASE}/Role`, params);
  }

  public updateRole(params: UpdateAccessRoleParams) {
    return this.axios.put<AccessRoleResponse>(`${BASE}/Role`, params);
  }

  public softDeleteRole(id: string) {
    return this.axios.delete<ApiResponse<boolean>>(`${BASE}/Role/${id}`);
  }

  // ===== Role permissions =====

  public rolePermissions(roleId: string) {
    return this.axios.get<RolePermissionsResponse>(
      `${BASE}/Role/${roleId}/permissions`,
    );
  }

  public updateRolePermissions(
    roleId: string,
    params: UpdateRolePermissionsParams,
  ) {
    return this.axios.put<RolePermissionsResponse>(
      `${BASE}/Role/${roleId}/permissions`,
      params,
    );
  }

  // ===== Menu items =====

  public menuItemList() {
    return this.axios.get<MenuItemListResponse>(`${BASE}/MenuItem`);
  }

  public menuItemGetById(id: string) {
    return this.axios.get<MenuItemResponse>(`${BASE}/MenuItem/${id}`);
  }

  public createMenuItem(params: CreateMenuItemParams) {
    return this.axios.post<MenuItemResponse>(`${BASE}/MenuItem`, params);
  }

  public updateMenuItem(params: UpdateMenuItemParams) {
    return this.axios.put<MenuItemResponse>(`${BASE}/MenuItem`, params);
  }

  public softDeleteMenuItem(id: string) {
    return this.axios.delete<ApiResponse<boolean>>(`${BASE}/MenuItem/${id}`);
  }

  public reorderMenuItems(params: ReorderMenuItemParams) {
    return this.axios.put<ApiResponse<number>>(
      `${BASE}/MenuItem/reorder`,
      params,
    );
  }
}
