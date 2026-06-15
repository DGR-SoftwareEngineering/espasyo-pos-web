import { useMemo } from "react";
import { ProductRecipeSummaryResponse } from "core-lib/api/commons/types";

export const useRecipeStats = (recipes: ProductRecipeSummaryResponse[]) =>
  useMemo(() => {
    const totalRecipes = recipes.length;
    const totalIngredients = recipes.reduce(
      (sum, r) => sum + r.totalAllIngredients,
      0,
    );
    const totalCost = recipes.reduce((sum, r) => sum + r.totalAllCost, 0);
    const averageIngredients =
      totalRecipes > 0
        ? Number((totalIngredients / totalRecipes).toFixed(1))
        : 0;
    const mostExpensive = recipes.reduce(
      (best, r) =>
        r.totalAllCost > best.cost
          ? { name: r.menuItemName, cost: r.totalAllCost }
          : best,
      { name: "", cost: 0 },
    );
    const mostIngredients = recipes.reduce(
      (best, r) =>
        r.totalAllIngredients > best.count
          ? { name: r.menuItemName, count: r.totalAllIngredients }
          : best,
      { name: "", count: 0 },
    );
    return {
      totalRecipes,
      totalIngredients,
      totalCost,
      averageIngredients,
      mostExpensive,
      mostIngredients,
    };
  }, [recipes]);
