import dynamic from "next/dynamic";
import { AuthProvider, Layout as LayoutComponent } from "core-lib";
import { ErrorBoundary } from "core-lib/components/ErrorBoundary";

interface Props {}

const Page: React.FC<React.PropsWithChildren> = ({ children }) => {
  const Layout = dynamic<React.ComponentProps<typeof LayoutComponent>>(() =>
    import("core-lib/components/Layout").then((c) => c.Layout),
  );

  //TODO: Add Authentication Context to this higher level code.
  return (
    <ErrorBoundary errorMessage="Authentication Error">
      <AuthProvider authMethod="STANDARD_AUTH">
        <Layout framework="MUI" children={children} />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default Page;
