import { Flex, Text } from "@radix-ui/themes";
import { useAuthContext } from "core-lib";
import { AdminReportsPage } from "../../../components/reports/AdminReportsPage";

const ReportsPage = () => {
  const { loading } = useAuthContext();

  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: 240 }}>
        <Text color="gray">Loading…</Text>
      </Flex>
    );
  }

  return <AdminReportsPage />;
};

export default ReportsPage;
