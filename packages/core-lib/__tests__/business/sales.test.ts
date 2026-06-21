import { getDailySalesGross } from "../../business/sales";

describe("getDailySalesGross", () => {
  it("returns 0 when response is undefined", () => {
    expect(getDailySalesGross(undefined)).toBe(0);
  });

  it("returns 0 when response is null", () => {
    expect(getDailySalesGross(null)).toBe(0);
  });

  it("returns totalAmount when byCashier is empty", () => {
    const response = {
      totalAmount: 5000,
      byCashier: [],
    } as any;
    expect(getDailySalesGross(response)).toBe(5000);
  });

  it("uses byCashier sum when byCashier has entries", () => {
    const response = {
      totalAmount: 9000,
      byCashier: [
        { totalAmount: 3000 },
        { totalAmount: 4500 },
      ],
    } as any;
    expect(getDailySalesGross(response)).toBe(7500);
  });

  it("falls back to totalAmount when byCashier sum is zero", () => {
    const response = {
      totalAmount: 5000,
      byCashier: [{ totalAmount: 0 }],
    } as any;
    expect(getDailySalesGross(response)).toBe(5000);
  });

  it("handles response with no byCashier field", () => {
    const response = { totalAmount: 1200 } as any;
    expect(getDailySalesGross(response)).toBe(1200);
  });
});
