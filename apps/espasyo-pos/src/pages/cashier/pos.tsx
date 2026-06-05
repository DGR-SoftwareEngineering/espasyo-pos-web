import { GetServerSideProps } from "next";
import { PosRegisterBlock } from "../../components/contents/pos";
import { SSRWithContentSecurityPolicy } from "core-lib";

const PosPage = () => {
  return <PosRegisterBlock />;
};

export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();

export default PosPage;
