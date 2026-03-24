import React from "react";
import { Box, Typography, Stack } from "@mui/material";

interface Props {
  label: string;
  value: React.ReactNode;
  caption?: string;
  direction?: "row" | "column";
}

export const InfoRow: React.FC<Props> = ({
  label,
  value,
  caption,
  direction = "column",
}) => {
  if (direction === "row") {
    return (
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {value}
          </Typography>
          {caption && (
            <Typography variant="caption" color="text.secondary">
              {caption}
            </Typography>
          )}
        </Box>
      </Stack>
    );
  }

  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        {value}
      </Typography>
      {caption && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {caption}
        </Typography>
      )}
    </Box>
  );
};
