import { GetServerSideProps } from "next";
import { ShiftManagementBlock } from "../../../../components/contents/shift-management";
import { SSRWithContentSecurityPolicy } from "core-lib";

const ShiftManagementPage = () => <ShiftManagementBlock />;
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default ShiftManagementPage;
