import { Flex, Text } from "@radix-ui/themes";
import { SSRWithContentSecurityPolicy, useAuthContext } from "core-lib";
import { FacebookBlock } from "../../../../components/contents/social";
import { GetServerSideProps } from "next";

const FacebookPage = () => {
  const { loading } = useAuthContext();
  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: 240 }}>
        <Text color="gray">Loading…</Text>
      </Flex>
    );
  }
  return <FacebookBlock />;
};

export const getServerSideProps: GetServerSideProps = SSRWithContentSecurityPolicy();
export default FacebookPage;
