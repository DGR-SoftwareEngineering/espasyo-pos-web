import React from "react";
import { Box, Typography, Avatar, alpha } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";

interface FormHeaderProps {
  isEdit: boolean;
  title: string;
  editTitle?: string;
  subtitle: string;
  editSubtitle?: string;
  icon: SvgIconComponent;
}

export const FormHeader: React.FC<FormHeaderProps> = ({
  isEdit,
  title,
  editTitle,
  subtitle,
  editSubtitle,
  icon: Icon,
}) => {
  const displayTitle = isEdit
    ? editTitle || `Edit ${title}`
    : `Create New ${title}`;
  const displaySubtitle = isEdit ? editSubtitle || subtitle : subtitle;

  return (
    <Box
      sx={{
        px: 4,
        py: 3,
        background: (theme) =>
          `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(
            theme.palette.secondary.main,
            0.02,
          )} 100%)`,
        borderBottom: (theme) =>
          `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Avatar
        sx={{
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
          color: (theme) => theme.palette.primary.main,
          width: 48,
          height: 48,
        }}
      >
        <Icon />
      </Avatar>
      <Box>
        <Typography variant="h5" fontWeight={600}>
          {displayTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {displaySubtitle}
        </Typography>
      </Box>
    </Box>
  );
};
