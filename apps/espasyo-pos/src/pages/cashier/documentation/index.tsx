import { GetServerSideProps } from "next";
import { DocumentationCashierReaderBlock } from "../../../components/contents/cashier/documentation";
import { SSRWithContentSecurityPolicy } from "core-lib";

const CashierDocumentationPage = () => <DocumentationCashierReaderBlock />;
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default CashierDocumentationPage;
