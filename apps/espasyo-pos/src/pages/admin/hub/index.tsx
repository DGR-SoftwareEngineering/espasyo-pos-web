import { SSRWithContentSecurityPolicy, useAuthContext } from "core-lib";
import { AdminDashboard } from "../../../components/dashboard/admin";
import { GetServerSideProps } from "next";
import { LoadingState } from "core-lib/components/radix/LoadingState";

const AdminHub = () => {
  const { loading, initials, role } = useAuthContext();

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
