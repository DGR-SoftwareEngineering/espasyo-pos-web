import { GetServerSideProps } from "next";
import { UnitConversionFormBlock } from "../../../components";
import { SSRWithContentSecurityPolicy } from "core-lib";

const UnitConversionManagement = () => {
  return <UnitConversionFormBlock />;
};
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default UnitConversionManagement;
