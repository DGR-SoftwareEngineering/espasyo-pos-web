import { useEffect } from "react";
import { Flex, Text } from "@radix-ui/themes";

const FacebookOAuthSuccessPage = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    if (window.opener) {
      window.opener.postMessage(
        {
          type: "FACEBOOK_OAUTH_COMPLETE",
          error: error ? decodeURIComponent(error) : null,
          pageName: params.get("page_name"),
          pageId: params.get("page_id"),
        },
        window.location.origin
      );
      window.close();
    } else {
      window.location.replace("/admin/hub/social-media/facebook");
    }
  }, []);

  return (
    <Flex align="center" justify="center" style={{ height: "100vh" }}>
      <Text color="gray">Connecting to Facebook…</Text>
    </Flex>
  );
};

export default FacebookOAuthSuccessPage;
