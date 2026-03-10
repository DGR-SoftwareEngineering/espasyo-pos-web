import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "../router";
import { PageLoader } from "../../components";
import { Box, CircularProgress, Fade } from "@mui/material";

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

const ContentAreaLoader = () => (
  <Fade in={true} timeout={300}>
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(3px)",
        zIndex: 1000,
      }}
    >
      <CircularProgress size={40} thickness={4} />
    </Box>
  </Fade>
);

export const PageLoaderContextProvider: React.FC<Props> = ({
  children,
  isAuthenticated = false,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isContentTransition, setIsContentTransition] = useState(false);
  const [isRouteChange, setIsRouteChange] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setTimeout(() => setIsLoading(false), 300);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      if (url === router.asPath) return;

      if (isAuthenticated) {
        setIsContentTransition(true);
      } else {
        setIsLoading(true);
      }
      setIsRouteChange(true);
    };

    const handleRouteChangeComplete = () => {
      setIsContentTransition(false);
      setIsLoading(false);
      setIsRouteChange(false);
    };

    const handleRouteChangeError = () => {
      setIsContentTransition(false);
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
      return <PageLoader data-testid="page-loader" />;
    }

    if (isAuthenticated && (isContentTransition || isRouteChange)) {
      return (
        <Box sx={{ position: "relative", minHeight: "100vh" }}>
          <ContentAreaLoader />
          <Box sx={{ opacity: 0.7, pointerEvents: "none" }}>{children}</Box>
        </Box>
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
