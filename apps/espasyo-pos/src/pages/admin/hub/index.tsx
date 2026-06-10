import { Flex, Text } from "@radix-ui/themes";
import { SSRWithContentSecurityPolicy, useAuthContext } from "core-lib";
import { AdminDashboard } from "../../../components/dashboard/admin";
import { GetServerSideProps } from "next";
import { useEffect } from "react";
import { useApiCallback } from "core-lib/core/hooks";

const AdminHub = () => {
  const { loading, initials, role, isAuthenticated } = useAuthContext();
  const logoutWithClearCookiesCb = useApiCallback((api) =>
      api.authentication.logoutWithClearCookies(),
  );

  useEffect(() => {
    if (!isAuthenticated) {
      logoutWithClearCookiesCb.execute();
    }
  }, [isAuthenticated])

  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: 240 }}>
        <Text color="gray">Loading…</Text>
      </Flex>
    );
  }

  return <AdminDashboard initials={initials} role={role} />;
};
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy(async (context) => {
    return {
      props: {},
    };
  }, true);
export default AdminHub;
