import dynamic from "next/dynamic";
import { AuthProvider, Layout as LayoutComponent } from "core-lib";

interface Props {}

const Page: React.FC<React.PropsWithChildren> = ({ children }) => {
  const Layout = dynamic<React.ComponentProps<typeof LayoutComponent>>(
    () => import("core-lib/components/Layout").then((c) => c.Layout),
    {
      ssr: false,
    }
  );

  //TODO: Add Authentication Context to this higher level code.
  return (
    <AuthProvider authMethod="STANDARD_AUTH">
      <Layout children={children} />
    </AuthProvider>
  );
};

export default Page;
