import { useRouter } from "next/router";
import { CustomerDetailBlock } from "../../../../../components/contents/crm";
import { GetServerSideProps } from "next";
import { SSRWithContentSecurityPolicy } from "core-lib";

const CrmCustomerDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  if (typeof id !== "string" || !id) return null;
  return <CustomerDetailBlock customerId={id} />;
};
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default CrmCustomerDetailPage;
