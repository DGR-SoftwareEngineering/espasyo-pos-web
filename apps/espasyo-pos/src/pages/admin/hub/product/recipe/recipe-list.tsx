import { GetServerSideProps } from "next";
import { RecipeListBlock } from "../../../../../components";
import { SSRWithContentSecurityPolicy } from "core-lib";

const RecipeList = () => {
  return <RecipeListBlock />;
};
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default RecipeList;
