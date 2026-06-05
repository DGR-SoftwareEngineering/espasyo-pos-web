import { GetServerSideProps } from "next";
import { ProductFormBlock } from "../../../../components";
import { SSRWithContentSecurityPolicy } from "core-lib";
const AddNewProduct = () => {
  return <ProductFormBlock />;
};
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default AddNewProduct;
