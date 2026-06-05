import { ApiResponse } from "../types";

export interface PermissionDto {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface MenuPermissionDto extends PermissionDto {
  nested?: Record<string, PermissionDto>;
}

export type AccessPermissionsMap = Record<string, MenuPermissionDto>;

export interface AccessRoleDto {
  roleID: string;
  name: string;
  level: number;
  isActive: boolean;
  isSystem: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateAccessRoleParams {
  name: string;
  level?: number;
  description?: string;
}

export interface UpdateAccessRoleParams {
  roleID: string;
  name?: string;
  level?: number;
  isActive?: boolean;
  description?: string;
}

export type MenuItemGroup = "primary" | "secondary";

export interface MenuItemDto {
  menuItemID: string;
  permissionKey: string;
  label: string;
  iconName: string;
  path: string | null;
  parentMenuItemID: string | null;
  displayOrder: number;
  isActive: boolean;
  group: MenuItemGroup;
}

export interface CreateMenuItemParams {
  permissionKey: string;
  label: string;
  iconName: string;
  path?: string;
  parentMenuItemID?: string;
  displayOrder?: number;
  group?: MenuItemGroup;
}

export interface UpdateMenuItemParams {
  menuItemID: string;
  permissionKey?: string;
  label?: string;
  iconName?: string;
  path?: string;
  parentMenuItemID?: string;
  displayOrder?: number;
  isActive?: boolean;
  group?: MenuItemGroup;
}

export interface ReorderMenuItemParams {
  items: Array<{ menuItemID: string; displayOrder: number }>;
}

export interface RolePermissionsDto {
  roleID: string;
  roleName: string;
  permissions: AccessPermissionsMap;
  updatedAt: string | null;
}

export interface UpdateRolePermissionsParams {
  permissions: AccessPermissionsMap;
}

export interface AccessMeDto {
  role: AccessRoleDto;
  menu: MenuItemDto[];
  permissions: AccessPermissionsMap;
}

export type AccessMeResponse = ApiResponse<AccessMeDto>;
export type AccessRoleResponse = ApiResponse<AccessRoleDto>;
export type AccessRoleListResponse = ApiResponse<AccessRoleDto[]>;
export type MenuItemResponse = ApiResponse<MenuItemDto>;
export type MenuItemListResponse = ApiResponse<MenuItemDto[]>;
export type RolePermissionsResponse = ApiResponse<RolePermissionsDto>;
