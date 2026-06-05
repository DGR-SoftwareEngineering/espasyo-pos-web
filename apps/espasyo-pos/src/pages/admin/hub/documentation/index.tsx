import { GetServerSideProps } from "next";
import { DocumentationAdminReaderBlock } from "../../../../components/contents/documentation";
import { SSRWithContentSecurityPolicy } from "core-lib";

const AdminDocumentationPage = () => <DocumentationAdminReaderBlock />;
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default AdminDocumentationPage;
