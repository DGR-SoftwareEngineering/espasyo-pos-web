import { GetServerSideProps } from "next";
import { InventoryListBlock } from "../../../../components";
import { SSRWithContentSecurityPolicy } from "core-lib";

const InventoryListPage = () => {
  return <InventoryListBlock />;
};
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default InventoryListPage;
