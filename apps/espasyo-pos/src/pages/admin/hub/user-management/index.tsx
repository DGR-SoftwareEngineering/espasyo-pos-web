import { GetServerSideProps } from "next";
import { PeopleManagementBlock } from "../../../../components";
import { SSRWithContentSecurityPolicy } from "core-lib";

const UserManagement = () => {
  return <PeopleManagementBlock />;
};
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default UserManagement;
