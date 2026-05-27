import { useCallback, useEffect, useState } from "react";
import { cashDrawerService } from "../../business/cashDrawer";
import { usePublicSettings } from "../contexts/PublicSettingsContext";
import { useToastContext } from "../contexts/ToastContext";

export const useCashDrawer = () => {
  const { showToast } = useToastContext();
  const { pos } = usePublicSettings();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Sync hardware config from backend settings whenever they change
  useEffect(() => {
    cashDrawerService.configure(pos.cashDrawerBaudRate, pos.cashDrawerKickPin);
  }, [pos.cashDrawerBaudRate, pos.cashDrawerKickPin]);

  // Auto-reconnect on mount if supported
  useEffect(() => {
    if (!cashDrawerService.isSupported()) return;
    cashDrawerService.reconnect().then((ok) => setIsConnected(ok));
  }, []); // run once on mount

  const connect = useCallback(async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    const result = await cashDrawerService.requestPort();
    setIsConnected(result === 'connected');
    setIsConnecting(false);
    if (result === 'failed') {
      showToast("Could not connect — check your hardware and try again.", "error");
    }
  }, [isConnecting, showToast]);

  const testKick = useCallback(async () => {
    if (!isConnected) {
      showToast("Connect the cash drawer first.", "error");
      return;
    }
    await cashDrawerService.kickDrawer();
    showToast("Cash drawer kicked successfully.", "success");
  }, [isConnected, showToast]);

  return {
    isSupported: cashDrawerService.isSupported(),
    isConnected,
    isConnecting,
    isGloballyEnabled: pos.cashDrawerEnabled,
    connect,
    testKick,
  };
};
