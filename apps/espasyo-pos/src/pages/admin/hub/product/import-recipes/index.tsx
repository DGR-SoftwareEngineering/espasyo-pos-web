import { GetServerSideProps } from "next";
import { RecipeImportBlock } from "../../../../../components";
import { SSRWithContentSecurityPolicy } from "core-lib";

export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();

export default function ImportRecipesPage() {
  return <RecipeImportBlock />;
}
