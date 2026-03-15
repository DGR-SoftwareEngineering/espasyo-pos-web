import React from "react";
import { Box, Stack, Typography, alpha } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";

const INGREDIENT_TIPS = [
  "Each ingredient can only be added once per recipe",
  "Display order determines the sequence of ingredients",
  "Use decimal quantities for precise measurements (e.g., 0.250 kg)",
  "Leave gaps (e.g., 10, 20, 30) to easily insert ingredients between existing ones",
];

export const InfoBox: React.FC = () => {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: (theme) => alpha(theme.palette.info.main, 0.03),
        border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <InfoOutlined sx={{ color: (theme) => theme.palette.info.main }} />
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          Understanding Display Order
        </Typography>
      </Stack>
      {INGREDIENT_TIPS.map((tip, index) => (
        <Typography
          key={index}
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mt: index === 0 ? 0 : 0.5 }}
        >
          • {tip}
        </Typography>
      ))}
    </Box>
  );
};
