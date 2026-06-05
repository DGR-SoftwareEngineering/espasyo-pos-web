import { useEffect, useState } from "react";
import { MpinStatusDto } from "../../api/authentication/types";
import { useMpinStatusContext } from "../contexts/MpinStatusContext";
import { useApiCallback } from "./useApi";

export interface UseMpinStatusResult {
  status: MpinStatusDto | null;
  loading: boolean;
  ready: boolean;
  refresh: () => Promise<void>;
}

export const useMpinStatus = (
  options: { enabled?: boolean } = {},
): UseMpinStatusResult => {
  const { enabled = true } = options;
  const ctx = useMpinStatusContext();

  const fallbackHook = useFallbackMpinStatus(enabled, !!ctx);
  if (ctx) return ctx;
  return fallbackHook;
};

const useFallbackMpinStatus = (
  enabled: boolean,
  hasContext: boolean,
): UseMpinStatusResult => {
  const [status, setStatus] = useState<MpinStatusDto | null>(null);
  const [ready, setReady] = useState(false);
  const cb = useApiCallback((api) => api.authentication.mpinStatus());

  const refresh = async () => {
    if (!enabled || hasContext) return;
    try {
      const result = await cb.execute();
      const dto = result.data.response;
      if (dto) setStatus(dto);
      setReady(true);
    } catch {
      setStatus(null);
      setReady(true);
    }
  };

  useEffect(() => {
    if (hasContext) return;
    if (!enabled) {
      setStatus(null);
      setReady(false);
      return;
    }
    refresh();
  }, [enabled, hasContext]);

  return { status, loading: cb.loading, ready, refresh };
};
