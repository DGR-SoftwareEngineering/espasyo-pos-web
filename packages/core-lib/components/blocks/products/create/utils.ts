import { SelectOption } from "../../../form";
import { CategoryDataList } from "../../../../api/commons/types";

export const toSelectOptions = (
  categories: CategoryDataList[],
): SelectOption[] =>
  categories.map(({ categoryID, name }) => ({
    value: categoryID,
    label: name,
  }));

export const formatPrice = (price: unknown): string => {
  if (!price && price !== 0) return "0.00";
  const numericPrice =
    typeof price === "string" ? parseFloat(price) : Number(price);
  return Number.isNaN(numericPrice) ? "0.00" : numericPrice.toFixed(2);
};

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

export const getStockStatus = (
  current: number,
  reorder: number,
  minimum: number,
) => ({
  isNormal: current > reorder,
  isLow: current > minimum && current <= reorder,
  isCritical: current <= minimum,
});
