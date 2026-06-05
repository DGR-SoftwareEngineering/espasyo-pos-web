import {
  ProductionCapacity,
  RecipeItemResponse,
  RecipeResponse,
} from "../api/commons/types";
import { IngredientStats } from "../core/types/constants/base.constants";

export const getRecipeItemCost = (item: RecipeItemResponse): number =>
  Number(item?.calculatedCost ?? 0) || Number(item?.cost ?? 0) || 0;

export const getRecipeTotalCost = (recipe: RecipeResponse): number => {
  const serverTotal = Number(recipe?.totalCost ?? 0);
  if (serverTotal > 0) return serverTotal;
  return (recipe?.recipeItems ?? []).reduce(
    (sum, item) => sum + getRecipeItemCost(item),
    0,
  );
};

export const getRecipeIngredientCount = (recipe: RecipeResponse): number =>
  recipe?.recipeItems?.length ?? 0;

export const getAverageCostPerIngredient = (recipe: RecipeResponse): number => {
  const count = getRecipeIngredientCount(recipe);
  return count > 0 ? getRecipeTotalCost(recipe) / count : 0;
};

export const getIngredientCostStats = (
  recipe: RecipeResponse,
): IngredientStats => {
  const items = recipe?.recipeItems ?? [];
  if (items.length === 0) return { min: 0, max: 0, avg: 0 };
  const costs = items.map(getRecipeItemCost);
  const total = getRecipeTotalCost(recipe);
  return {
    min: Math.min(...costs),
    max: Math.max(...costs),
    avg: total / items.length,
  };
};

export interface RecipeListStats {
  totalRecipes: number;
  totalIngredients: number;
  totalCost: number;
  averageIngredients: number;
  mostExpensive: { name: string; cost: number };
  mostIngredients: { name: string; count: number };
}

export const aggregateRecipeStats = (
  recipes: RecipeResponse[],
): RecipeListStats => {
  const initial: RecipeListStats = {
    totalRecipes: 0,
    totalIngredients: 0,
    totalCost: 0,
    averageIngredients: 0,
    mostExpensive: { name: "", cost: 0 },
    mostIngredients: { name: "", count: 0 },
  };

  const aggregate = recipes.reduce<RecipeListStats>((acc, recipe) => {
    const ingredientCount = getRecipeIngredientCount(recipe);
    const totalCost = getRecipeTotalCost(recipe);
    const name = recipe.menuItemName ?? "";

    return {
      totalRecipes: acc.totalRecipes + 1,
      totalIngredients: acc.totalIngredients + ingredientCount,
      totalCost: acc.totalCost + totalCost,
      averageIngredients: 0,
      mostExpensive:
        totalCost > acc.mostExpensive.cost
          ? { name, cost: totalCost }
          : acc.mostExpensive,
      mostIngredients:
        ingredientCount > acc.mostIngredients.count
          ? { name, count: ingredientCount }
          : acc.mostIngredients,
    };
  }, initial);

  return {
    ...aggregate,
    averageIngredients: aggregate.totalRecipes
      ? Number((aggregate.totalIngredients / aggregate.totalRecipes).toFixed(1))
      : 0,
  };
};

export const getProductionMaxUnits = (
  capacity: ProductionCapacity | undefined,
): number => Number(capacity?.maxUnitsCanProduce ?? 0);

export const getProductionCostPerUnit = (
  capacity: ProductionCapacity | undefined,
  recipe?: RecipeResponse,
): number => {
  const serverValue = Number(capacity?.totalCostPerUnit ?? 0);
  if (serverValue > 0) return serverValue;
  return recipe ? getRecipeTotalCost(recipe) : 0;
};

export const getProductionTotalCostAtMax = (
  capacity: ProductionCapacity | undefined,
  recipe?: RecipeResponse,
): number => {
  const serverValue = Number(capacity?.totalCostMaxProduction ?? 0);
  if (serverValue > 0) return serverValue;
  const max = getProductionMaxUnits(capacity);
  const costPerUnit = getProductionCostPerUnit(capacity, recipe);
  return max * costPerUnit;
};
