import React from "react";
import { Box, Typography, Avatar, alpha } from "@mui/material";
import { InventoryOutlined } from "@mui/icons-material";

interface FormHeaderProps {
  isEdit: boolean;
}

export const FormHeader: React.FC<FormHeaderProps> = ({ isEdit }) => (
  <Box
    sx={{
      px: 4,
      py: 3,
      background: (theme) =>
        `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(
          theme.palette.secondary.main,
          0.02,
        )} 100%)`,
      borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
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
      <InventoryOutlined />
    </Avatar>
    <Box>
      <Typography variant="h5" fontWeight={600}>
        {isEdit ? "Edit Product" : "Create New Product"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {isEdit
          ? "Update product details"
          : "Add a new product to your inventory catalog"}
      </Typography>
    </Box>
  </Box>
);
