import { GetServerSideProps } from "next";
import { LoyaltyOverviewBlock } from "../../../../components/contents/crm";
import { SSRWithContentSecurityPolicy } from "core-lib";

const CrmLoyaltyPage = () => <LoyaltyOverviewBlock />;
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default CrmLoyaltyPage;
