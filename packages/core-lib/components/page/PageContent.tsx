import { Box, Grid, Stack } from "@mui/material";
import { useEffect } from "react";
import { useRouter } from "../../core/router";
import { useScroll } from "../../core/hooks";

export const PageContent: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { scrollTop, scrollTo } = useScroll();
  const router = useRouter();

  useEffect(() => {
    const anchor = router.asPath.split("#")[1];
    anchor ? scrollTo(anchor) : scrollTop();
  }, [router.asPath]);

  return (
    <Grid container data-testid="page-content" spacing={12}>
      <Grid size={{ xs: 12 }} mb={0}>
        <Stack direction="column" flexWrap="wrap" gap={{ xs: 3, md: 8 }}>
          <Stack
            width="100%"
            direction="row"
            flexWrap={{ xs: "wrap", md: "nowrap" }}
          >
            <Stack
              key={`panel-column`}
              direction="column"
              flexWrap="nowrap"
              className="panel-column"
              position="relative"
              borderRadius={"8px"}
            >
              <Box
                key={`content`}
                mb={0}
                width={{ xs: "100%", md: "100%" }}
                height={"100%"}
              >
                {children}
              </Box>
            </Stack>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
};
