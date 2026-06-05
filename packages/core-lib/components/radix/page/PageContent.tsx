import React, { useEffect } from "react";
import { Box, Flex } from "@radix-ui/themes";
import { useRouter } from "../../../core/router";
import { useScroll } from "../../../core/hooks";

export const PageContent: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { scrollTop, scrollTo } = useScroll();
  const router = useRouter();

  useEffect(() => {
    const anchor = router.asPath.split("#")[1];
    if (anchor) {
      scrollTo(anchor);
    } else {
      scrollTop();
    }
  }, [router.asPath]);

  return (
    <Flex
      direction="column"
      gap={{ initial: "3", md: "6" }}
      data-testid="page-content"
      style={{ width: "100%" }}
    >
      <Box style={{ width: "100%", height: "100%", borderRadius: 8 }}>
        {children}
      </Box>
    </Flex>
  );
};
