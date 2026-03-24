import React from "react";
import {
  Grid,
  Stack,
  Avatar,
  Box,
  Typography,
  Tooltip,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import {
  InventoryOutlined,
  ScaleOutlined,
  NotesOutlined,
} from "@mui/icons-material";
import { ProductionStatus, RecipeItemResponse } from "../../api/commons/types";
import { Card } from "../Card";
import { StatusChip } from "../StatusChip";

interface ConstraintInfo {
  status: ProductionStatus;
  isBottleneck?: boolean;
}

interface Props {
  ingredient: RecipeItemResponse;
  constraint?: ConstraintInfo;
}

const formatCurrency = (amount: number | undefined | null): string => {
  if (!amount || isNaN(amount)) return "₱0.00";
  return `₱${amount.toFixed(2)}`;
};

export const RecipeIngredientRow: React.FC<Props> = ({
  ingredient,
  constraint,
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      hoverEffect={false}
      sx={{
        bgcolor: alpha(theme.palette.background.default, 0.5),
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
        transition: "all 0.2s",
        "&:hover": {
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          borderColor: alpha(theme.palette.primary.main, 0.2),
        },
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main,
              }}
            >
              <InventoryOutlined />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                {ingredient.ingredientName}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: "monospace" }}
              >
                ID: {ingredient.ingredientProductID?.substring(0, 8) || "N/A"}
                ...
              </Typography>
            </Box>
          </Stack>
        </Grid>

        <Grid size={{ xs: 6, sm: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Quantity
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <ScaleOutlined
              sx={{ fontSize: 14, color: theme.palette.text.secondary }}
            />
            <Typography variant="body2" fontWeight={600}>
              {ingredient.quantityRequired} {ingredient.unitName}
            </Typography>
          </Stack>
        </Grid>

        <Grid size={{ xs: 6, sm: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Cost
          </Typography>
          <Typography variant="body2" fontWeight={700} color="success.main">
            {formatCurrency(ingredient.cost)}
          </Typography>
        </Grid>

        <Grid size={{ xs: 6, sm: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Unit Cost
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatCurrency(ingredient.ingredientCost)}/{ingredient.unitName}
          </Typography>
        </Grid>

        <Grid size={{ xs: 6, sm: 2 }}>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {constraint && <StatusChip status={constraint.status} />}
            {ingredient.notes && !constraint && (
              <Tooltip title={ingredient.notes} arrow>
                <Chip
                  icon={<NotesOutlined />}
                  label="Notes"
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    color: theme.palette.warning.main,
                    cursor: "help",
                    height: 24,
                  }}
                />
              </Tooltip>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
};
