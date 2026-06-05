import React from "react";
import { Box, Flex } from "@radix-ui/themes";
import { useRouter } from "../../../core/router";
import { ComponentLoader } from "../loaders/ComponentLoader";

interface Props {
  loading: boolean;
}

export const LoadablePageContent: React.FC<React.PropsWithChildren<Props>> = ({
  loading,
  children,
}) => {
  const router = useRouter();
  const calculationsLoading = router.asPath === router.staticRoutes.hub;
  const isPageLoading = loading && !calculationsLoading;

  if (isPageLoading && calculationsLoading) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{ flex: 1, height: "100%" }}
      >
        <ComponentLoader disableMarginBottom={false} />
      </Flex>
    );
  }

  return (
    <Box
      style={{
        display: loading ? "none" : "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {children}
    </Box>
  );
};
