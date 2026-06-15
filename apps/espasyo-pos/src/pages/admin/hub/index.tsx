import { SSRWithContentSecurityPolicy, useAuthContext, useOfflineMode } from "core-lib";
import { AdminDashboard } from "../../../components/dashboard/admin";
import { GetServerSideProps } from "next";
import { useEffect } from "react";
import { useApiCallback } from "core-lib/core/hooks";
import { LoadingState } from "core-lib/components/radix/LoadingState";

const AdminHub = () => {
  const { loading, initials, role, isAuthenticated } = useAuthContext();
  const logoutWithClearCookiesCb = useApiCallback((api) =>
      api.authentication.logoutWithClearCookies(),
  );
  const { isOnline } = useOfflineMode();

  useEffect(() => {
    if (!isAuthenticated && isOnline) {
      logoutWithClearCookiesCb.execute();
    }
  }, [isAuthenticated, isOnline]);

  if (loading) return <LoadingState />;

  return <AdminDashboard initials={initials} role={role} />;
};
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy(async (context) => {
    return {
      props: {},
    };
  }, true);
export default AdminHub;
