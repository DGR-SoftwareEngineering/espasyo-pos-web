import {
  alpha,
  Box,
  Chip,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { IngredientStats } from "../core/types/ingredients";
import { useMemo } from "react";
import { formatCurrency } from "../business/strings";

export const CostDistributionBar: React.FC<{
  stats: IngredientStats;
  total: number;
}> = ({ stats, total }) => {
  const theme = useTheme();

  const percentages = useMemo(
    () => ({
      min: (stats.min / total) * 100,
      avg: (stats.avg / total) * 100,
      max: (stats.max / total) * 100,
    }),
    [stats, total],
  );

  const items = [
    {
      label: "Min",
      value: stats.min,
      percentage: percentages.min,
      color: theme.palette.success.main,
    },
    {
      label: "Avg",
      value: stats.avg,
      percentage: percentages.avg,
      color: theme.palette.info.main,
    },
    {
      label: "Max",
      value: stats.max,
      percentage: percentages.max,
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <Typography variant="caption" color="text.secondary">
          Cost Distribution (each bar = ingredient cost % of total)
        </Typography>
        <Tooltip
          title={
            <Box>
              {items.map(({ label, percentage }) => (
                <Typography key={label} variant="caption" display="block">
                  • {label} ingredient: {percentage.toFixed(1)}% of total
                </Typography>
              ))}
            </Box>
          }
          arrow
        >
          <Chip
            label="What's this?"
            size="small"
            sx={{ height: 20, fontSize: "0.625rem", cursor: "help" }}
          />
        </Tooltip>
      </Stack>

      <Stack spacing={1}>
        {items.map(({ label, value, percentage, color }) => (
          <Box key={label}>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 0.5 }}
            >
              <Typography variant="caption">
                {label} ({formatCurrency(value)})
              </Typography>
              <Typography variant="caption">
                {percentage.toFixed(1)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.grey[300], 0.3),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 3,
                  bgcolor: color,
                },
              }}
            />
          </Box>
        ))}
      </Stack>
    </Box>
  );
};
