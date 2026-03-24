import { useMemo } from "react";
import { RecipeResponse } from "core-lib/api/commons/types";

export const useRecipeStats = (recipes: RecipeResponse[]) => {
  return useMemo(() => {
    const stats = recipes.map((r) => ({
      name: r.menuItemName,
      ingredientCount: r.recipeItems.length,
      totalCost: r.recipeItems.reduce((sum, i) => sum + i.cost, 0),
    }));

    const totals = stats.reduce(
      (acc, curr) => ({
        totalRecipes: acc.totalRecipes + 1,
        totalIngredients: acc.totalIngredients + curr.ingredientCount,
        totalCost: acc.totalCost + curr.totalCost,
        mostExpensive:
          curr.totalCost > acc.mostExpensive.cost
            ? { name: curr.name, cost: curr.totalCost }
            : acc.mostExpensive,
        mostIngredients:
          curr.ingredientCount > acc.mostIngredients.count
            ? { name: curr.name, count: curr.ingredientCount }
            : acc.mostIngredients,
      }),
      {
        totalRecipes: 0,
        totalIngredients: 0,
        totalCost: 0,
        mostExpensive: { name: "", cost: 0 },
        mostIngredients: { name: "", count: 0 },
      },
    );

    return {
      ...totals,
      averageIngredients: totals.totalRecipes
        ? Number((totals.totalIngredients / totals.totalRecipes).toFixed(1))
        : 0,
    };
  }, [recipes]);
};
