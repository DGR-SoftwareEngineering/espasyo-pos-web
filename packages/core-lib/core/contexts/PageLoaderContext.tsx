import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter } from "../router";
import { BrandedLoader } from "../../components/radix/BrandedLoader";
import { RouteTransitionLoader } from "../../components/radix/RouteTransitionLoader";

interface PageLoaderContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  startContentTransition: () => void;
  endContentTransition: () => void;
  isContentTransition: boolean;
}

const context = createContext<PageLoaderContextType | undefined>(undefined);

interface Props {
  isAuthenticated?: boolean;
  children: React.ReactNode;
}

const isDashboardPath = (path: string) =>
  path.startsWith("/hub") || path.startsWith("/admin/hub");

export const PageLoaderContextProvider: React.FC<Props> = ({
  children,
  isAuthenticated = false,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isContentTransition, setIsContentTransition] = useState(false);
  const [isRouteChange, setIsRouteChange] = useState(false);
  const [isAuthSwitchTransition, setIsAuthSwitchTransition] = useState(false);
  const lastPathRef = useRef<string>(router.asPath);

  useEffect(() => {
    if (isAuthenticated) {
      setTimeout(() => setIsLoading(false), 300);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      if (url === router.asPath) return;

      const cleanFrom = (lastPathRef.current ?? "").split("?")[0] ?? "/";
      const cleanTo = url.split("?")[0] ?? "/";
      const crossesAuthBoundary =
        isDashboardPath(cleanFrom) !== isDashboardPath(cleanTo);

      if (isAuthenticated) {
        if (crossesAuthBoundary) {
          setIsAuthSwitchTransition(true);
        } else {
          setIsContentTransition(true);
        }
      } else {
        setIsLoading(true);
      }
      setIsRouteChange(true);
    };

    const handleRouteChangeComplete = (url: string) => {
      lastPathRef.current = url;
      setIsContentTransition(false);
      setIsAuthSwitchTransition(false);
      setIsLoading(false);
      setIsRouteChange(false);
    };

    const handleRouteChangeError = () => {
      setIsContentTransition(false);
      setIsAuthSwitchTransition(false);
      setIsLoading(false);
      setIsRouteChange(false);
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeError);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      router.events.off("routeChangeError", handleRouteChangeError);
    };
  }, [router, isAuthenticated]);

  const startContentTransition = () => setIsContentTransition(true);
  const endContentTransition = () => setIsContentTransition(false);

  const renderContent = () => {
    if (!isAuthenticated && (isLoading || router.loading)) {
      return <BrandedLoader />;
    }

    if (isAuthenticated && isAuthSwitchTransition) {
      return <BrandedLoader message="Opening your dashboard…" />;
    }

    if (isAuthenticated && (isContentTransition || isRouteChange)) {
      return (
        <>
          <div style={{ pointerEvents: "none" }}>{children}</div>
          <RouteTransitionLoader />
        </>
      );
    }

    return <div data-testid="children-component">{children}</div>;
  };

  return (
    <context.Provider
      value={{
        isLoading,
        setIsLoading,
        startContentTransition,
        endContentTransition,
        isContentTransition,
      }}
    >
      {renderContent()}
    </context.Provider>
  );
};

export const usePageLoaderContext = () => {
  const ctx = useContext(context);

  if (!ctx) {
    throw new Error(
      "usePageLoaderContext must be used within a PageLoaderContextProvider",
    );
  }

  return ctx;
};
