import { useEffect, useState } from "react";
import { useAuthContext } from "../contexts";

/**
 * Broadcasts a message to detect duplicate sessions.
 * This hook is used for preventing duplicate sessions across multiple tabs or windows.
 * @example
 * // Inside your main component or layout
 * const { hasDuplicateSession } = usePreventDuplicateSession();
 */
export function usePreventDuplicateSession() {
  const { isAuthenticated, softLogout } = useAuthContext();
  const [hasDuplicateSession, setHasDuplicateSession] =
    useState<boolean>(false);

  useEffect(() => {
    const broadcast = new BroadcastChannel("preventDuplicate");

    broadcast.postMessage({ type: "announce" });

    const handleDuplicateSession = async () => {
      broadcast.close();
      if (isAuthenticated) {
        await softLogout();
      }
    };

    broadcast.onmessage = (event) => {
      const receivedData = event.data;

      if (receivedData.type === "announce" && isAuthenticated) {
        broadcast.postMessage({ type: "duplicate" });
      }

      if (receivedData.type === "duplicate") {
        handleDuplicateSession();
        setHasDuplicateSession(receivedData.type === "duplicate");
      }
    };

    return () => {
      broadcast.close();
    };
  }, [isAuthenticated]);

  return {
    hasDuplicateSession,
  };
}
