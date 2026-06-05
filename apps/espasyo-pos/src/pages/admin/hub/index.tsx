import { Flex, Text } from "@radix-ui/themes";
import { useAuthContext } from "core-lib";
import { AdminDashboard } from "../../../components/dashboard/admin";

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

export default AdminHub;
