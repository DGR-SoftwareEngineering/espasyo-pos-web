import { useCallback, useEffect, useState } from "react";
import {
  AccessRoleDto,
  MenuItemDto,
  AccessPermissionsMap,
} from "core-lib/api/access/types";
import { useApiCallback } from "core-lib/core/hooks";

export const useRoles = () => {
  const [roles, setRoles] = useState<AccessRoleDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const cb = useApiCallback((api) => api.access.roleList());

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const result = await cb.execute();
      setRoles(result.data.response ?? []);
    } catch (e) {
      console.error("Failed to load roles", e);
      setError(
        Array.isArray(e) && typeof e[0] === "string"
          ? (e[0] as string)
          : "Failed to load roles",
      );
    }
  }, [cb]);

  useEffect(() => {
    refresh();
  }, []);

  return { roles, loading: cb.loading, error, refresh, setRoles };
};

export const useMenuItems = () => {
  const [items, setItems] = useState<MenuItemDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const cb = useApiCallback((api) => api.access.menuItemList());

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const result = await cb.execute();
      setItems(result.data.response ?? []);
    } catch (e) {
      console.error("Failed to load menu items", e);
      setError(
        Array.isArray(e) && typeof e[0] === "string"
          ? (e[0] as string)
          : "Failed to load menu items",
      );
    }
  }, [cb]);

  useEffect(() => {
    refresh();
  }, []);

  return { items, loading: cb.loading, error, refresh, setItems };
};

export const useRolePermissions = (roleId: string | null) => {
  const [permissions, setPermissions] = useState<AccessPermissionsMap>({});
  const [error, setError] = useState<string | null>(null);
  const cb = useApiCallback(
    async (api, id: string) => await api.access.rolePermissions(id),
  );

  const refresh = useCallback(
    async (id: string) => {
      setError(null);
      try {
        const result = await cb.execute(id);
        setPermissions(result.data.response?.permissions ?? {});
      } catch (e) {
        console.error("Failed to load role permissions", e);
        setError(
          Array.isArray(e) && typeof e[0] === "string"
            ? (e[0] as string)
            : "Failed to load role permissions",
        );
      }
    },
    [cb],
  );

  useEffect(() => {
    if (roleId) refresh(roleId);
    else setPermissions({});
  }, [roleId]);

  return {
    permissions,
    setPermissions,
    loading: cb.loading,
    error,
    refresh,
  };
};
