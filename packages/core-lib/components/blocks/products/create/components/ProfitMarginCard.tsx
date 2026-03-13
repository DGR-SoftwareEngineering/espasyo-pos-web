import React from "react";
import { Paper, Stack, Typography, Box, alpha } from "@mui/material";
import { TrendingUpOutlined } from "@mui/icons-material";
import { ProfitMarginProps } from "../types";
import { calculateProfitMargin } from "../utils";

export const ProfitMarginCard: React.FC<ProfitMarginProps> = ({
  unitPrice,
  costPrice,
}) => {
  const { amount, percentage } = calculateProfitMargin(unitPrice, costPrice);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        bgcolor: (theme) => alpha(theme.palette.success.main, 0.03),
        borderColor: (theme) => alpha(theme.palette.success.main, 0.2),
        borderRadius: 2,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <TrendingUpOutlined
          sx={{ color: (theme) => theme.palette.success.main }}
        />
        <Box>
          <Typography variant="body2" color="text.secondary">
            Profit Margin
          </Typography>
          <Typography variant="h6" fontWeight={600} color="success.main">
            ₱{amount.toFixed(2)} per unit
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {percentage.toFixed(1)}% markup
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};
