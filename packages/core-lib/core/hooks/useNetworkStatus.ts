import { useCallback, useEffect, useState } from "react";

export interface NetworkStatus {
  isOnline: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  const handleOnline = useCallback(() => setIsOnline(true), []);
  const handleOffline = useCallback(() => setIsOnline(false), []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Fallback poll — DevTools "Offline" doesn't always fire the window event
    // reliably across all Chrome versions. Check navigator.onLine every 2s.
    const interval = setInterval(() => {
      setIsOnline((prev) => {
        const actual = navigator.onLine;
        return actual !== prev ? actual : prev;
      });
    }, 2000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline };
}
