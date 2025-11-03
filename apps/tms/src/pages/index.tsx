import { LoginFormBlock, SSRWithContentSecurityPolicy } from "core-lib";
import { GetServerSideProps } from "next";
import React from "react";

const Home: React.FC = () => {
  return <LoginFormBlock />;
};

export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();

export default Home;
