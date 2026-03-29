import {
  alpha,
  Avatar,
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { RecipeItemResponse } from "core-lib/api/commons/types";
import {
  InventoryOutlined,
  NotesOutlined,
  ScaleOutlined,
  SwapHorizOutlined,
  AttachMoneyOutlined,
} from "@mui/icons-material";
import { IDChip, MetricDisplay } from "core-lib";
import { formatCurrency } from "core-lib/business/strings";

export const IngredientDetail: React.FC<{ ingredient: RecipeItemResponse }> = ({
  ingredient,
}) => {
  const theme = useTheme();
  const hasUnitConversion =
    ingredient.purchaseUnitName &&
    ingredient.stockUnitName &&
    ingredient.purchaseUnitName !== ingredient.stockUnitName;

  const hasBatchPurchase =
    ingredient.ingredientCost !== ingredient.calculatedCost;
  const displayCost = ingredient.calculatedCost || ingredient.cost;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        bgcolor: alpha(theme.palette.background.default, 0.5),
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: "all 0.2s",
        "&:hover": {
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          borderColor: alpha(theme.palette.primary.main, 0.2),
        },
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 4 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
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
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  {ingredient.ingredientName}
                </Typography>
                {hasUnitConversion && (
                  <Chip
                    icon={<SwapHorizOutlined sx={{ fontSize: 14 }} />}
                    label={`${ingredient.purchaseUnitName} → ${ingredient.stockUnitName}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.625rem",
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                    }}
                  />
                )}
              </Stack>
              <IDChip id={ingredient.ingredientProductID} label="ID" />
            </Box>
          </Stack>
        </Grid>

        <Grid size={{ xs: 6, sm: 2 }}>
          <MetricDisplay
            label="Quantity"
            value={`${ingredient.quantityRequired} ${ingredient.unitName}`}
            icon={<ScaleOutlined />}
            iconColor={theme.palette.primary.main}
            tooltip={`Recipe requires ${ingredient.quantityRequired} ${ingredient.unitName}`}
          />
          {hasUnitConversion &&
            ingredient.quantityRequired &&
            ingredient.costPerStockUnit && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                ≈ {formatCurrency(ingredient.costPerStockUnit)} per{" "}
                {ingredient.stockUnitName}
              </Typography>
            )}
        </Grid>

        <Grid size={{ xs: 6, sm: 2 }}>
          <Tooltip
            title={
              <Box>
                <Typography variant="caption" display="block">
                  <strong>Calculated Cost:</strong>{" "}
                  {formatCurrency(displayCost)}
                </Typography>
                {hasBatchPurchase && (
                  <Typography variant="caption" display="block">
                    <strong>Original Cost:</strong>{" "}
                    {formatCurrency(ingredient.ingredientCost)} total
                  </Typography>
                )}
                {ingredient.purchaseQuantity && ingredient.purchaseUnitName && (
                  <Typography variant="caption" display="block">
                    <strong>Purchase:</strong> {ingredient.purchaseQuantity}{" "}
                    {ingredient.purchaseUnitName} @{" "}
                    {formatCurrency(ingredient.ingredientCost)} total
                  </Typography>
                )}
                {ingredient.costPerStockUnit && (
                  <Typography variant="caption" display="block">
                    <strong>Cost per {ingredient.stockUnitName}:</strong>{" "}
                    {formatCurrency(ingredient.costPerStockUnit)}
                  </Typography>
                )}
              </Box>
            }
            arrow
          >
            <div>
              <MetricDisplay
                label="Cost"
                value={formatCurrency(displayCost)}
                valueColor="success.main"
                icon={<AttachMoneyOutlined />}
                tooltip
              />
            </div>
          </Tooltip>
          {hasBatchPurchase && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: "block" }}
            >
              <em>Calculated from batch purchase</em>
            </Typography>
          )}
        </Grid>

        <Grid size={{ xs: 6, sm: 2 }}>
          <MetricDisplay
            label="Unit Cost"
            value={`${formatCurrency(displayCost / ingredient.quantityRequired)}/${ingredient.unitName}`}
            valueColor="text.secondary"
            tooltip={`Cost per ${ingredient.unitName}`}
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 2 }}>
          {ingredient.notes ? (
            <Tooltip title={ingredient.notes} arrow placement="top">
              <Chip
                icon={<NotesOutlined />}
                label="Has notes"
                size="small"
                sx={{
                  height: 24,
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  color: theme.palette.warning.main,
                  cursor: "help",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.warning.main, 0.2),
                  },
                }}
              />
            </Tooltip>
          ) : (
            <Typography variant="caption" color="text.disabled">
              No notes
            </Typography>
          )}
        </Grid>
      </Grid>

      {(ingredient.purchaseQuantity || hasUnitConversion) && (
        <Box
          sx={{
            mt: 1.5,
            pt: 1.5,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
          >
            {ingredient.purchaseQuantity && ingredient.purchaseUnitName && (
              <Typography variant="caption" color="text.secondary">
                📦 Purchased: {ingredient.purchaseQuantity}{" "}
                {ingredient.purchaseUnitName} at{" "}
                {formatCurrency(ingredient.ingredientCost)} total
              </Typography>
            )}
            {ingredient.costPerStockUnit && ingredient.stockUnitName && (
              <Typography variant="caption" color="text.secondary">
                💰 Cost per {ingredient.stockUnitName}:{" "}
                {formatCurrency(ingredient.costPerStockUnit)}
              </Typography>
            )}
            {hasUnitConversion && (
              <Typography variant="caption" color="text.secondary">
                🔄 Unit conversion applied: {ingredient.purchaseUnitName} →{" "}
                {ingredient.stockUnitName}
              </Typography>
            )}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};
