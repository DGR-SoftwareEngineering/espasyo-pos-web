import React from "react";
import {
  Grid,
  Stack,
  Avatar,
  Box,
  Typography,
  Tooltip,
  Chip,
  LinearProgress,
  alpha,
  useTheme,
} from "@mui/material";
import { InventoryOutlined } from "@mui/icons-material";
import { Card } from "../Card";
import { StatusChip } from "../StatusChip";
import { ProductionStatus } from "../../api/commons/types";

interface Constraint {
  ingredientName: string;
  unitName: string;
  requiredPerUnit: number;
  availableQuantity: number;
  maxUnitsFromThisIngredient: number;
  status: ProductionStatus;
  isBottleneck: boolean;
}

interface Props {
  constraint: Constraint;
}

export const ConstraintRow: React.FC<Props> = ({ constraint }) => {
  const theme = useTheme();
  const statusConfig = (() => {
    const colorMap: Record<string, string> = {
      InStock: theme.palette.success.main,
      LowStock: theme.palette.warning.main,
      OutOfStock: theme.palette.error.main,
    };
    return {
      color: colorMap[constraint.status] || theme.palette.text.secondary,
    };
  })();

  const stockPercentage = Math.min(
    (constraint.availableQuantity / constraint.requiredPerUnit) * 100,
    100,
  );

  return (
    <Card
      elevation={0}
      hoverEffect={false}
      sx={{
        bgcolor: alpha(statusConfig.color, 0.02),
        border: `1px solid ${alpha(statusConfig.color, 0.15)}`,
        borderRadius: 2,
        transition: "all 0.2s",
        "&:hover": {
          bgcolor: alpha(statusConfig.color, 0.04),
          borderColor: alpha(statusConfig.color, 0.3),
        },
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: alpha(statusConfig.color, 0.1),
                color: statusConfig.color,
              }}
            >
              <InventoryOutlined />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                {constraint.ingredientName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Required: {constraint.requiredPerUnit} {constraint.unitName}
                /unit
              </Typography>
            </Box>
          </Stack>
        </Grid>

        <Grid size={{ xs: 6, sm: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Available
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {constraint.availableQuantity} {constraint.unitName}
          </Typography>
        </Grid>

        <Grid size={{ xs: 6, sm: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Max Units
          </Typography>
          <Typography
            variant="body2"
            fontWeight={700}
            color={statusConfig.color}
          >
            {constraint.maxUnitsFromThisIngredient}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <Box sx={{ width: "100%" }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 0.5 }}
            >
              <Typography variant="caption" color="text.secondary">
                Stock Level
              </Typography>
              <Typography
                variant="caption"
                fontWeight={600}
                color={statusConfig.color}
              >
                {stockPercentage.toFixed(0)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={stockPercentage}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(statusConfig.color, 0.1),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 3,
                  bgcolor: statusConfig.color,
                },
              }}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 2 }}>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {constraint.isBottleneck && (
              <Tooltip title="This ingredient is limiting production" arrow>
                <Chip
                  label="Bottleneck"
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                    height: 24,
                  }}
                />
              </Tooltip>
            )}
            <StatusChip status={constraint.status} />
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
};
