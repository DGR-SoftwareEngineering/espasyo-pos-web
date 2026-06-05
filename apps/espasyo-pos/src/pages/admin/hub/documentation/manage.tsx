import { GetServerSideProps } from "next";
import { DocumentationManagerBlock } from "../../../../components/contents/documentation";
import { SSRWithContentSecurityPolicy } from "core-lib";

const AdminDocumentationManagePage = () => <DocumentationManagerBlock />;
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default AdminDocumentationManagePage;
