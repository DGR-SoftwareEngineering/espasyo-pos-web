import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MpinStatusDto } from "../../api/authentication/types";
import { useApiCallback } from "../hooks/useApi";
import { useAuthContext } from "./auth/AuthContext";

export interface MpinStatusValue {
  status: MpinStatusDto | null;
  loading: boolean;
  ready: boolean;
  refresh: () => Promise<void>;
}

const Context = createContext<MpinStatusValue | null>(null);

export const useMpinStatusContext = (): MpinStatusValue | null =>
  useContext(Context);

export const MpinStatusProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { isAuthenticated } = useAuthContext();
  const [status, setStatus] = useState<MpinStatusDto | null>(null);
  const [ready, setReady] = useState(false);

  const cb = useApiCallback((api) => api.authentication.mpinStatus());

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const result = await cb.execute();
      const dto = result.data.response;
      if (dto) setStatus(dto);
      setReady(true);
    } catch {
      setStatus(null);
      setReady(true);
    }
  }, [isAuthenticated, cb]);

  useEffect(() => {
    if (!isAuthenticated) {
      setStatus(null);
      setReady(false);
      return;
    }
    refresh();
  }, [isAuthenticated]);

  const value = useMemo<MpinStatusValue>(
    () => ({ status, loading: cb.loading, ready, refresh }),
    [status, cb.loading, ready, refresh],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};
