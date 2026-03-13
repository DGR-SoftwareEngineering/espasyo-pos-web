import { SelectOption } from "../../../form";

export const FIELD_HELPERS = {
  unitPrice: "Selling price per unit (required)",
  costPrice: "Your purchase cost per unit (for profit tracking)",
  reorderLevel: "When stock reaches this level, it's time to reorder",
  minimumStock: "Critical level - immediate action required when reached",
} as const;

export const PLACEHOLDERS = {
  productName: "e.g., Arabica Coffee Beans, White Sugar, Fresh Milk",
  description: "Provide a detailed description of the product...",
  price: "0.00",
  reorderLevel: "e.g., 20",
  minimumStock: "e.g., 5",
} as const;

export const SUBMISSION_KEYS = {
  create: "create-product-submission",
  edit: "edit-product-submission",
} as const;

export const PRODUCT_TYPE = {
  MENU_ITEM: true,
  INGREDIENT: false,
} as const;

export const PRODUCT_TYPE_LABELS = {
  [String(PRODUCT_TYPE.MENU_ITEM)]: "Menu Item (Can be sold)",
  [String(PRODUCT_TYPE.INGREDIENT)]: "Ingredient (Raw material)",
} as const;

export const PRODUCT_TYPE_HELPERS = {
  menuItem: "This product appears on the menu and can be sold to customers",
  ingredient: "This is a raw material used in recipes (not sold directly)",
} as const;
