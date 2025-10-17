import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "../router";
import { PageLoader } from "../../components";

const context = createContext<
  | {
      isLoading: boolean;
      setIsLoading(status: boolean): void;
    }
  | undefined
>(undefined);

interface Props {
  loading?: boolean;
  isAuthenticated?: boolean;
}

export const usePageLoaderContext = () => {
  const ctx = useContext(context);
  console.log("PageLoaderContext:", ctx);
  if (!ctx) {
    throw new Error(
      "usePageLoaderContext must be used within a PageLoaderContextProvider"
    );
  }
  return ctx;
};

export const PageLoaderContextProvider: React.FC<
  React.PropsWithChildren<Props>
> = ({ children, loading, isAuthenticated }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(loading ?? router.loading);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 6000);
  }, [isAuthenticated, isLoading, loading, router.loading]);

  return (
    <context.Provider
      value={{
        isLoading: isLoading || router.loading,
        setIsLoading,
      }}
    >
      {isAuthenticated || !(isLoading || loading || router.loading) ? (
        <div data-testid="children-component">{children}</div>
      ) : (
        <PageLoader data-testid="page-loader" />
      )}
    </context.Provider>
  );
};
