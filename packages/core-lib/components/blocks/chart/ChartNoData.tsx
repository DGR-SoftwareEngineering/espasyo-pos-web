import { Box, Typography } from "@mui/material";

interface Props {
  id: string;
  fullHeight?: boolean;
  text: string;
}

export const ChartNoDataMessage: React.FC<Props> = ({
  id,
  fullHeight,
  text,
}) => (
  <Box
    id={id}
    data-testid="chart-no-data"
    height={fullHeight ? "100%" : 400}
    width="100%"
    display="flex"
    alignItems="center"
    justifyContent="center"
  >
    <Typography variant="body1" aria-live="assertive">
      {text}
    </Typography>
  </Box>
);
