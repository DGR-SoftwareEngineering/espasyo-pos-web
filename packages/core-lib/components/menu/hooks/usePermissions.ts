import { useMemo } from "react";
import { roleConfig } from "../config/roleConfig";
import { Permission } from "../permissions";

export const usePermissions = (roleName: string | null, roleData?: any) => {
  const permissions = useMemo(() => {
    if (!roleName) {
      return null;
    }

    const mappedRole = mapRoleToConfig(roleName, roleData);

    // Check if roleConfig exists and has the mapped role
    if (!roleConfig) {
      console.log("roleConfig is undefined");
      return null;
    }

    const config = roleConfig[mappedRole];

    if (!config) {
      console.log(`No config found for role: ${mappedRole}`);
      return null;
    }

    return config.permissions || null;
  }, [roleName, roleData]);

  const hasPermission = (
    permissionKey: string,
    action: keyof Permission = "view",
  ): boolean => {
    if (!permissions) {
      console.log(`No permissions object for key: ${permissionKey}`);
      return false;
    }

    // Handle nested paths (e.g., "sales.nested.new")
    if (permissionKey.includes(".")) {
      const parts = permissionKey.split(".");
      let current: any = permissions;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) return false;

        if (!current || typeof current !== "object") {
          return false;
        }

        // If we're at the last part, check the permission
        if (i === parts.length - 1) {
          return current[part]?.[action] || false;
        }

        // Handle nested structure
        if (part === "nested") {
          continue;
        }

        // Get the next level
        const next = current[part];
        if (next && typeof next === "object") {
          if ("nested" in next) {
            current = next.nested;
          } else {
            current = next;
          }
        } else {
          return false;
        }
      }
    }

    // Direct permission check (e.g., "dashboard", "sales")
    const permission = permissions[permissionKey];

    if (!permission) {
      return false;
    }

    // If it's a simple permission object with view/create/edit/delete
    if (typeof permission === "object" && "view" in permission) {
      return permission[action] || false;
    }

    return false;
  };

  const canView = (permissionKey: string) =>
    hasPermission(permissionKey, "view");
  const canCreate = (permissionKey: string) =>
    hasPermission(permissionKey, "create");
  const canEdit = (permissionKey: string) =>
    hasPermission(permissionKey, "edit");
  const canDelete = (permissionKey: string) =>
    hasPermission(permissionKey, "delete");

  return {
    permissions,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
  };
};

const mapRoleToConfig = (roleName: string, roleData?: any): string => {
  // Normalize the role name to handle both "Cashier" and "cashier"
  const normalizedRole = roleName?.toLowerCase() || "";

  const roleMap: Record<string, string> = {
    cashier: "cashier",
    admin: "admin",
    manager: "manager",
    staff: "staff",
    superadmin: "admin",
  };

  if (roleData?.level) {
    if (roleData.level >= 90) return "admin";
    if (roleData.level >= 70) return "manager";
    if (roleData.level >= 40) return "cashier";
    if (roleData.level >= 10) return "staff";
  }

  const mappedRole = roleMap[normalizedRole];

  // Default to cashier instead of staff for your use case
  return mappedRole || "cashier";
};
