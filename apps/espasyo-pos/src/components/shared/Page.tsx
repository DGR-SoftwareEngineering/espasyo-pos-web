import { AuthProvider, Layout } from "core-lib";
import { ErrorBoundary } from "core-lib/components/ErrorBoundary";

const Page: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <ErrorBoundary errorMessage="Authentication Error">
      <AuthProvider authMethod="STANDARD_AUTH">
        <Layout framework="Radix">{children}</Layout>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default Page;
