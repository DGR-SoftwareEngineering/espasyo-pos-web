import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import {
  countPendingOfflineSales,
  getPendingOfflineSales,
  markSaleFailed,
  markSaleSynced,
} from "../services/offlineDb";
import { httpClient } from "../hooks/useApi";
import { CommonsApi } from "../../api/commons/api";
import type { SyncOfflineSaleItemParams } from "../../api/commons/types";

export interface OfflineModeContextValue {
  isOnline: boolean;
  pendingSalesCount: number;
  isSyncing: boolean;
  syncDialogOpen: boolean;
  openSyncDialog: () => void;
  closeSyncDialog: () => void;
  executeSyncAll: () => Promise<void>;
  refreshPendingCount: () => Promise<void>;
  disconnectDialogOpen: boolean;
  closeDisconnectDialog: () => void;
}

const OfflineModeContext = createContext<OfflineModeContextValue>({
  isOnline: true,
  pendingSalesCount: 0,
  isSyncing: false,
  syncDialogOpen: false,
  openSyncDialog: () => undefined,
  closeSyncDialog: () => undefined,
  executeSyncAll: async () => undefined,
  refreshPendingCount: async () => undefined,
  disconnectDialogOpen: false,
  closeDisconnectDialog: () => undefined,
});

export const useOfflineMode = () => useContext(OfflineModeContext);

export const OfflineModeProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { isOnline } = useNetworkStatus();

  const [pendingSalesCount, setPendingSalesCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const isSyncingRef = useRef(false);

  // Track previous isOnline to detect transitions reliably.
  // Initialized with the actual current value so the first render
  // doesn't falsely trigger "just reconnected" logic.
  const prevIsOnlineRef = useRef<boolean>(isOnline);

  const refreshPendingCount = useCallback(async () => {
    const count = await countPendingOfflineSales();
    setPendingSalesCount(count);
  }, []);

  // Load pending count on mount.
  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  // Detect online ↔ offline transitions via ref comparison.
  // Using sonner directly avoids the unstable showToast reference that
  // would cause this effect to re-run on every parent render.
  useEffect(() => {
    const wasOnline = prevIsOnlineRef.current;
    prevIsOnlineRef.current = isOnline;

    if (wasOnline && !isOnline) {
      setDisconnectDialogOpen(true);
      toast.warning("You are now offline. Sales will be saved locally.", {
        id: "offline-status",
      });
    } else if (!wasOnline && isOnline) {
      countPendingOfflineSales().then((n) => {
        refreshPendingCount();
        if (n > 0) {
          toast.success(`Back online! ${n} sale(s) ready to sync.`, {
            id: "offline-status",
          });
        } else {
          toast.success("Back online!", { id: "offline-status" });
        }
      });
    }
  }, [isOnline, refreshPendingCount]);

  const openSyncDialog = useCallback(() => setSyncDialogOpen(true), []);
  const closeSyncDialog = useCallback(() => {
    if (!isSyncingRef.current) setSyncDialogOpen(false);
  }, []);
  const closeDisconnectDialog = useCallback(
    () => setDisconnectDialogOpen(false),
    [],
  );

  const executeSyncAll = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncing(true);

    try {
      const pending = await getPendingOfflineSales();
      if (pending.length === 0) {
        return;
      }

      const api = new CommonsApi(httpClient.client, httpClient.client);
      const syncItems: SyncOfflineSaleItemParams[] = pending.map((record) => ({
        ...record.payload,
        localId: record.localId,
        offlineCreatedAt: record.createdAt,
      }));

      const response = await api.syncOfflineSales({ sales: syncItems });
      const results = response.data?.response?.results ?? [];

      for (const result of results) {
        if (result.success && result.sale) {
          await markSaleSynced(
            result.localId,
            result.sale.saleNumber ?? result.localId,
          );
        } else {
          await markSaleFailed(
            result.localId,
            result.errorMessage ?? "Sync failed",
          );
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Sync request failed";
      const pending = await getPendingOfflineSales();
      for (const record of pending) {
        await markSaleFailed(record.localId, message);
      }
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
      await refreshPendingCount();
    }
  }, [refreshPendingCount]);

  return (
    <OfflineModeContext.Provider
      value={{
        isOnline,
        pendingSalesCount,
        isSyncing,
        syncDialogOpen,
        openSyncDialog,
        closeSyncDialog,
        executeSyncAll,
        refreshPendingCount,
        disconnectDialogOpen,
        closeDisconnectDialog,
      }}
    >
      {children}
    </OfflineModeContext.Provider>
  );
};
