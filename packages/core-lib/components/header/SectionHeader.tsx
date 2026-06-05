import React from "react";
import {
  Stack,
  Typography,
  Chip,
  Divider,
  alpha,
  useTheme,
  SvgIconProps,
} from "@mui/material";

interface SectionHeaderProps {
  icon?: React.ReactElement<SvgIconProps>;
  title: string;
  badge?: string | number;
  subtitle?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  badge,
  subtitle,
  action,
}) => {
  const theme = useTheme();

  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {icon &&
            React.cloneElement(icon, {
              sx: {
                color: theme.palette.primary.main,
                fontSize: 20,
                ...(icon.props.sx || {}),
              },
            } as Partial<SvgIconProps>)}
          <Stack>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="text.secondary"
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Stack>
          {badge && (
            <Chip
              label={badge}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            />
          )}
        </Stack>
        {action}
      </Stack>
      <Divider sx={{ mb: 3 }} />
    </>
  );
};
