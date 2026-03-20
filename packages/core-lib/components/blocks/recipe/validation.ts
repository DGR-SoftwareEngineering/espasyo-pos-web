import * as yup from "yup";

const recipeItemSchema = yup.object({
  recipeItemID: yup
    .string()
    .optional()
    .nullable()
    .test(
      "is-valid-uuid",
      "Invalid recipe item ID format",
      (value) =>
        !value ||
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          value,
        ),
    ),
  ingredientProductID: yup
    .string()
    .required("Ingredient is required")
    .test(
      "is-valid-uuid",
      "Invalid ingredient ID format",
      (value) =>
        value === null ||
        value === undefined ||
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          value,
        ),
    ),
  quantityRequired: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required("Quantity is required")
    .typeError("Quantity must be a number")
    .positive("Quantity must be greater than 0")
    .max(999999, "Quantity cannot exceed 999,999")
    .test(
      "three-decimals",
      "Quantity can only have up to 3 decimal places",
      (value) =>
        value === undefined || /^\d+(\.\d{1,3})?$/.test(value.toString()),
    ),
  unitID: yup
    .string()
    .required("Unit of measure is required")
    .test(
      "is-valid-uuid",
      "Invalid unit ID format",
      (value) =>
        value === null ||
        value === undefined ||
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          value,
        ),
    ),
  displayOrder: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required("Display order is required")
    .typeError("Display order must be a number")
    .integer("Display order must be a whole number")
    .min(0, "Display order cannot be negative")
    .max(9999, "Display order cannot exceed 9,999")
    .default(1),
  notes: yup
    .string()
    .optional()
    .nullable()
    .max(500, "Notes cannot exceed 500 characters"),
});

export const recipeFormSchema = yup.object({
  menuItemProductID: yup
    .string()
    .required("Menu item is required")
    .test(
      "is-valid-uuid",
      "Invalid menu item ID format",
      (value) =>
        value === null ||
        value === undefined ||
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          value,
        ),
    )
    .default(""),

  recipeItems: yup
    .array()
    .of(recipeItemSchema)
    .required("At least one ingredient is required")
    .min(1, "At least one ingredient is required")
    .test(
      "unique-ingredients",
      "Cannot add the same ingredient multiple times",
      (items) => {
        if (!items) return true;
        const ingredientIds = items.map((item) => item.ingredientProductID);
        return new Set(ingredientIds).size === ingredientIds.length;
      },
    )
    .default([]),
  notes: yup
    .string()
    .optional()
    .nullable()
    .max(500, "Notes cannot exceed 500 characters")
    .default(null),
});

export type RecipeForm = yup.InferType<typeof recipeFormSchema>;
