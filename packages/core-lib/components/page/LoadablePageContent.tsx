import { Box } from "@mui/material";
import { useEffect } from "react";
import { usePageLoaderContext } from "../../core/contexts";
import { useRouter } from "../../core/router";
import { ComponentLoader } from "../loaders/ComponentLoader";

interface Props {
  loading: boolean;
}

export const LoadablePageContent: React.FC<React.PropsWithChildren<Props>> = ({
  loading,
  children,
}) => {
  const { isLoading } = usePageLoaderContext();
  const router = useRouter();
  const calculationsLoading = router.asPath === router.staticRoutes.hub;
  const isPageLoading = (loading || isLoading) && !calculationsLoading;

  return (
    <>
      {isPageLoading && calculationsLoading && (
        <Box
          flex={1}
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{}}
        >
          <ComponentLoader disableMarginBottom={false} />
        </Box>
      )}
      {!isPageLoading && (
        <Box
          display={loading ? "none" : "block"}
          flexDirection="column"
          height="100%"
        >
          {children}
        </Box>
      )}
    </>
  );
};
