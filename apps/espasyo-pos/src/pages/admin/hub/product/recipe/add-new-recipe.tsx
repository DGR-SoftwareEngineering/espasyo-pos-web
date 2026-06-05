import { GetServerSideProps } from "next";
import { RecipeFormBlock } from "../../../../../components";
import { SSRWithContentSecurityPolicy } from "core-lib";

const AddNewRecipe = () => {
  return <RecipeFormBlock />;
};
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default AddNewRecipe;
