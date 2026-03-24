import React from "react";
import {
  Grid,
  Paper,
  Typography,
  Chip,
  IconButton,
  Box,
  Tooltip,
  alpha,
} from "@mui/material";
import { DeleteOutline, InfoOutlined } from "@mui/icons-material";
import { FieldArrayWithId } from "react-hook-form";
import { RecipeForm } from "./contents/recipe/forms/validation";
import { ProductDataList, CategoryDataList } from "core-lib/api/commons/types";

interface IngredientListItemProps {
  field: FieldArrayWithId<RecipeForm, "recipeItems", "id">;
  index: number;
  ingredients: ProductDataList[];
  units: CategoryDataList[];
  onRemove: (index: number) => void;
}

export const IngredientListItem: React.FC<IngredientListItemProps> = ({
  field,
  index,
  ingredients,
  units,
  onRemove,
}) => {
  const getIngredientName = (id: string): string => {
    const ingredient = ingredients.find((i) => i.productID === id);
    return ingredient?.name || "Unknown";
  };

  const getUnitName = (id: string): string => {
    const unit = units.find((u) => u.categoryID === id);
    return unit?.name || "Unknown";
  };

  const quantity =
    typeof field.quantityRequired === "number"
      ? field.quantityRequired
      : Number(field.quantityRequired) || 0;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
        "&:hover": {
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
        },
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 3 }}>
          <Typography variant="caption" color="text.secondary">
            Ingredient
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {getIngredientName(field.ingredientProductID)}
          </Typography>
        </Grid>

        <Grid size={{ xs: 6, md: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Quantity
          </Typography>
          <Chip
            label={quantity.toFixed(3)}
            size="small"
            sx={{
              mt: 0.5,
              bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
              color: (theme) => theme.palette.info.main,
              fontWeight: 500,
              borderRadius: 1.5,
            }}
          />
        </Grid>

        <Grid size={{ xs: 6, md: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Unit
          </Typography>
          <Typography variant="body2">{getUnitName(field.unitID)}</Typography>
        </Grid>

        <Grid size={{ xs: 4, md: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Order:
            </Typography>
            <Chip
              label={field.displayOrder}
              size="small"
              sx={{
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: (theme) => theme.palette.primary.main,
                fontWeight: 500,
                borderRadius: 1.5,
              }}
            />
            <Tooltip
              title="Display order determines where this ingredient appears"
              arrow
              placement="top"
            >
              <InfoOutlined
                sx={{
                  fontSize: 14,
                  color: (theme) => theme.palette.info.main,
                  cursor: "help",
                  ml: 0.5,
                }}
              />
            </Tooltip>
          </Box>
        </Grid>

        <Grid size={{ xs: 6, md: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Notes
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            noWrap
          >
            {field.notes || "—"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 2, md: 1 }}>
          <IconButton
            size="small"
            onClick={() => onRemove(index)}
            sx={{
              color: (theme) => theme.palette.error.main,
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
              "&:hover": {
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.2),
              },
            }}
          >
            <DeleteOutline />
          </IconButton>
        </Grid>
      </Grid>
    </Paper>
  );
};
