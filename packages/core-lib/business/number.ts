import { RecipeItemResponse } from "../api/commons/types";
import { IngredientStats } from "../core/types/ingredients";

export const calculateIngredientStats = (
  items: RecipeItemResponse[],
  totalCost: number,
  ingredientCount: number,
): IngredientStats => ({
  min: Math.min(...items.map((item) => item.cost)),
  max: Math.max(...items.map((item) => item.cost)),
  avg: totalCost / ingredientCount,
});
