import { GetServerSideProps } from "next";
import { SettingsManagementBlock } from "../../../components";
import { SSRWithContentSecurityPolicy } from "core-lib";

const SettingsPage = () => {
  return <SettingsManagementBlock />;
};
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default SettingsPage;
