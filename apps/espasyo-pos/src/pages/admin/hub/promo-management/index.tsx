import { GetServerSideProps } from "next";
import { PromoListBlock } from "../../../../components/contents/promo-management";
import { SSRWithContentSecurityPolicy } from "core-lib";

const PromoManagementPage = () => <PromoListBlock />;
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default PromoManagementPage;
