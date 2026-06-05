import { GetServerSideProps } from "next";
import { ProductPerformanceBlock } from "../../../../components/reports/product-performance/ProductPerformanceBlock";
import { SSRWithContentSecurityPolicy } from "core-lib";

const ProductPerformancePage = () => <ProductPerformanceBlock />;
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default ProductPerformancePage;
