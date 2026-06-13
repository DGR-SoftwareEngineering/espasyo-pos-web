import * as yup from "yup";

export const editIngredientSchema = yup.object({
  name: yup.string().trim().required("Name is required"),
  categoryID: yup.string().required("Category is required"),
  packagePrice: yup.number().typeError("Must be a number").min(0, "Must be ≥ 0").required("Package price is required"),
  qtyPerPack: yup.number().typeError("Must be a number").min(0.01, "Must be > 0").required("Qty per pack is required"),
  unitName: yup.string().trim().required("Unit name is required"),
});
export type EditIngredientFormValues = yup.InferType<typeof editIngredientSchema>;

export const editRecipeSchema = yup.object({
  menuItemName: yup.string().trim().required("Menu item name is required"),
  categoryID: yup.string().required("Category is required"),
  sellingPrice: yup.number().typeError("Must be a number").min(0, "Must be ≥ 0").required("Selling price is required"),
});
export type EditRecipeFormValues = yup.InferType<typeof editRecipeSchema>;

export const editRecipeItemSchema = yup.object({
  quantityRequired: yup.number().typeError("Must be a number").min(0.01, "Must be > 0").required("Quantity is required"),
  unitName: yup.string().trim().required("Unit name is required"),
});
export type EditRecipeItemFormValues = yup.InferType<typeof editRecipeItemSchema>;

// ── Combined import edit schemas (new inline-ingredient model) ─────────────────

export const importRecipeItemEditSchema = yup.object({
  ingredientName: yup.string().trim().required("Ingredient name is required"),
  quantityRequired: yup
    .number()
    .typeError("Must be a number")
    .min(0.001, "Must be > 0")
    .required("Quantity is required"),
  unitName: yup.string().trim().required("Unit name is required"),
  ingredientExistsInDb: yup.boolean().required(),
  ingredientCategoryID: yup.string().when("ingredientExistsInDb", {
    is: false,
    then: (s) => s.required("Ingredient category is required"),
    otherwise: (s) => s.optional(),
  }),
  packagePrice: yup.number().when("ingredientExistsInDb", {
    is: false,
    then: (s) =>
      s
        .typeError("Must be a number")
        .min(0, "Must be ≥ 0")
        .required("Package price is required"),
    otherwise: (s) => s.optional(),
  }),
  qtyPerPack: yup.number().when("ingredientExistsInDb", {
    is: false,
    then: (s) =>
      s
        .typeError("Must be a number")
        .min(0.001, "Must be > 0")
        .required("Qty per pack is required"),
    otherwise: (s) => s.optional(),
  }),
});

export const importRecipeEditSchema = yup.object({
  menuItemName: yup.string().trim().required("Name is required"),
  sellingPrice: yup
    .number()
    .typeError("Must be a number")
    .min(0, "Must be ≥ 0")
    .required("Selling price is required"),
  categoryID: yup.string().required("Menu item category is required"),
  items: yup
    .array()
    .of(importRecipeItemEditSchema)
    .min(1, "At least one ingredient required")
    .required(),
});

export type ImportRecipeEditFormValues = yup.InferType<typeof importRecipeEditSchema>;
export type ImportRecipeItemEditFormValues = yup.InferType<typeof importRecipeItemEditSchema>;
