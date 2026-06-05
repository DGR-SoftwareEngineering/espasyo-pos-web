import { GetServerSideProps } from "next";
import { SegmentsBlock } from "../../../../components/contents/crm";
import { SSRWithContentSecurityPolicy } from "core-lib";

const CrmSegmentsPage = () => <SegmentsBlock />;
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default CrmSegmentsPage;
