import { alpha, Chip, Tooltip, useTheme } from "@mui/material";

export const MetricBadge: React.FC<{
  label: string;
  value: string;
  color: string;
  tooltip?: string;
}> = ({ label, value, color, tooltip }) => {
  const theme = useTheme();
  const chip = (
    <Chip
      label={`${label}: ${value}`}
      size="small"
      sx={{
        bgcolor: alpha(color, 0.1),
        color,
        cursor: tooltip ? "help" : "default",
        "&:hover": tooltip ? { bgcolor: alpha(color, 0.2) } : {},
      }}
    />
  );

  return tooltip ? (
    <Tooltip title={tooltip} arrow>
      {chip}
    </Tooltip>
  ) : (
    chip
  );
};
