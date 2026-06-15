import { SSRWithContentSecurityPolicy, useAuthContext } from "core-lib";
import { FacebookBlock } from "../../../../components/contents/social";
import { GetServerSideProps } from "next";
import { LoadingState } from "core-lib/components/radix/LoadingState";

const FacebookPage = () => {
  const { loading } = useAuthContext();
  if (loading) return <LoadingState />;
  return <FacebookBlock />;
};

export const getServerSideProps: GetServerSideProps = SSRWithContentSecurityPolicy();
export default FacebookPage;
