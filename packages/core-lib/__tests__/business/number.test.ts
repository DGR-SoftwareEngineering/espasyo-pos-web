import {
  sum,
  average,
  toNumeric,
  calculateProfitMargin,
  getStockStatus,
  formatNumber,
  calculateIngredientStats,
} from "../../business/number";

describe("sum", () => {
  it("sums an array of numbers", () => {
    expect(sum([1, 2, 3])).toBe(6);
  });
  it("returns 0 for an empty array", () => {
    expect(sum([])).toBe(0);
  });
  it("handles negative numbers", () => {
    expect(sum([-1, 1])).toBe(0);
  });
  it("handles decimal numbers", () => {
    expect(sum([0.1, 0.2])).toBeCloseTo(0.3);
  });
});

describe("average", () => {
  it("calculates average of a number array", () => {
    expect(average([1, 2, 3])).toBe(2);
  });
  it("handles a single-element array", () => {
    expect(average([5])).toBe(5);
  });
  it("handles decimal results", () => {
    expect(average([1, 2])).toBe(1.5);
  });
});

describe("toNumeric", () => {
  it("converts a string number to number", () => {
    expect(toNumeric("3.14")).toBe(3.14);
  });
  it("returns null for null", () => {
    expect(toNumeric(null)).toBeNull();
  });
  it("returns null for undefined", () => {
    expect(toNumeric(undefined)).toBeNull();
  });
  it("returns null for empty string", () => {
    expect(toNumeric("")).toBeNull();
  });
  it("returns null for non-numeric string", () => {
    expect(toNumeric("abc")).toBeNull();
  });
  it("converts integer correctly", () => {
    expect(toNumeric(42)).toBe(42);
  });
  it("converts zero correctly", () => {
    expect(toNumeric(0)).toBe(0);
  });
});

describe("calculateProfitMargin", () => {
  it("calculates profit amount as unitPrice - costPrice", () => {
    const result = calculateProfitMargin(100, 80);
    expect(result.amount).toBe(20);
  });
  it("calculates profit percentage correctly", () => {
    const result = calculateProfitMargin(100, 80);
    expect(result.percentage).toBe(20);
  });
  it("handles zero cost price", () => {
    const result = calculateProfitMargin(100, 0);
    expect(result.amount).toBe(100);
    expect(result.percentage).toBe(100);
  });
  it("handles negative margin (loss)", () => {
    const result = calculateProfitMargin(50, 80);
    expect(result.amount).toBe(-30);
    expect(result.percentage).toBeLessThan(0);
  });
});

describe("getStockStatus", () => {
  it("returns isNormal when current > reorder", () => {
    const status = getStockStatus(100, 20, 10);
    expect(status.isNormal).toBe(true);
    expect(status.isLow).toBe(false);
    expect(status.isCritical).toBe(false);
  });
  it("returns isLow when current is between minimum and reorder", () => {
    const status = getStockStatus(15, 20, 10);
    expect(status.isNormal).toBe(false);
    expect(status.isLow).toBe(true);
    expect(status.isCritical).toBe(false);
  });
  it("returns isCritical when current <= minimum", () => {
    const status = getStockStatus(5, 20, 10);
    expect(status.isNormal).toBe(false);
    expect(status.isLow).toBe(false);
    expect(status.isCritical).toBe(true);
  });
  it("handles exactly at reorder point", () => {
    const status = getStockStatus(20, 20, 10);
    expect(status.isNormal).toBe(false);
    expect(status.isLow).toBe(true);
  });
  it("handles exactly at minimum point", () => {
    const status = getStockStatus(10, 20, 10);
    expect(status.isNormal).toBe(false);
    expect(status.isLow).toBe(false);
    expect(status.isCritical).toBe(true);
  });
});

describe("formatNumber", () => {
  it("formats number with 2 decimal places by default", () => {
    expect(formatNumber(3.14159)).toBe("3.14");
  });
  it("accepts custom decimal places", () => {
    expect(formatNumber(3.14159, 3)).toBe("3.142");
  });
  it("formats with grouping when useGrouping is true", () => {
    expect(formatNumber(1234567, 2, { useGrouping: true })).toBe("1,234,567.00");
  });
  it("returns fallback for null", () => {
    expect(formatNumber(null)).toBe("0");
  });
  it("returns fallback for undefined", () => {
    expect(formatNumber(undefined)).toBe("0");
  });
  it("returns custom fallback", () => {
    expect(formatNumber(null, 2, { fallback: "N/A" })).toBe("N/A");
  });
  it("handles string numbers", () => {
    expect(formatNumber("5.678", 2)).toBe("5.68");
  });
  it("returns fallback for non-numeric string", () => {
    expect(formatNumber("abc")).toBe("0");
  });
});

describe("calculateIngredientStats", () => {
  const items = [
    { calculatedCost: 10, cost: 8 },
    { calculatedCost: 20, cost: 15 },
    { calculatedCost: 30, cost: 25 },
  ] as any[];

  it("calculates min from calculatedCost", () => {
    const stats = calculateIngredientStats(items, 60, 3);
    expect(stats.min).toBe(10);
  });
  it("calculates max from calculatedCost", () => {
    const stats = calculateIngredientStats(items, 60, 3);
    expect(stats.max).toBe(30);
  });
  it("calculates avg as totalCost / ingredientCount", () => {
    const stats = calculateIngredientStats(items, 60, 3);
    expect(stats.avg).toBe(20);
  });
  it("falls back to cost when calculatedCost is falsy", () => {
    const itemsWithoutCalc = [
      { calculatedCost: 0, cost: 5 },
      { calculatedCost: 0, cost: 15 },
    ] as any[];
    const stats = calculateIngredientStats(itemsWithoutCalc, 20, 2);
    expect(stats.min).toBe(5);
    expect(stats.max).toBe(15);
  });
});
