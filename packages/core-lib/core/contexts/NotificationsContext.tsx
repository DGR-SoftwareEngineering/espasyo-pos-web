import React, {
  createContext,
  JSX,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MessageType } from "../../components/topAlertMessages/types";
import { useScroll } from "../hooks";
import { usePageLoaderContext } from "./PageLoaderContext";
import { CmsButton } from "../../cms/types";
import { useRouter } from "../router";

interface Notification {
  timer?: boolean;
  type: MessageType;
  message?: string;
  buttons?: CmsButton[];
  children?: JSX.Element;
}

interface NotificationsContextValue {
  notification?: Notification;
  loading?: boolean;
  showNotifications: (notifications: Notification[]) => void;
  hideNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  showNotifications: () => null,
  hideNotifications: () => null,
});

export const useNotificationsContext = () => useContext(NotificationsContext);

export const NotificationsContextProvider: React.FC<
  React.PropsWithChildren<{}>
> = ({ children }) => {
  const router = useRouter();
  const scroll = useScroll();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const isDataLoading = router.asPath === router.staticRoutes.hub;

  const hideNotifications = useCallback(() => setNotifications([]), []);

  const showNotifications = useCallback(
    (notifications: Notification[]) => {
      setNotifications(notifications);
      scroll.scrollTop();
    },
    [scroll]
  );

  useEffect(() => {
    router.events.on("routeChangeComplete", hideNotifications);
    router.events.on("routeChangeError", hideNotifications);
    return () => {
      router.events.off("routeChangeComplete", hideNotifications);
      router.events.off("routeChangeError", hideNotifications);
    };
  }, []);

  return (
    <NotificationsContext.Provider
      value={useMemo(
        () => ({
          notification: notifications?.[0],
          loading: isDataLoading,
          showNotifications,
          hideNotifications,
        }),
        [notifications, isDataLoading, showNotifications, hideNotifications]
      )}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
