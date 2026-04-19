import React from "react";
import {
  Box,
  Chip,
  Divider,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  CheckCircleOutline,
  NotesOutlined,
  SwapHorizOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import { formatNumber } from "core-lib/business";
import { UnitConversionResponse } from "core-lib/api/commons/types";


export const UnitConversionViewDialog: React.FC<{
  conversion: UnitConversionResponse;
  }> = ({ conversion }) => {
  const theme = useTheme();

  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
            }}
          >
            <SwapHorizOutlined />
          </Box>

          <Box flex={1}>
            <Typography variant="h6" fontWeight={700}>
              {conversion.fromUnitName} → {conversion.toUnitName}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip
                label={conversion.isApproximate ? "Approximate" : "Exact"}
                size="small"
                icon={
                  conversion.isApproximate ? (
                    <WarningAmberOutlined />
                  ) : (
                    <CheckCircleOutline />
                  )
                }
                color={conversion.isApproximate ? "warning" : "success"}
                variant="outlined"
              />
              <Chip
                label={conversion.isActive ? "Active" : "Inactive"}
                size="small"
                color={conversion.isActive ? "success" : "default"}
                variant="outlined"
              />
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          Conversion Rate
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          1 {conversion.fromUnitName} = {formatNumber(conversion.conversionRate, 4)}{" "}
          {conversion.toUnitName}
        </Typography>
      </Box>

      <Divider />

      <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Unit Conversion ID
          </Typography>
          <Typography variant="body2">{conversion.unitConversionID}</Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            From Unit ID
          </Typography>
          <Typography variant="body2">{conversion.fromUnitID}</Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            To Unit ID
          </Typography>
          <Typography variant="body2">{conversion.toUnitID}</Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.warning.main, 0.05),
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <NotesOutlined
            sx={{ mt: 0.2, color: theme.palette.warning.main, fontSize: 20 }}
          />
          <Box>
            <Typography variant="subtitle2">Notes</Typography>
            <Typography variant="body2">
              {conversion.notes?.trim() || "No notes provided."}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
};