import { SSRWithContentSecurityPolicy, useAuthContext } from "core-lib";
import { AdminReportsPage } from "../../../components/reports/AdminReportsPage";
import { GetServerSideProps } from "next";
import { LoadingState } from "core-lib/components/radix/LoadingState";

const ReportsPage = () => {
  const { loading } = useAuthContext();

  if (loading) return <LoadingState />;

  return <AdminReportsPage />;
};
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default ReportsPage;
