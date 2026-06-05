import { GetServerSideProps } from "next";
import { CashierShiftManagementBlock } from "../../../components/contents/cashier/shift-management";
import { SSRWithContentSecurityPolicy } from "core-lib";

const CashierShiftManagementPage = () => <CashierShiftManagementBlock />;
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default CashierShiftManagementPage;
