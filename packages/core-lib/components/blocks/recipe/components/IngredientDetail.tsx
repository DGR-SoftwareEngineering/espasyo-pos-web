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
import { RecipeItemResponse } from "../../../../api/commons/types";
import {
  InventoryOutlined,
  NotesOutlined,
  ScaleOutlined,
} from "@mui/icons-material";
import { IDChip } from "../../../IDChip";
import { MetricDisplay } from "../../../metric/MetricDisplay";
import { formatCurrency } from "../../../../business/strings";

export const IngredientDetail: React.FC<{ ingredient: RecipeItemResponse }> = ({
  ingredient,
}) => {
  const theme = useTheme();

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
              <Typography variant="subtitle2" fontWeight={600}>
                {ingredient.ingredientName}
              </Typography>
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
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 2 }}>
          <Tooltip
            title={`${ingredient.quantityRequired} × ${formatCurrency(ingredient.ingredientCost)}`}
            arrow
          >
            <div>
              <MetricDisplay
                label="Cost"
                value={formatCurrency(ingredient.cost)}
                valueColor="success.main"
                tooltip
              />
            </div>
          </Tooltip>
        </Grid>

        <Grid size={{ xs: 6, sm: 2 }}>
          <MetricDisplay
            label="Unit Cost"
            value={`${formatCurrency(ingredient.ingredientCost)}/${ingredient.unitName}`}
            valueColor="text.secondary"
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
    </Paper>
  );
};
