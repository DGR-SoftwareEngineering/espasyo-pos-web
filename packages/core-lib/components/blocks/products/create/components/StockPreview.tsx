import React from "react";
import { Box, Typography, Stack, Chip, alpha } from "@mui/material";
import { StockPreviewProps } from "../types";
import { getStockStatus } from "../utils";

export const StockPreview: React.FC<StockPreviewProps> = ({
  reorderLevel,
  minimumStock,
}) => {
  const exampleStock = reorderLevel + 5;
  const { isNormal, isLow, isCritical } = getStockStatus(
    exampleStock,
    reorderLevel,
    minimumStock,
  );

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: (theme) => alpha(theme.palette.info.main, 0.03),
        border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
      }}
    >
      <Typography variant="body2" color="text.secondary" gutterBottom>
        <strong>Stock Status Preview:</strong>
      </Typography>
      <Stack
        direction="row"
        spacing={2}
        sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}
      >
        <Chip
          label={`Normal: > ${reorderLevel}`}
          size="small"
          sx={{
            bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
            color: (theme) => theme.palette.success.main,
          }}
        />
        <Chip
          label={`Low: ${minimumStock + 1} - ${reorderLevel}`}
          size="small"
          sx={{
            bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
            color: (theme) => theme.palette.warning.main,
          }}
        />
        <Chip
          label={`Critical: ≤ ${minimumStock}`}
          size="small"
          sx={{
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
            color: (theme) => theme.palette.error.main,
          }}
        />
      </Stack>
    </Box>
  );
};
