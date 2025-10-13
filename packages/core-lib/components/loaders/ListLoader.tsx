import { Grid } from "@mui/material";
import { AnimatedBoxSkeleton } from "../animations";

interface Props {
  id?: string;
  loadersCount?: number;
  isFullWidth?: boolean;
  spacing?: number;
  "data-testid"?: string;
}

export const ListLoader: React.FC<Props> = ({
  id,
  loadersCount = 1,
  isFullWidth,
  spacing = 16,
  ...props
}) => (
  <Grid id={id} container spacing={spacing} width="100%" {...props}>
    {Array.from(Array(loadersCount)).map((item, index) => (
      <Grid key={index} container size={{ xs: 12 }} spacing={4}>
        <Grid size={{ xs: 12 }} spacing={4}>
          <Grid size={{ xs: 12 }} container>
            <Grid size={isFullWidth ? { xs: 12 } : { xs: 8 }}>
              <AnimatedBoxSkeleton height={24} />
            </Grid>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Grid size={isFullWidth ? { xs: 12 } : { xs: 4 }}>
              <AnimatedBoxSkeleton height={24} />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Grid size={isFullWidth ? { xs: 12 } : { xs: 6 }}>
            <AnimatedBoxSkeleton
              height={24}
              sx={{ backgroundColor: "appColors.tertiary.light" }}
            />
          </Grid>
        </Grid>
      </Grid>
    ))}
  </Grid>
);
