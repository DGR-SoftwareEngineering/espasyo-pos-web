import { RecipeResponse } from "../../../api/commons/types";

export const SUBMISSION_KEYS = {
  create: "create-recipe-submission",
  edit: "edit-recipe-submission",
} as const;

export const PLACEHOLDERS = {
  menuItem: "Select a menu item...",
  ingredient: "Select ingredient...",
  quantity: "e.g., 0.250",
  unit: "Select unit...",
  displayOrder: "Display order",
  notes: "Add any special instructions...",
} as const;

export const TABLE_HEADERS = [
  {
    id: "menuItemName",
    label: "Recipe Details",
    width: "35%",
    sortable: true,
    align: "left" as const,
  },
  {
    id: "ingredientCount",
    label: "Ingredients",
    align: "center" as const,
    width: "15%",
    sortable: true,
  },
  {
    id: "totalCost",
    label: "Total Cost",
    align: "center" as const,
    width: "20%",
    sortable: true,
  },
  {
    id: "actions",
    label: "Actions",
    align: "right" as const,
    width: "30%",
    sortable: false,
  },
];

export const DIALOG_TITLES = {
  view: "View Recipe",
  create: "Create New Recipe",
  edit: "Edit Recipe",
  delete: "Delete Recipe",
} as const;

export const DIALOG_TYPES = {
  view: "RecipeView",
  edit: "RecipeEdit",
  delete: "RecipeDelete",
} as const;

export interface RecipeFilterState {
  searchQuery: string;
  sortBy: string;
}

export function applyRecipeSorting(
  filtered: RecipeResponse[],
  filters: RecipeFilterState,
) {
  filtered.sort((a, b) => {
    const costA = a.recipeItems.reduce((sum, item) => sum + item.cost, 0);
    const costB = b.recipeItems.reduce((sum, item) => sum + item.cost, 0);
    const ingredientCountA = a.recipeItems.length;
    const ingredientCountB = b.recipeItems.length;
    switch (filters.sortBy) {
      case "name":
        return a.menuItemName.localeCompare(b.menuItemName);
      case "ingredients":
        return ingredientCountB - ingredientCountA;
      case "cost":
        return costB - costA;
      case "costLow":
        return costA - costB;
      case "newest":
        return b.recipeID.localeCompare(a.recipeID);
      case "oldest":
        return a.recipeID.localeCompare(b.recipeID);
      default:
        return 0;
    }
  });
  return filtered;
}
