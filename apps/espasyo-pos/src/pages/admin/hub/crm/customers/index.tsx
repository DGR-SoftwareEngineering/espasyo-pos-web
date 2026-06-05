import { GetServerSideProps } from "next";
import { CustomerListBlock } from "../../../../../components/contents/crm";
import { SSRWithContentSecurityPolicy } from "core-lib";

const CrmCustomersPage = () => <CustomerListBlock />;
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default CrmCustomersPage;
