import dynamic from "next/dynamic";
import { AuthProvider, Layout as LayoutComponent } from "core-lib";

interface Props {}

const Page: React.FC<React.PropsWithChildren> = ({ children }) => {
  const Layout = dynamic(() =>
    import("core-lib/components/Layout").then((c) => c.Layout)
  ) as React.FC<React.PropsWithChildren<{ framework: "Radix" | "MUI" }>>;

  //TODO: Add Authentication Context to this higher level code.
  return (
    <AuthProvider authMethod="STANDARD_AUTH">
      <Layout framework="Radix">{children}</Layout>
    </AuthProvider>
  );
};

export default Page;
