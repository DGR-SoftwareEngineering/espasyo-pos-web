"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { CustomerCheckoutItemParams } from "../../../api/commons/types";

/**
 * A single client-side cart line. The shape maps directly onto
 * `CustomerCheckoutItemParams` so checkout is a thin transform. The cart is
 * never persisted server-side (per the customer dashboard API contract) — it
 * lives only here until checkout.
 */
export interface CustomerCartItem {
  /** Stable client-side id: product + variant + add-on signature. */
  lineId: string;
  productID: string;
  productVariantID: string | null;
  name: string;
  variantName: string | null;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  /** JSON string of selected add-ons (matches the API's `addOnsJson`). */
  addOnsJson: string | null;
}

export interface CartTotals {
  subtotal: number;
  itemCount: number;
}

interface CartContextValue {
  items: CustomerCartItem[];
  count: number;
  totals: CartTotals;
  addItem: (
    item: Omit<CustomerCartItem, "lineId" | "quantity">,
    quantity?: number,
  ) => void;
  removeItem: (lineId: string) => void;
  setQty: (lineId: string, quantity: number) => void;
  clear: () => void;
  /** Map the cart into the checkout request payload. */
  toCheckoutItems: () => CustomerCheckoutItemParams[];
}

const CartContext = createContext<CartContextValue | null>(null);

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a <CartProvider>.");
  }
  return ctx;
};

const lineKey = (
  productID: string,
  variantID: string | null,
  addOnsJson: string | null,
): string => `${productID}::${variantID ?? ""}::${addOnsJson ?? ""}`;

export const calcCartTotals = (items: CustomerCartItem[]): CartTotals => ({
  subtotal: items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
  itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
});

export const CartProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [items, setItems] = useState<CustomerCartItem[]>([]);

  const addItem = useCallback<CartContextValue["addItem"]>(
    (item, quantity = 1) => {
      setItems((prev) => {
        const lineId = lineKey(
          item.productID,
          item.productVariantID,
          item.addOnsJson,
        );
        const existing = prev.find((i) => i.lineId === lineId);
        if (existing) {
          return prev.map((i) =>
            i.lineId === lineId
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        }
        return [...prev, { ...item, lineId, quantity }];
      });
    },
    [],
  );

  const removeItem = useCallback((lineId: string) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  }, []);

  const setQty = useCallback((lineId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.lineId !== lineId)
        : prev.map((i) => (i.lineId === lineId ? { ...i, quantity } : i)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totals = useMemo(() => calcCartTotals(items), [items]);

  const toCheckoutItems = useCallback(
    (): CustomerCheckoutItemParams[] =>
      items.map((i) => ({
        productID: i.productID,
        productVariantID: i.productVariantID,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        addOnsJson: i.addOnsJson,
      })),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: totals.itemCount,
      totals,
      addItem,
      removeItem,
      setQty,
      clear,
      toCheckoutItems,
    }),
    [items, totals, addItem, removeItem, setQty, clear, toCheckoutItems],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
