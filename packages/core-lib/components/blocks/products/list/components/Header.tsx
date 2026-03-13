import React from "react";
import { Stack, Box, Typography, Button, alpha } from "@mui/material";
import { InventoryOutlined, AddOutlined } from "@mui/icons-material";

interface HeaderProps {
  onCreate: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCreate }) => {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
      gap={2}
    >
      <Stack direction="row" spacing={2} alignItems="center">
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
          <InventoryOutlined
            sx={{ color: (theme) => theme.palette.primary.main }}
          />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Products
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your product catalog and inventory
          </Typography>
        </Box>
      </Stack>

      <Button
        variant="contained"
        startIcon={<AddOutlined />}
        onClick={onCreate}
        sx={{
          borderRadius: 2,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow: (theme) =>
            `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
        }}
      >
        New Product
      </Button>
    </Stack>
  );
};
