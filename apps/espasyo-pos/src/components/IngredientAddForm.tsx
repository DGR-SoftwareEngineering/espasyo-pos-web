import React from "react";
import {
  Box,
  Flex,
  Heading,
} from "core-lib/components/radix/proxies";
import {
  Tooltip,
} from "@radix-ui/themes";;
import { InfoOutlined } from "@mui/icons-material";
import { TextField } from "core-lib/components/radix/form/TextField";
import {
  SelectField,
  SelectOption,
} from "core-lib/components/radix/form/SelectField";
import { Button } from "core-lib/components/radix/buttons/Button";
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
  const isValid = !!form.watch("ingredientProductID") && !!form.watch("unitID");

  return (
    <Box
      p="4"
      mb="3"
      style={{
        background: "var(--accent-a2)",
        border: "1px solid var(--accent-a5)",
        borderRadius: "var(--radius-3)",
      }}
    >
      <Heading size="3" weight="bold" mb="3">
        New Ingredient
      </Heading>

      <Flex direction="column" gap="3">
        <Box
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 2.2fr) minmax(0, 1fr) minmax(0, 1.4fr) minmax(0, 1.2fr)",
            gap: "var(--space-3)",
          }}
        >
          <SelectField
            name="ingredientProductID"
            control={form.control}
            options={ingredientOptions}
            label="Ingredient"
          />

          <TextField
            name="quantityRequired"
            control={form.control}
            label="Quantity"
            type="number"
          />

          <SelectField
            name="unitID"
            control={form.control}
            options={unitOptions}
            label="Unit"
          />

          <TextField
            name="displayOrder"
            control={form.control}
            label="Display Order"
            type="number"
            endAdornment={
              <Tooltip content="Controls the sequence of ingredients (1 = first, 2 = second, etc.). Lower numbers appear first.">
                <InfoOutlined
                  style={{
                    fontSize: 18,
                    color: "var(--blue-11)",
                    cursor: "help",
                  }}
                />
              </Tooltip>
            }
          />
        </Box>

        <TextField
          name="notes"
          control={form.control}
          label="Notes (Optional)"
          placeholder="e.g., finely chopped, room temperature"
          multiline
          rows={2}
        />

        <Flex gap="2" justify="end">
          <Button type="Secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="Primary" onClick={onAdd} disabled={!isValid}>
            Add Ingredient
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};
