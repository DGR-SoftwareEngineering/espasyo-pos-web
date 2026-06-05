import { GetServerSideProps } from "next";
import { ProductListBlock } from "../../../../components";
import { SSRWithContentSecurityPolicy } from "core-lib";

const ProductList = () => {
  return <ProductListBlock />;
};
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default ProductList;
