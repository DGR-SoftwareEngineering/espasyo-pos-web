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

  const isPageLoading =
    (loading || isLoading) && router.asPath === router.staticRoutes.hub;

  useEffect(() => {
    if (!isPageLoading && router.staticRoutes.page_not_found) {
      router.push((routes) => routes.page_not_found);
    }
  }, [isPageLoading, router.staticRoutes.page_not_found]);

  return (
    <>
      {isPageLoading && (
        <Box
          flex={1}
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <ComponentLoader disableMarginBottom />
        </Box>
      )}
      {!isPageLoading && (
        <Box display="flex" flexDirection="column" height="100%">
          {children}
        </Box>
      )}
    </>
  );
};
