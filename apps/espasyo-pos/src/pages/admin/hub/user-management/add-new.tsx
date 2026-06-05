import { SSRWithContentSecurityPolicy } from "core-lib";
import { UserCreateBlock } from "../../../../components";
import { GetServerSideProps } from "next";

const AddNewUser = () => {
  return <UserCreateBlock />;
};
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default AddNewUser;
