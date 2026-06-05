import { GetServerSideProps } from "next";
import { SupplierCreateBlock } from "../../../../components";
import { SSRWithContentSecurityPolicy } from "core-lib";

const AddNewSupplier = () => {
  return <SupplierCreateBlock />;
};
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default AddNewSupplier;
