import { RecipeItemResponse } from "../api/commons/types";
import { IngredientStats } from "../core/types/ingredients";

export const calculateIngredientStats = (
  items: RecipeItemResponse[],
  totalCost: number,
  ingredientCount: number,
): IngredientStats => ({
  min: Math.min(...items.map((item) => item.calculatedCost || item.cost)),
  max: Math.max(...items.map((item) => item.calculatedCost || item.cost)),
  avg: totalCost / ingredientCount,
});

export const toNumeric = (value: any): number | null => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};

export const calculateProfitMargin = (
  unitPrice: number,
  costPrice: number,
) => ({
  amount: unitPrice - costPrice,
  percentage: ((unitPrice - costPrice) / unitPrice) * 100,
});

//TODO: Change to generic function name
export const getStockStatus = (
  current: number,
  reorder: number,
  minimum: number,
) => ({
  isNormal: current > reorder,
  isLow: current > minimum && current <= reorder,
  isCritical: current <= minimum,
});
