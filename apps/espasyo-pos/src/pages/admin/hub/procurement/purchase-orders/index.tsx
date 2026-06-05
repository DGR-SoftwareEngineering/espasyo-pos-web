import { GetServerSideProps } from "next";
import { PurchaseOrderListBlock } from "../../../../../components/contents/procurement";
import { SSRWithContentSecurityPolicy } from "core-lib";

const PurchaseOrdersPage = () => <PurchaseOrderListBlock />;
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default PurchaseOrdersPage;
