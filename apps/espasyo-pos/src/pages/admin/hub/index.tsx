import { Flex, Text } from "@radix-ui/themes";
import { SSRWithContentSecurityPolicy, useAuthContext } from "core-lib";
import { AdminDashboard } from "../../../components/dashboard/admin";
import { GetServerSideProps } from "next";

const AdminHub = () => {
  const { loading } = useAuthContext();

  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: 240 }}>
        <Text color="gray">Loading…</Text>
      </Flex>
    );
  }

  return <AdminDashboard />;
};
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default AdminHub;
