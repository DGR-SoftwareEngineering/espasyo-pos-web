import { Box, Stack, Typography, useTheme } from "@mui/material";

export const MetricDisplay: React.FC<{
  label: string;
  value: string;
  icon?: React.ReactNode;
  iconColor?: string;
  valueColor?: string;
  tooltip?: boolean;
}> = ({
  label,
  value,
  icon,
  iconColor,
  valueColor = "text.primary",
  tooltip,
}) => {
  const theme = useTheme();

  return (
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
          sx={tooltip ? { cursor: "help" } : {}}
        >
          {value}
        </Typography>
      </Stack>
    </Stack>
  );
};
