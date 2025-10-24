import { addMinutes, parseISO } from "date-fns";
import { useIdleTimer } from "react-idle-timer";
import { useApiCallback } from "../../../hooks";
import { useSessionStorage } from "../../../hooks";

type AliveCheck = { lastRequest: string } | undefined;

interface Props {
  sessionId?: string;
  onSessionExpired: AsyncFunction;
}

const startSessionCheckAfterMinutes =
  process.env.NODE_ENV === "development" ? 2 : 1;

export const useSessionIdleTimer = ({ onSessionExpired, sessionId }: Props) => {
  const sessionCb = useApiCallback((api) => api.authentication.session());
  const keepAliveCb = useApiCallback((api) => api.authentication.keepAlive());
  const [aliveCheck, setAliveCheck, clearAliveCheck] =
    useSessionStorage<AliveCheck>("auth_session", undefined);

  const idleTimer = useIdleTimer({
    onIdle: async () => {
      if (!sessionId) return;
      try {
        await sessionCb.execute();
        idleTimer.start();
      } catch (error: any) {
        await handleSessionExpiration();
      }
    },
    onAction: async () => {
      if (!sessionId) return;
      if (!aliveCheck) {
        resetAliveCheck();
      }

      if (oneMinutePassed(aliveCheck!)) {
        try {
          await keepAliveCb.execute();
          resetAliveCheck();
        } catch {
          await handleSessionExpiration();
        }
      }
    },
    startManually: true,
    stopOnIdle: true,
    debounce: 400,
    crossTab: true,
    syncTimers: 400,
    name: sessionId,
    onMessage: handleSessionExpiration,
    timeout: startSessionCheckAfterMinutes * 60000,
  });

  function startIdleTimer() {
    resetAliveCheck();
    idleTimer.start();
  }

  function stopIdleTimer() {
    clearAliveCheck();
    idleTimer.message({}, false);
    idleTimer.reset();
  }

  function resetAliveCheck() {
    setAliveCheck({ lastRequest: new Date().toISOString() });
  }

  async function handleSessionExpiration() {
    clearAliveCheck();
    await onSessionExpired();
  }

  return { start: startIdleTimer, stop: stopIdleTimer };
};

const oneMinutePassed = (session: AliveCheck) =>
  session && new Date() >= addMinutes(parseISO(session.lastRequest), 1);
