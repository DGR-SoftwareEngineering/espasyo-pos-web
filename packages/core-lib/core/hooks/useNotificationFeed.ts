import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApiCallback } from "./useApi";
import { getItem } from "../session-storage";
import { config } from "../../config";
import { useAuthContext, usePublicSettings } from "../contexts";
import {
  NotificationDto,
  NotificationQueryParams,
} from "../../api/commons/types";

const PAGE_SIZE = 20;
const SSE_BACKOFF_MS = [1000, 2000, 5000, 10000, 30000] as const;

interface UseNotificationFeedArgs {
  /** When true, the feed disables polling/SSE (used when bell isn't visible). */
  paused?: boolean;
  /** Filter shown notifications. Defaults to all (read + unread). */
  unreadOnly?: boolean;
}

export interface UseNotificationFeedResult {
  notifications: NotificationDto[];
  unreadCount: number;
  totalCount: number;
  loading: boolean;
  error: string | null;
  /** Re-fetch the first page. */
  refresh: () => Promise<void>;
  /** Mark a single notification read locally + on the server. */
  markRead: (notificationID: string) => Promise<void>;
  /** Mark all as read. */
  markAllRead: () => Promise<void>;
  /** Current transport mode (for UI badge). */
  transport: "sse" | "polling" | "idle";
}

/**
 * Loads the user's notifications and keeps them fresh. Transport is chosen
 * dynamically:
 *
 *   - `notifications.realtime === true` → opens an SSE stream and reacts to
 *     server-pushed events (created / read / read-all).
 *   - `notifications.realtime === false` → falls back to interval polling at
 *     `notifications.pollIntervalSeconds`.
 *
 * The hook auto-reconnects with exponential backoff on SSE failure, and
 * surfaces the current transport in `result.transport` so the UI can render
 * a "Live" pill when SSE is healthy.
 */
export const useNotificationFeed = ({
  paused = false,
  unreadOnly,
}: UseNotificationFeedArgs = {}): UseNotificationFeedResult => {
  const { isAuthenticated } = useAuthContext();
  const { notifications: notifConfig, features } = usePublicSettings();

  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transport, setTransport] = useState<"sse" | "polling" | "idle">(
    "idle",
  );

  const listCb = useApiCallback(
    async (api, args: NotificationQueryParams) =>
      await api.commons.notificationList(args),
  );
  const countCb = useApiCallback(
    async (api) => await api.commons.notificationCount(),
  );
  const markReadCb = useApiCallback(
    async (api, id: string) => await api.commons.markNotificationRead(id),
  );
  const markAllCb = useApiCallback(
    async (api) => await api.commons.markAllNotificationsRead(),
  );

  const enabled =
    isAuthenticated && features.notificationsEnabled && !paused;

  const fetchList = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const params: NotificationQueryParams = {
        pageNumber: 1,
        pageSize: PAGE_SIZE,
      };
      if (unreadOnly !== undefined) params.unreadOnly = unreadOnly;
      const result = await listCb.execute(params);
      const page = result.data?.response;
      setNotifications(page?.items ?? []);
      setTotalCount(page?.totalItems ?? 0);
    } catch (err) {
      const first =
        Array.isArray(err) && typeof err[0] === "string"
          ? (err[0] as string)
          : "Failed to load notifications";
      setError(first);
    } finally {
      setLoading(false);
    }
  }, [enabled, unreadOnly, listCb]);

  const fetchCount = useCallback(async () => {
    if (!enabled) return;
    try {
      const result = await countCb.execute();
      const c = result.data?.response;
      if (c) {
        setUnreadCount(c.unread);
        setTotalCount(c.total);
      }
    } catch {
      // Silent — count failures don't surface to the user.
    }
  }, [enabled, countCb]);

  const fetchListRef = useRef(fetchList);
  const fetchCountRef = useRef(fetchCount);
  useEffect(() => {
    fetchListRef.current = fetchList;
    fetchCountRef.current = fetchCount;
  });

  useEffect(() => {
    if (!enabled) {
      setTransport("idle");
      return;
    }
    void fetchListRef.current();
    void fetchCountRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, unreadOnly]);

  useEffect(() => {
    if (!enabled || notifConfig.realtime) return;
    setTransport("polling");
    const intervalMs = Math.max(notifConfig.pollIntervalSeconds, 5) * 1000;
    const timer = setInterval(() => {
      void fetchListRef.current();
      void fetchCountRef.current();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [
    enabled,
    notifConfig.realtime,
    notifConfig.pollIntervalSeconds,
  ]);

  useEffect(() => {
    if (!enabled || !notifConfig.realtime) return;
    const safetyMs = Math.max(notifConfig.pollIntervalSeconds, 15) * 1000;
    const timer = setInterval(() => {
      void fetchCountRef.current();
      void fetchListRef.current();
    }, safetyMs);
    return () => clearInterval(timer);
  }, [enabled, notifConfig.realtime, notifConfig.pollIntervalSeconds]);

  // SSE transport with exponential-backoff reconnect.
  const esRef = useRef<EventSource | null>(null);
  const backoffIdxRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || !notifConfig.realtime) return;
    if (typeof window === "undefined") return;

    const openStream = () => {
      const accessToken = getItem<string | undefined>("accessToken") ?? "";
      if (!accessToken) {
        setTransport("idle");
        return;
      }
      const url = `${config.value.APIURL}/api/v1/notifications-api/Notifications/stream?access_token=${encodeURIComponent(accessToken)}`;
      const es = new EventSource(url, { withCredentials: false });
      esRef.current = es;

      es.onopen = () => {
        setTransport("sse");
        backoffIdxRef.current = 0;
      };

      es.addEventListener("notification.created", (evt) => {
        try {
          const data = JSON.parse((evt as MessageEvent).data) as NotificationDto;
          setNotifications((prev) => {
            if (prev.find((n) => n.notificationID === data.notificationID))
              return prev;
            return [data, ...prev].slice(0, PAGE_SIZE);
          });
          if (!data.read) setUnreadCount((c) => c + 1);
          setTotalCount((t) => t + 1);
        } catch {
          // Malformed payload — ignore.
        }
      });

      es.addEventListener("notification.read", (evt) => {
        try {
          const { notificationID } = JSON.parse(
            (evt as MessageEvent).data,
          ) as { notificationID: string };
          setNotifications((prev) =>
            prev.map((n) =>
              n.notificationID === notificationID
                ? { ...n, read: true, readAt: new Date().toISOString() }
                : n,
            ),
          );
          setUnreadCount((c) => Math.max(0, c - 1));
        } catch {
          /* ignore */
        }
      });

      es.addEventListener("notification.read-all", () => {
        const stamp = new Date().toISOString();
        setNotifications((prev) =>
          prev.map((n) =>
            n.read ? n : { ...n, read: true, readAt: stamp },
          ),
        );
        setUnreadCount(0);
      });

      es.onerror = () => {
        es.close();
        esRef.current = null;
        setTransport("idle");
        const idx = Math.min(
          backoffIdxRef.current,
          SSE_BACKOFF_MS.length - 1,
        );
        const delay = SSE_BACKOFF_MS[idx];
        backoffIdxRef.current = idx + 1;
        reconnectTimerRef.current = setTimeout(openStream, delay);
      };
    };

    openStream();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      esRef.current?.close();
      esRef.current = null;
      setTransport("idle");
    };
  }, [enabled, notifConfig.realtime]);

  const markRead = useCallback(
    async (notificationID: string) => {
      // Optimistic update.
      const wasUnread = notifications.find(
        (n) => n.notificationID === notificationID && !n.read,
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationID === notificationID
            ? { ...n, read: true, readAt: new Date().toISOString() }
            : n,
        ),
      );
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await markReadCb.execute(notificationID);
      } catch {
        // Roll back on failure.
        void fetchList();
        void fetchCount();
      }
    },
    [notifications, markReadCb, fetchList, fetchCount],
  );

  const markAllRead = useCallback(async () => {
    const stamp = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) => (n.read ? n : { ...n, read: true, readAt: stamp })),
    );
    setUnreadCount(0);
    try {
      await markAllCb.execute();
    } catch {
      void fetchList();
      void fetchCount();
    }
  }, [markAllCb, fetchList, fetchCount]);

  return useMemo(
    () => ({
      notifications,
      unreadCount,
      totalCount,
      loading,
      error,
      refresh: fetchList,
      markRead,
      markAllRead,
      transport,
    }),
    [
      notifications,
      unreadCount,
      totalCount,
      loading,
      error,
      fetchList,
      markRead,
      markAllRead,
      transport,
    ],
  );
};
