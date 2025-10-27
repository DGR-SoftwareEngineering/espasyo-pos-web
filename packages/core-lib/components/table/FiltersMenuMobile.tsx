import { Grid, Grow, Paper, Popper, Typography } from "@mui/material";
import { ReactNode } from "react";
import { BackButtonV2, PrimaryButton, TextButton } from "../buttons";

interface Props {
  open: boolean;
  filters: ReactNode[];
  labelPrefix?: string;
  onClosed(): void;
  onFiltersApplied(): void;
  onFiltersCleared(): void;
}

export const FiltersMenuMobile: React.FC<Props> = ({
  open,
  filters,
  labelPrefix,
  onFiltersCleared,
  onFiltersApplied,
  onClosed,
}) => {
  return (
    <Popper
      open={open}
      role="menu"
      placement="bottom-end"
      transition
      disablePortal
      popperOptions={{ strategy: "absolute" }}
      modifiers={[
        {
          name: "whole-page",
          fn: () => {},
          enabled: true,
          phase: "main",
          options: {
            altAxis: true,
            altBoundary: true,
            tether: true,
            offset: "0px, 0px, 0px, 0px",
            overflow: "hidden",
          },
        },
      ]}
      style={{ zIndex: 1 }}
    >
      {({ TransitionProps }) => (
        <Grow {...TransitionProps} style={{ transformOrigin: "right top" }}>
          <Paper
            sx={{
              top: 0,
              mt: (theme) => theme.sizes.mobileHeaderHeight,
              pt: 5,
              height: (theme) =>
                `calc(100vh - ${theme.sizes.mobileHeaderHeight})`,
              overflowY: "scroll",
              boxShadow: "unset",
            }}
          >
            <Grid
              container
              width="100vw"
              maxWidth="100vw"
              px={(theme) => theme.sizes.mobileContentPaddingX}
              rowSpacing={12}
            >
              <Grid size={{ xs: 12 }}>
                <BackButtonV2 label="Filter back" onClick={onClosed} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h4" fontWeight="bold">
                  Filters
                </Typography>
              </Grid>
              {filters.map((filter, idx) => (
                <Grid key={idx} size={{ xs: 12 }}>
                  {filter}
                </Grid>
              ))}
              <Grid size={{ xs: 12 }}>
                <PrimaryButton fullWidth onClick={applyFilters}>
                  Filters Apply
                </PrimaryButton>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextButton fullWidth onClick={clearFilters}>
                  Filter Clear
                </TextButton>
              </Grid>
            </Grid>
          </Paper>
        </Grow>
      )}
    </Popper>
  );
  function applyFilters() {
    onFiltersApplied();
    onClosed();
  }

  function clearFilters() {
    onFiltersCleared();
    onClosed();
  }
};
