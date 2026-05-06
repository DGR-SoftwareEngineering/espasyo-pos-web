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

const config = new FeatureConfigBuilder<RecipeResponse, "Recipe">("Recipe")
  .setTableHeaders([
    {
      id: "menuItemName",
      label: "Recipe Details",
      width: "35%",
      sortable: true,
      align: "left",
    },
    {
      id: "ingredientCount",
      label: "Ingredients",
      align: "center",
      width: "15%",
      sortable: true,
    },
    {
      id: "totalCost",
      label: "Total Cost",
      align: "center",
      width: "20%",
      sortable: true,
    },
    {
      id: "actions",
      label: "Actions",
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
    ingredients: (a, b) => b.recipeItems.length - a.recipeItems.length,
    cost: (a, b) => {
      const costA = a.recipeItems.reduce((sum, item) => sum + item.cost, 0);
      const costB = b.recipeItems.reduce((sum, item) => sum + item.cost, 0);
      return costB - costA;
    },
    costLow: (a, b) => {
      const costA = a.recipeItems.reduce((sum, item) => sum + item.cost, 0);
      const costB = b.recipeItems.reduce((sum, item) => sum + item.cost, 0);
      return costA - costB;
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
