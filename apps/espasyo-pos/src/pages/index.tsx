import { LoginFormBlock } from "../components/loginForm/LoginFormBlock";
import { SSRWithContentSecurityPolicy } from "core-lib";
import {
  fetchContentBlocksByPageSSR,
  fetchPublicSettingsSSR,
  PAGE_KEYS,
} from "core-lib/business/settings";
import { ContentBlockDto, SystemSettingDto } from "core-lib/api/commons/types";
import { GetServerSideProps, GetServerSidePropsResult } from "next";
import React from "react";

interface LoginPageProps {
  initialPublicSettings?: SystemSettingDto[];
  loginContentBlocks?: ContentBlockDto[];
}

const Login: React.FC<LoginPageProps> = ({ loginContentBlocks }) => {
  return <LoginFormBlock contentBlocks={loginContentBlocks ?? []} />;
};

const fetchData: GetServerSideProps<LoginPageProps> = async (): Promise<
  GetServerSidePropsResult<LoginPageProps>
> => {
  const [initialPublicSettings, loginContentBlocks] = await Promise.all([
    fetchPublicSettingsSSR(),
    fetchContentBlocksByPageSSR(PAGE_KEYS.Login),
  ]);
  return {
    props: { initialPublicSettings, loginContentBlocks },
  };
};

export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy(fetchData);

export default Login;
