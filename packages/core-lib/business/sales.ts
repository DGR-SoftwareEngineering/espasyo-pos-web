import { DailySalesSummaryDto } from "../api/commons/types";

/** Gross sales for the day: prefer the byCashier breakdown, fall back to totalAmount. */
export const getDailySalesGross = (
  response?: DailySalesSummaryDto | null,
): number => {
  const byCashierGross = (response?.byCashier ?? []).reduce(
    (sum, c) => sum + c.totalAmount,
    0,
  );
  return byCashierGross > 0 ? byCashierGross : (response?.totalAmount ?? 0);
};
