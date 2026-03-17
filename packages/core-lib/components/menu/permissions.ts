export type UserRole = "cashier" | "admin";

export interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

// For items that can have nested permissions OR direct permissions
export type MenuPermission = Permission & {
  nested?: Record<string, Permission>;
};

// For the main permissions object
export interface MenuPermissions {
  [key: string]: MenuPermission;
}

export interface RoleConfig {
  name: string;
  level: number;
  permissions: MenuPermissions;
}

export interface UserRoleInfo {
  id: string;
  name: UserRole;
  level: number;
  permissions: MenuPermissions;
}
