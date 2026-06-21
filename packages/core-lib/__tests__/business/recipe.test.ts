import {
  getRecipeItemCost,
  getRecipeTotalCost,
  getRecipeIngredientCount,
  getAverageCostPerIngredient,
  getIngredientCostStats,
  aggregateRecipeStats,
  getProductionMaxUnits,
  getProductionCostPerUnit,
  getProductionTotalCostAtMax,
} from "../../business/recipe";

const makeItem = (calculatedCost: number, cost = 0) =>
  ({ calculatedCost, cost }) as any;

const makeRecipe = (
  totalCost: number,
  items: { calculatedCost: number; cost?: number }[],
  menuItemName = "Test Recipe"
) =>
  ({
    totalCost,
    recipeItems: items.map((i) => makeItem(i.calculatedCost, i.cost ?? 0)),
    menuItemName,
  }) as any;

describe("getRecipeItemCost", () => {
  it("returns calculatedCost when present", () => {
    expect(getRecipeItemCost(makeItem(15, 10))).toBe(15);
  });
  it("falls back to cost when calculatedCost is 0", () => {
    expect(getRecipeItemCost(makeItem(0, 10))).toBe(10);
  });
  it("returns 0 when both are 0", () => {
    expect(getRecipeItemCost(makeItem(0, 0))).toBe(0);
  });
});

describe("getRecipeTotalCost", () => {
  it("uses server totalCost when > 0", () => {
    const recipe = makeRecipe(50, [{ calculatedCost: 10 }, { calculatedCost: 20 }]);
    expect(getRecipeTotalCost(recipe)).toBe(50);
  });
  it("sums items when server totalCost is 0", () => {
    const recipe = makeRecipe(0, [{ calculatedCost: 10 }, { calculatedCost: 20 }]);
    expect(getRecipeTotalCost(recipe)).toBe(30);
  });
  it("returns 0 for recipe with no items and totalCost 0", () => {
    const recipe = makeRecipe(0, []);
    expect(getRecipeTotalCost(recipe)).toBe(0);
  });
});

describe("getRecipeIngredientCount", () => {
  it("returns the number of recipe items", () => {
    const recipe = makeRecipe(0, [{ calculatedCost: 5 }, { calculatedCost: 10 }]);
    expect(getRecipeIngredientCount(recipe)).toBe(2);
  });
  it("returns 0 for empty recipe", () => {
    const recipe = makeRecipe(0, []);
    expect(getRecipeIngredientCount(recipe)).toBe(0);
  });
  it("returns 0 when recipeItems is undefined", () => {
    expect(getRecipeIngredientCount({ totalCost: 0 } as any)).toBe(0);
  });
});

describe("getAverageCostPerIngredient", () => {
  it("divides total cost by item count", () => {
    const recipe = makeRecipe(30, [{ calculatedCost: 10 }, { calculatedCost: 20 }]);
    expect(getAverageCostPerIngredient(recipe)).toBe(15);
  });
  it("returns 0 when no items", () => {
    const recipe = makeRecipe(0, []);
    expect(getAverageCostPerIngredient(recipe)).toBe(0);
  });
});

describe("getIngredientCostStats", () => {
  it("returns min, max, avg correctly", () => {
    const recipe = makeRecipe(60, [
      { calculatedCost: 10 },
      { calculatedCost: 20 },
      { calculatedCost: 30 },
    ]);
    const stats = getIngredientCostStats(recipe);
    expect(stats.min).toBe(10);
    expect(stats.max).toBe(30);
    expect(stats.avg).toBe(20);
  });
  it("returns zeros for empty recipe", () => {
    const recipe = makeRecipe(0, []);
    const stats = getIngredientCostStats(recipe);
    expect(stats).toEqual({ min: 0, max: 0, avg: 0 });
  });
});

describe("aggregateRecipeStats", () => {
  const recipes = [
    makeRecipe(30, [{ calculatedCost: 10 }, { calculatedCost: 20 }], "Recipe A"),
    makeRecipe(90, [
      { calculatedCost: 30 },
      { calculatedCost: 30 },
      { calculatedCost: 30 },
    ], "Recipe B"),
  ];

  it("counts total recipes", () => {
    expect(aggregateRecipeStats(recipes).totalRecipes).toBe(2);
  });
  it("totals all ingredient counts", () => {
    expect(aggregateRecipeStats(recipes).totalIngredients).toBe(5);
  });
  it("totals all costs", () => {
    expect(aggregateRecipeStats(recipes).totalCost).toBe(120);
  });
  it("calculates average ingredients per recipe", () => {
    expect(aggregateRecipeStats(recipes).averageIngredients).toBe(2.5);
  });
  it("identifies most expensive recipe", () => {
    const stats = aggregateRecipeStats(recipes);
    expect(stats.mostExpensive.name).toBe("Recipe B");
    expect(stats.mostExpensive.cost).toBe(90);
  });
  it("identifies recipe with most ingredients", () => {
    const stats = aggregateRecipeStats(recipes);
    expect(stats.mostIngredients.name).toBe("Recipe B");
    expect(stats.mostIngredients.count).toBe(3);
  });
  it("returns zeroed stats for empty array", () => {
    const stats = aggregateRecipeStats([]);
    expect(stats.totalRecipes).toBe(0);
    expect(stats.totalCost).toBe(0);
    expect(stats.averageIngredients).toBe(0);
  });
});

describe("getProductionMaxUnits", () => {
  it("returns maxUnitsCanProduce from capacity", () => {
    expect(getProductionMaxUnits({ maxUnitsCanProduce: 50 } as any)).toBe(50);
  });
  it("returns 0 for undefined capacity", () => {
    expect(getProductionMaxUnits(undefined)).toBe(0);
  });
  it("returns 0 when maxUnitsCanProduce is undefined", () => {
    expect(getProductionMaxUnits({} as any)).toBe(0);
  });
});

describe("getProductionCostPerUnit", () => {
  it("returns totalCostPerUnit from capacity when > 0", () => {
    expect(getProductionCostPerUnit({ totalCostPerUnit: 25 } as any)).toBe(25);
  });
  it("falls back to recipe total cost when capacity value is 0", () => {
    const recipe = makeRecipe(30, [{ calculatedCost: 10 }, { calculatedCost: 20 }]);
    expect(getProductionCostPerUnit({ totalCostPerUnit: 0 } as any, recipe)).toBe(30);
  });
  it("returns 0 when capacity is undefined and no recipe", () => {
    expect(getProductionCostPerUnit(undefined)).toBe(0);
  });
});

describe("getProductionTotalCostAtMax", () => {
  it("returns totalCostMaxProduction from capacity when > 0", () => {
    expect(
      getProductionTotalCostAtMax({ totalCostMaxProduction: 500 } as any)
    ).toBe(500);
  });
  it("calculates max * costPerUnit when server value is 0", () => {
    const capacity = {
      maxUnitsCanProduce: 10,
      totalCostPerUnit: 25,
      totalCostMaxProduction: 0,
    } as any;
    expect(getProductionTotalCostAtMax(capacity)).toBe(250);
  });
  it("returns 0 for undefined capacity", () => {
    expect(getProductionTotalCostAtMax(undefined)).toBe(0);
  });
});
