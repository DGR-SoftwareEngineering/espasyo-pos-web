import React from "react";
import { Paper, Typography, alpha, SxProps, Theme } from "@mui/material";

interface StatsCardProps {
  label: string;
  value: number | string;
  color?: "primary" | "success" | "warning" | "error" | "info";
  formatValue?: (value: number | string) => string;
  sx?: SxProps<Theme>;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  color = "primary",
  formatValue = (val) => val.toString(),
  sx,
}) => {
  const themeColor = (theme: Theme) => theme.palette[color].main;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        flex: 1,
        minWidth: 150,
        borderRadius: 2,
        borderColor: (theme) => alpha(themeColor(theme), 0.2),
        bgcolor: (theme) => alpha(themeColor(theme), 0.02),
        ...sx,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={600} color={`${color}.main`}>
        {formatValue(value)}
      </Typography>
    </Paper>
  );
};
