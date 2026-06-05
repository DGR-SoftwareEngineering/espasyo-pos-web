import React from "react";
import { Box, Stack, Typography, Tooltip as MuiTooltip } from "@mui/material";

interface Props {
  label: string;
  value: string;
  icon?: React.ReactNode;
  iconColor?: string;
  valueColor?: string;
  tooltip?: React.ReactNode;
  showTooltip?: boolean;
}

export const MetricDisplay: React.FC<Props> = ({
  label,
  value,
  icon,
  iconColor,
  valueColor = "text.primary",
  tooltip,
  showTooltip = false,
}) => {
  const content = (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Stack direction="row" spacing={0.5} alignItems="center">
        {icon && (
          <Box component="span" sx={{ color: iconColor, display: "flex" }}>
            {icon}
          </Box>
        )}
        <Typography
          variant="body2"
          fontWeight={600}
          color={valueColor}
          sx={showTooltip ? { cursor: "help" } : {}}
        >
          {value}
        </Typography>
      </Stack>
    </Stack>
  );

  if (showTooltip && tooltip) {
    return (
      <MuiTooltip title={tooltip} arrow>
        {content}
      </MuiTooltip>
    );
  }

  return content;
};
