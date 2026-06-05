import { GetServerSideProps } from "next";
import { MovementListBlock } from "../../../../components";
import { SSRWithContentSecurityPolicy } from "core-lib";

const MovementsPage = () => {
  return <MovementListBlock />;
};
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default MovementsPage;
