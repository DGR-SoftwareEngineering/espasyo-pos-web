import { Flex, Text } from "@radix-ui/themes";
import { SSRWithContentSecurityPolicy, useAuthContext } from "core-lib";
import { AdminDashboard } from "../../../components/dashboard/admin";
import { GetServerSideProps } from "next";

const AdminHub = () => {
  const { loading, isAuthenticated, isAuthReady } = useAuthContext();

  if (!isAuthReady || loading) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: 240 }}>
        <Text color="gray">Loading…</Text>
      </Flex>
    );
  }

  if (!isAuthenticated) return null;

  return <AdminDashboard />;
};
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy(undefined, { requireAuth: true });
export default AdminHub;
