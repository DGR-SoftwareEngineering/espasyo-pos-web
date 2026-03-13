import React from "react";
import {
  Box,
  Stack,
  Typography,
  Chip,
  alpha,
  InputAdornment,
} from "@mui/material";
import {
  InventoryOutlined,
  AttachMoney,
  KitchenOutlined,
} from "@mui/icons-material";
import { PreviewBannerProps } from "../types";

export const PreviewBanner: React.FC<PreviewBannerProps> = ({
  name,
  category,
  price,
  formatPrice,
  isMenuItem,
}) => (
  <Box
    sx={{
      mx: 4,
      mt: 3,
      p: 2.5,
      borderRadius: 2,
      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
      border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 2,
    }}
  >
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <InventoryOutlined
          sx={{ color: (theme) => theme.palette.primary.main, fontSize: 20 }}
        />
      </Box>
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block" }}
        >
          PRODUCT PREVIEW
        </Typography>
        <Typography variant="h6" fontWeight={600}>
          {name}
        </Typography>
        {category && (
          <Typography variant="caption" color="text.secondary">
            Category: {category.name}
          </Typography>
        )}
      </Box>
    </Stack>
    {price && price > 0 && (
      <Chip
        icon={isMenuItem ? <AttachMoney /> : <KitchenOutlined />}
        label={
          isMenuItem ? `₱${formatPrice(price)}` : `Cost: ₱${formatPrice(price)}`
        }
        size="small"
        sx={{
          bgcolor: (theme) =>
            alpha(
              isMenuItem ? theme.palette.success.main : theme.palette.info.main,
              0.1,
            ),
          color: (theme) =>
            isMenuItem ? theme.palette.success.main : theme.palette.info.main,
          fontWeight: 600,
          borderRadius: 2,
        }}
      />
    )}
  </Box>
);
