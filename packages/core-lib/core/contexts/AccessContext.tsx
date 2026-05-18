import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AccessMeDto,
  AccessPermissionsMap,
  AccessRoleDto,
  MenuItemDto,
} from "../../api/access/types";
import { useApiCallback } from "../hooks";
import { useAuthContext } from "./auth/AuthContext";

export interface AccessContextValue {
  ready: boolean;
  loading: boolean;
  error: string | null;
  role: AccessRoleDto | null;
  menu: MenuItemDto[];
  permissions: AccessPermissionsMap;
  refresh: () => Promise<void>;
}

const EMPTY: AccessContextValue = {
  ready: false,
  loading: false,
  error: null,
  role: null,
  menu: [],
  permissions: {},
  refresh: async () => {},
};

const Context = createContext<AccessContextValue>(EMPTY);

export const useAccessContext = () => useContext(Context);

export const AccessProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { isAuthenticated } = useAuthContext();
  const [state, setState] = useState<{
    role: AccessRoleDto | null;
    menu: MenuItemDto[];
    permissions: AccessPermissionsMap;
    ready: boolean;
  }>({ role: null, menu: [], permissions: {}, ready: false });
  const [error, setError] = useState<string | null>(null);

  const cb = useApiCallback((api) => api.access.me());

  const applyDto = useCallback((dto: AccessMeDto) => {
    setState({
      role: dto.role,
      menu: dto.menu ?? [],
      permissions: dto.permissions ?? {},
      ready: true,
    });
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const result = await cb.execute();
      const dto = result.data.response;
      if (dto) applyDto(dto);
    } catch (e) {
      console.error("Failed to load /Access/me", e);
      const first =
        Array.isArray(e) && typeof e[0] === "string"
          ? (e[0] as string)
          : "Failed to load access";
      setError(first);
    }
  }, [isAuthenticated, cb, applyDto]);

  useEffect(() => {
    if (!isAuthenticated) {
      setState({ role: null, menu: [], permissions: {}, ready: false });
      setError(null);
      return;
    }
    refresh();
  }, [isAuthenticated]);

  const value = useMemo<AccessContextValue>(
    () => ({
      ready: state.ready,
      loading: cb.loading,
      error,
      role: state.role,
      menu: state.menu,
      permissions: state.permissions,
      refresh,
    }),
    [state, cb.loading, error, refresh],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};
