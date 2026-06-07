import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/cashier/pos",
      permanent: false,
    },
  };
};

const CashierIndex = () => null;
export default CashierIndex;
