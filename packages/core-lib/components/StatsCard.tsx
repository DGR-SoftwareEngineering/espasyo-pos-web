import React from "react";
import {
  Paper,
  Typography,
  alpha,
  SxProps,
  Theme,
  Stack,
  Box,
} from "@mui/material";

interface StatsCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: "primary" | "success" | "warning" | "error" | "info" | "secondary";
  formatValue?: (value: number | string) => string;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "compact" | "detailed";
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon,
  color = "primary",
  formatValue = (val) => val.toString(),
  trend,
  variant = "default",
  onClick,
  sx,
}) => {
  const getColorValue = (theme: Theme) => theme.palette[color].main;

  const renderContent = () => {
    switch (variant) {
      case "compact":
        return (
          <Stack direction="row" spacing={1.5} alignItems="center">
            {icon && (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(getColorValue(theme), 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {icon}
              </Box>
            )}
            <Stack>
              <Typography variant="h6" fontWeight={600} color={`${color}.main`}>
                {formatValue(value)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
            </Stack>
          </Stack>
        );

      case "detailed":
        return (
          <Stack spacing={1}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
              {icon && (
                <Box
                  sx={{ color: (theme) => alpha(getColorValue(theme), 0.5) }}
                >
                  {icon}
                </Box>
              )}
            </Stack>
            <Typography variant="h4" fontWeight={700} color={`${color}.main`}>
              {formatValue(value)}
            </Typography>
            {trend && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: trend.value > 0 ? "success.main" : "error.main",
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {trend.value > 0 ? "+" : ""}
                  {trend.value}% {trend.label}
                </Typography>
              </Stack>
            )}
          </Stack>
        );

      default:
        return (
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              {icon && (
                <Box
                  sx={{ color: (theme) => alpha(getColorValue(theme), 0.5) }}
                >
                  {icon}
                </Box>
              )}
              <Typography variant="h5" fontWeight={600} color={`${color}.main`}>
                {formatValue(value)}
              </Typography>
            </Stack>
          </Stack>
        );
    }
  };

  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: variant === "compact" ? 1.5 : 2,
        flex: 1,
        minWidth: variant === "compact" ? 120 : 150,
        borderRadius: 2,
        borderColor: (theme) => alpha(getColorValue(theme), 0.2),
        bgcolor: (theme) => alpha(getColorValue(theme), 0.02),
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease-in-out",
        "&:hover": onClick
          ? {
              borderColor: (theme) => alpha(getColorValue(theme), 0.4),
              bgcolor: (theme) => alpha(getColorValue(theme), 0.04),
              transform: "translateY(-2px)",
              boxShadow: (theme) =>
                `0 4px 12px ${alpha(getColorValue(theme), 0.15)}`,
            }
          : {},
        ...sx,
      }}
    >
      {renderContent()}
    </Paper>
  );
};
