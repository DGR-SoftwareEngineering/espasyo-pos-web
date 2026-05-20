import { useCallback, useMemo, useState } from "react";
import {
  SellableProductDto,
  SalesPaymentMethodDto,
} from "core-lib/api/commons/types";

export interface CartLine {
  productID: string;
  productName: string;
  unitID: string;
  unitName: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  currentStock: number;
}

export interface PaymentLine {
  id: string;
  method: SalesPaymentMethodDto;
  amount: string;
  tendered: string;
  referenceNumber: string;
}

export interface CartTotals {
  subtotal: number;
  discountTotal: number;
  taxableBase: number;
  taxAmount: number;
  totalAmount: number;
  tenderedTotal: number;
  changeDue: number;
  underpaid: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export const computeTotals = (
  lines: CartLine[],
  orderDiscount: number,
  taxRate: number,
  payments: PaymentLine[],
): CartTotals => {
  const subtotal = lines.reduce(
    (s, l) => s + Math.max(0, l.quantity) * Math.max(0, l.unitPrice),
    0,
  );
  const lineDiscounts = lines.reduce(
    (s, l) => s + Math.max(0, l.discount),
    0,
  );
  const safeOrderDiscount = Math.max(0, Math.min(orderDiscount, subtotal));
  const discountTotal = lineDiscounts + safeOrderDiscount;
  const taxableBase = Math.max(0, subtotal - discountTotal);
  const safeTaxRate = Math.max(0, Math.min(taxRate, 1));
  const taxAmount = taxableBase * safeTaxRate;
  const totalAmount = taxableBase + taxAmount;

  const tenderedTotal = payments.reduce((s, p) => {
    const value =
      p.method === SalesPaymentMethodDto.Cash
        ? Number(p.tendered) || Number(p.amount) || 0
        : Number(p.amount) || 0;
    return s + value;
  }, 0);

  const cashOverage = payments
    .filter((p) => p.method === SalesPaymentMethodDto.Cash)
    .reduce((s, p) => {
      const tendered = Number(p.tendered) || Number(p.amount) || 0;
      const amount = Number(p.amount) || 0;
      return s + Math.max(0, tendered - amount);
    }, 0);

  const totalPaid = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const underpaid = Math.max(0, totalAmount - totalPaid);

  return {
    subtotal: round2(subtotal),
    discountTotal: round2(discountTotal),
    taxableBase: round2(taxableBase),
    taxAmount: round2(taxAmount),
    totalAmount: round2(totalAmount),
    tenderedTotal: round2(tenderedTotal),
    changeDue: round2(cashOverage),
    underpaid: round2(underpaid),
  };
};

export interface UseCartState {
  lines: CartLine[];
  orderDiscount: number;
  taxRate: number;
  notes: string;
  addProduct: (product: SellableProductDto) => void;
  setLineQuantity: (productID: string, quantity: number) => void;
  setLineDiscount: (productID: string, discount: number) => void;
  removeLine: (productID: string) => void;
  setOrderDiscount: (value: number) => void;
  setTaxRate: (value: number) => void;
  setNotes: (value: string) => void;
  clear: () => void;
}

export const useCartState = (defaultTaxRate: number): UseCartState => {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(defaultTaxRate);
  const [notes, setNotes] = useState("");

  const addProduct = useCallback((product: SellableProductDto) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.productID === product.productID);
      if (existing) {
        return prev.map((l) =>
          l.productID === product.productID
            ? { ...l, quantity: l.quantity + 1 }
            : l,
        );
      }
      return [
        ...prev,
        {
          productID: product.productID,
          productName: product.name,
          unitID: "",
          unitName: product.stockUnitName,
          imageUrl: product.imageUrl,
          quantity: 1,
          unitPrice: product.sellingPrice,
          discount: 0,
          currentStock: product.currentStock,
        },
      ];
    });
  }, []);

  const setLineQuantity = useCallback((productID: string, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) =>
          l.productID === productID
            ? { ...l, quantity: Math.max(0, quantity) }
            : l,
        )
        .filter((l) => l.quantity > 0),
    );
  }, []);

  const setLineDiscount = useCallback((productID: string, discount: number) => {
    setLines((prev) =>
      prev.map((l) =>
        l.productID === productID
          ? { ...l, discount: Math.max(0, discount) }
          : l,
      ),
    );
  }, []);

  const removeLine = useCallback((productID: string) => {
    setLines((prev) => prev.filter((l) => l.productID !== productID));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setOrderDiscount(0);
    setNotes("");
    setTaxRate(defaultTaxRate);
  }, [defaultTaxRate]);

  return {
    lines,
    orderDiscount,
    taxRate,
    notes,
    addProduct,
    setLineQuantity,
    setLineDiscount,
    removeLine,
    setOrderDiscount,
    setTaxRate,
    setNotes,
    clear,
  };
};

export const useCartTotals = (
  state: UseCartState,
  payments: PaymentLine[],
): CartTotals =>
  useMemo(
    () => computeTotals(state.lines, state.orderDiscount, state.taxRate, payments),
    [state.lines, state.orderDiscount, state.taxRate, payments],
  );
