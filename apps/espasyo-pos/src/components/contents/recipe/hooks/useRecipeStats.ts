import { useMemo } from "react";
import { RecipeResponse } from "core-lib/api/commons/types";
import { aggregateRecipeStats } from "core-lib/business/recipe";

export const useRecipeStats = (recipes: RecipeResponse[]) =>
  useMemo(() => aggregateRecipeStats(recipes), [recipes]);
