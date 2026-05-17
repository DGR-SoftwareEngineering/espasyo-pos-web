import { useEffect, useState } from "react";
import { MpinStatusDto } from "../../api/authentication/types";
import { useApiCallback } from "./useApi";

export interface UseMpinStatusResult {
  status: MpinStatusDto | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export const useMpinStatus = (
  options: { enabled?: boolean } = {},
): UseMpinStatusResult => {
  const { enabled = true } = options;
  const [status, setStatus] = useState<MpinStatusDto | null>(null);
  const cb = useApiCallback((api) => api.authentication.mpinStatus());

  const refresh = async () => {
    if (!enabled) return;
    try {
      const result = await cb.execute();
      const dto = result.data.response;
      if (dto) setStatus(dto);
    } catch {
      setStatus(null);
    }
  };

  useEffect(() => {
    if (!enabled) {
      setStatus(null);
      return;
    }
    refresh();
  }, [enabled]);

  return { status, loading: cb.loading, refresh };
};
