import { GetServerSideProps } from "next";
import { DeletedCustomersCashierBlock } from "../../../components/contents/cashier/deleted-customers";
import { SSRWithContentSecurityPolicy } from "core-lib";

const DeletedCustomersCashierPage = () => <DeletedCustomersCashierBlock />;
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default DeletedCustomersCashierPage;
