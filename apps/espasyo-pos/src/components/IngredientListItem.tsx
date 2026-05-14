import React from "react";
import { Badge, Box, Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { DeleteOutline, InfoOutlined } from "@mui/icons-material";
import { FieldArrayWithId } from "react-hook-form";
import { RecipeForm } from "./contents/recipe/forms/validation";
import { ProductDataList, UnitDto } from "core-lib/api/commons/types";

interface IngredientListItemProps {
  field: FieldArrayWithId<RecipeForm, "recipeItems", "id">;
  index: number;
  ingredients: ProductDataList[];
  units: UnitDto[];
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
    const unit = units.find((u) => u.unitID === id);
    return unit?.name || "Unknown";
  };

  const quantity =
    typeof field.quantityRequired === "number"
      ? field.quantityRequired
      : Number(field.quantityRequired) || 0;

  return (
    <Box
      p="3"
      style={{
        background: "var(--color-panel-solid)",
        border: "1px solid var(--accent-a5)",
        borderRadius: "var(--radius-3)",
      }}
    >
      <Box
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 2.5fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 1.5fr) auto",
          gap: "var(--space-3)",
          alignItems: "center",
        }}
      >
        <Box>
          <Text size="1" color="gray" as="div">
            Ingredient
          </Text>
          <Text size="2" weight="medium" as="div">
            {getIngredientName(field.ingredientProductID)}
          </Text>
        </Box>

        <Box>
          <Text size="1" color="gray" as="div">
            Quantity
          </Text>
          <Badge color="blue" variant="soft" radius="medium" mt="1">
            {quantity.toFixed(3)}
          </Badge>
        </Box>

        <Box>
          <Text size="1" color="gray" as="div">
            Unit
          </Text>
          <Text size="2" as="div">
            {getUnitName(field.unitID)}
          </Text>
        </Box>

        <Box>
          <Flex align="center" gap="1">
            <Text size="1" color="gray">
              Order:
            </Text>
            <Badge color="indigo" variant="soft" radius="medium">
              {field.displayOrder}
            </Badge>
            <Tooltip content="Display order determines where this ingredient appears">
              <InfoOutlined
                style={{
                  fontSize: 14,
                  color: "var(--blue-11)",
                  cursor: "help",
                }}
              />
            </Tooltip>
          </Flex>
        </Box>

        <Box style={{ minWidth: 0 }}>
          <Text size="1" color="gray" as="div">
            Notes
          </Text>
          <Text
            size="1"
            color="gray"
            as="div"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {field.notes || "—"}
          </Text>
        </Box>

        <IconButton
          color="red"
          variant="soft"
          size="2"
          onClick={() => onRemove(index)}
          aria-label="Remove ingredient"
        >
          <DeleteOutline style={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
};
