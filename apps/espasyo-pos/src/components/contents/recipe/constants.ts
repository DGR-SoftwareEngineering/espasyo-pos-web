import { RecipeResponse } from "core-lib/api/commons/types";
import { FeatureConfigBuilder } from "core-lib/core/types/constants/feature-config.builder";
import { commonSortStrategies } from "core-lib/core/types/constants/base.constants";

export const PLACEHOLDERS = {
  menuItem: "Select a menu item...",
  ingredient: "Select ingredient...",
  quantity: "e.g., 0.250",
  unit: "Select unit...",
  displayOrder: "Display order",
  notes: "Add any special instructions...",
} as const;

const config = new FeatureConfigBuilder<RecipeResponse>("Recipe")
  .setTableHeaders([
    {
      id: "menuItemName",
      name: "Recipe Details",
      width: "35%",
      sortable: true,
      align: "left",
    },
    {
      id: "ingredientCount",
      name: "Ingredients",
      align: "center",
      width: "15%",
      sortable: true,
    },
    {
      id: "totalCost",
      name: "Total Cost",
      align: "center",
      width: "20%",
      sortable: true,
    },
    {
      id: "actions",
      name: "Actions",
      align: "right",
      width: "30%",
      sortable: false,
    },
  ])
  .setSortOptions([
    { value: "name", label: "Recipe Name" },
    { value: "ingredients", label: "Most Ingredients" },
    { value: "cost", label: "Highest Cost" },
    { value: "costLow", label: "Lowest Cost" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
  ])
  .setSortStrategies({
    name: (a, b) => a.menuItemName.localeCompare(b.menuItemName),
    ingredients: (a, b) => {
      const aCount = (a as any).totalAllIngredients ?? a.recipeItems.length;
      const bCount = (b as any).totalAllIngredients ?? b.recipeItems.length;
      return bCount - aCount;
    },
    cost: (a, b) => {
      const aCost = (a as any).totalAllCost ?? a.recipeItems.reduce((sum, item) => sum + item.cost, 0);
      const bCost = (b as any).totalAllCost ?? b.recipeItems.reduce((sum, item) => sum + item.cost, 0);
      return bCost - aCost;
    },
    costLow: (a, b) => {
      const aCost = (a as any).totalAllCost ?? a.recipeItems.reduce((sum, item) => sum + item.cost, 0);
      const bCost = (b as any).totalAllCost ?? b.recipeItems.reduce((sum, item) => sum + item.cost, 0);
      return aCost - bCost;
    },
    newest: commonSortStrategies.newest as any,
    oldest: commonSortStrategies.oldest as any,
  })
  .build();

export const SUBMISSION_KEYS = config.SUBMISSION_KEYS;
export const TABLE_HEADERS = config.TABLE_HEADERS;
export const DIALOG_TITLES = config.DIALOG_TITLES;
export const DIALOG_TYPES = config.DIALOG_TYPES;
export const sortOptions = config.sortOptions;
export const applyRecipeSorting = config.applySorting;
export type RecipeFilterState = typeof config.FilterState;
