import { CategoriesAndTemplatesBlock } from "@/components/contents/categories/CategoriesAndTemplatesBlock";
import { SSRWithContentSecurityPolicy } from "core-lib";
import { GetServerSideProps } from "next";

const CategoriesPage = () => <CategoriesAndTemplatesBlock />;
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default CategoriesPage;
