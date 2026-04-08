import { RecipeItemResponse } from "../api/commons/types";
import { IngredientStats } from "../core/types/constants/base.constants";

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

/**
 * Formats a number with specified decimal places and optional formatting options
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @param options - Additional formatting options
 * @returns Formatted number as string
 */
export function formatNumber(
  value: number | string | undefined | null,
  decimals: number = 2,
  options?: {
    useGrouping?: boolean;
    fallback?: string;
  },
): string {
  const { useGrouping = false, fallback = "0" } = options || {};

  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) {
    return fallback;
  }

  if (useGrouping) {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  return num.toFixed(decimals);
}

export const average = (arr: number[]) =>
  arr.reduce((p, c) => p + c, 0) / arr.length;
export const sum = (arr: number[]) => arr.reduce((p, c) => p + c, 0);
