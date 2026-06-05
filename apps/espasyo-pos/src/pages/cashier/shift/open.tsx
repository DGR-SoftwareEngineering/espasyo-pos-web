import { GetServerSideProps } from "next";
import { OpenShiftBlock } from "../../../components/contents/shift/cashier";
import { SSRWithContentSecurityPolicy } from "core-lib";

const OpenShiftPage = () => <OpenShiftBlock />;
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default OpenShiftPage;
