import React from "react";
import {
  Stack,
  Box,
  Typography,
  Button,
  alpha,
  SxProps,
  Theme,
} from "@mui/material";
import { AddOutlined } from "@mui/icons-material";

interface Props {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: "contained" | "outlined" | "text";
    color?: "primary" | "secondary" | "success" | "error" | "info" | "warning";
    disabled?: boolean;
  };
  onCreate?: () => void;
  extraContent?: React.ReactNode;
  sx?: SxProps<Theme>;
}

export const HeaderV2: React.FC<Props> = ({
  title,
  subtitle,
  icon,
  actionButton,
  onCreate,
  extraContent,
  sx,
}) => {
  const resolvedActionButton =
    actionButton ||
    (onCreate
      ? {
          label: `New ${title?.split(" ")[0]}`,
          onClick: onCreate,
          icon: <AddOutlined />,
          variant: "contained" as const,
          color: "primary" as const,
          disabled: false,
        }
      : undefined);
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
      gap={2}
      sx={sx}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        {icon && (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        )}
        <Box>
          <Typography variant="h5" fontWeight={600}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center">
        {extraContent}
        {resolvedActionButton && (
          <Button
            variant={resolvedActionButton.variant || "contained"}
            startIcon={resolvedActionButton.icon || <AddOutlined />}
            onClick={resolvedActionButton.onClick}
            color={resolvedActionButton.color || "primary"}
            disabled={resolvedActionButton.disabled}
            sx={{
              borderRadius: 2,
              ...(resolvedActionButton.variant === "contained" && {
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette[resolvedActionButton.color || "primary"].main} 0%, ${
                    theme.palette[resolvedActionButton.color || "primary"].dark
                  } 100%)`,
                boxShadow: (theme) =>
                  `0 4px 12px ${alpha(theme.palette[resolvedActionButton.color || "primary"].main, 0.3)}`,
              }),
            }}
          >
            {resolvedActionButton.label}
          </Button>
        )}
      </Stack>
    </Stack>
  );
};
