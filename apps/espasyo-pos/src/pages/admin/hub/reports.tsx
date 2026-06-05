import { Flex, Text } from "@radix-ui/themes";
import { SSRWithContentSecurityPolicy, useAuthContext } from "core-lib";
import { AdminReportsPage } from "../../../components/reports/AdminReportsPage";
import { GetServerSideProps } from "next";

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
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default ReportsPage;
