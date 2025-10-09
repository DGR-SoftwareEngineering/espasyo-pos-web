import dynamic from "next/dynamic";
import { Layout as LayoutComponent } from "core-lib";

interface Props {}

const Page: React.FC<React.PropsWithChildren> = ({ children }) => {
  const Layout = dynamic<React.ComponentProps<typeof LayoutComponent>>(
    () => import("core-lib").then((c) => c.Layout),
    {
      ssr: false,
    }
  );

  //TODO: Add Authentication Context to this higher level code.
  return (
    <>
      <Layout children={children} />
    </>
  );
};

export default Page;
