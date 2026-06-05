import { GetServerSideProps } from "next";
import { DeletedCustomersAdminBlock } from "../../../../../components/contents/crm";
import { SSRWithContentSecurityPolicy } from "core-lib";

const DeletedCustomersAdminPage = () => <DeletedCustomersAdminBlock />;
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default DeletedCustomersAdminPage;
