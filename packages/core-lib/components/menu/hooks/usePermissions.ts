import { useMemo } from "react";
import { roleConfig } from "../config/roleConfig";
import { Permission } from "../permissions";

export const usePermissions = (roleName: string | null) => {
  const permissions = useMemo(() => {
    if (!roleName) {
      return null;
    }
    const mappedRole = mapRoleToConfig(roleName);

    if (!roleConfig) {
      console.log("❌ roleConfig is undefined");
      return null;
    }

    const config = roleConfig[mappedRole];

    if (!config) {
      return null;
    }

    return config.permissions || null;
  }, [roleName]);

  const hasPermission = (
    permissionKey: string,
    action: keyof Permission = "view",
  ): boolean => {
    if (!permissions) {
      return false;
    }

    if (permissionKey.includes(".")) {
      const parts = permissionKey.split(".");
      let current: any = permissions;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) return false;

        if (!current || typeof current !== "object") {
          return false;
        }

        if (i === parts.length - 1) {
          return current[part]?.[action] || false;
        }

        if (part === "nested") {
          continue;
        }

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

    const permission = permissions[permissionKey];

    if (!permission) {
      return false;
    }

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

const mapRoleToConfig = (roleName: string): string => {
  const normalizedRole = roleName?.toLowerCase() || "";
  const roleMap: Record<string, string> = {
    cashier: "cashier",
    admin: "admin",
    manager: "manager",
    staff: "staff",
  };

  const mappedRole = roleMap[normalizedRole] || "cashier";
  return mappedRole;
};
