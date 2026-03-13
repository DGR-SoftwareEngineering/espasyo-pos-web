import React from "react";
import {
  FormControl,
  FormLabel,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import { RestaurantMenuOutlined, KitchenOutlined } from "@mui/icons-material";
import { Control, Controller } from "react-hook-form";
import { ProductForm as ProductFormType } from "../validation";

interface ProductTypeToggleProps {
  control: Control<ProductFormType>;
}

//TODO: can be a reusable component.
export const ProductTypeToggle: React.FC<ProductTypeToggleProps> = ({
  control,
}) => {
  const theme = useTheme();

  return (
    <Controller
      name="isMenuItem"
      control={control}
      render={({ field }) => (
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend" sx={{ mb: 1, fontWeight: 500 }}>
            Product Type
          </FormLabel>
          <ToggleButtonGroup
            value={field.value}
            exclusive
            onChange={(_, value) => value !== null && field.onChange(value)}
            aria-label="product type"
            sx={{
              width: "100%",
              gap: 2,
              "& .MuiToggleButton-root": {
                flex: 1,
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: 2,
                py: 1.5,
                "&.Mui-selected": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  },
                },
              },
            }}
          >
            <ToggleButton value={true}>
              <Stack direction="row" spacing={1} alignItems="center">
                <RestaurantMenuOutlined />
                <Stack alignItems="flex-start">
                  <Typography variant="body2" fontWeight={600}>
                    Menu Item
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Can be sold to customers
                  </Typography>
                </Stack>
              </Stack>
            </ToggleButton>
            <ToggleButton value={false}>
              <Stack direction="row" spacing={1} alignItems="center">
                <KitchenOutlined />
                <Stack alignItems="flex-start">
                  <Typography variant="body2" fontWeight={600}>
                    Ingredient
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Raw material for recipes
                  </Typography>
                </Stack>
              </Stack>
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
      )}
    />
  );
};
