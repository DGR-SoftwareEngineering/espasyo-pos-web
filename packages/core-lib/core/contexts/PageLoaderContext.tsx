import { createContext, useContext, useState } from "react";

const context = createContext<
  | {
      isLoading: boolean;
      setIsLoading(status: boolean): void;
    }
  | undefined
>(undefined);

interface Props {
  loading?: boolean;
}

export const usePageLoaderContext = () => {
  const ctx = useContext(context);
  if (!ctx) {
    throw new Error(
      "usePageLoaderContext must be used within a PageLoaderContextProvider"
    );
  }
  return ctx;
};

export const PageLoaderContextProvider: React.FC<
  React.PropsWithChildren<Props>
> = ({ children, loading }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <context.Provider
      value={{
        isLoading: isLoading || !!loading,
        setIsLoading,
      }}
    >
      {children}
    </context.Provider>
  );
};
