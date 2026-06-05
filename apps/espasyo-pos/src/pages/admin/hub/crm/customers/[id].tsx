import { useRouter } from "next/router";
import { CustomerDetailBlock } from "../../../../../components/contents/crm";

const CrmCustomerDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  if (typeof id !== "string" || !id) return null;
  return <CustomerDetailBlock customerId={id} />;
};

export default CrmCustomerDetailPage;
