import { GetServerSideProps } from "next";
import { AnalyticsBlock } from "../../../../components/contents/crm";
import { SSRWithContentSecurityPolicy } from "core-lib";

const CrmAnalyticsPage = () => <AnalyticsBlock />;
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default CrmAnalyticsPage;
