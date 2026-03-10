import { LoginFormBlock } from "../components/loginForm/LoginFormBlock";
import { SSRWithContentSecurityPolicy } from "core-lib";
import { GetServerSideProps } from "next";
import React from "react";

const Login: React.FC = () => {
  return <LoginFormBlock />;
};

export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();

export default Login;
