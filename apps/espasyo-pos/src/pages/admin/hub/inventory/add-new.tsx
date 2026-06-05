import { GetServerSideProps } from "next";
import { InventoryFormBlock } from "../../../../components";
import { SSRWithContentSecurityPolicy } from "core-lib";

const AddNewInventory = () => {
  return <InventoryFormBlock />;
};
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default AddNewInventory;
