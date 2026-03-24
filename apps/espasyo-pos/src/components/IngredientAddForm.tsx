import React from "react";
import {
  Grid,
  Paper,
  Button,
  Box,
  Tooltip,
  InputAdornment,
  Typography,
  alpha,
} from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";
import { TextField, SelectField, SelectOption } from "core-lib";
import { UseFormReturn } from "react-hook-form";
import { NewIngredient } from "./contents/recipe/forms/types";

interface IngredientAddFormProps {
  form: UseFormReturn<NewIngredient>;
  ingredientOptions: SelectOption[];
  unitOptions: SelectOption[];
  onAdd: () => void;
  onCancel: () => void;
}

export const IngredientAddForm: React.FC<IngredientAddFormProps> = ({
  form,
  ingredientOptions,
  unitOptions,
  onAdd,
  onCancel,
}) => {
  const isValid = form.watch("ingredientProductID") && form.watch("unitID");

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        mb: 4,
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
        borderRadius: 2,
      }}
    >
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        New Ingredient
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <SelectField
            name="ingredientProductID"
            control={form.control}
            options={ingredientOptions}
            label="Ingredient"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            name="quantityRequired"
            control={form.control}
            label="Quantity"
            type="number"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <SelectField
            name="unitID"
            control={form.control}
            options={unitOptions}
            label="Unit"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            name="displayOrder"
            control={form.control}
            label="Display Order"
            type="number"
            endAdornment={
              <InputAdornment position="end">
                <Tooltip
                  title="Controls the sequence of ingredients (1 = first, 2 = second, etc.). Lower numbers appear first."
                  arrow
                  placement="top"
                >
                  <InfoOutlined
                    sx={{
                      fontSize: 18,
                      color: (theme) => theme.palette.info.main,
                      cursor: "help",
                    }}
                  />
                </Tooltip>
              </InputAdornment>
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              onClick={onAdd}
              disabled={!isValid}
              sx={{ flex: 2, height: "56px", borderRadius: 2 }}
            >
              Add
            </Button>
            <Button
              variant="outlined"
              onClick={onCancel}
              sx={{ flex: 1, height: "56px", borderRadius: 2 }}
            >
              Cancel
            </Button>
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            name="notes"
            control={form.control}
            label="Notes (Optional)"
            placeholder="e.g., finely chopped, room temperature"
            multiline
            rows={2}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};
