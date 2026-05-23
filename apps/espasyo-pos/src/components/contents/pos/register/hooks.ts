import { useCallback, useMemo, useState } from "react";
import {
  SellableProductDto,
  SalesPaymentMethodDto,
  PromoDto,
} from "core-lib/api/commons/types";

export interface CartLineAddOn {
  productAddOnGroupID: string;
  productAddOnItemID: string;
  groupName: string;
  itemName: string;
  additionalPrice: number;
}

export interface CartLine {
  /** Stable client-side ID, unique per cart line. */
  lineId: string;
  productID: string;
  productName: string;
  unitID: string;
  unitName: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  currentStock: number;
  promoID?: string;
  promoLabel?: string;
  originalPrice?: number;
  // Variant snapshot
  productVariantID?: string | null;
  variantName?: string | null;
  // Add-on snapshot (informational; canonical IDs live in addOnItemIDs)
  addOnItemIDs?: string[];
  addOnSummary?: CartLineAddOn[];
}

const genLineId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `line_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

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

export interface AddProductOptions {
  productVariantID?: string | null;
  variantName?: string | null;
  unitPrice?: number; // resolved combined price (variant + addons)
  quantity?: number;
  addOnItems?: CartLineAddOn[];
}

export interface UseCartState {
  lines: CartLine[];
  orderDiscount: number;
  taxRate: number;
  notes: string;
  addProduct: (product: SellableProductDto) => void;
  addProductWithOptions: (
    product: SellableProductDto,
    options: AddProductOptions,
  ) => void;
  applyPromo: (product: SellableProductDto, promo: PromoDto) => void;
  setLineQuantity: (lineId: string, quantity: number) => void;
  setLineDiscount: (lineId: string, discount: number) => void;
  removeLine: (lineId: string) => void;
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
      // Only merge lines that have no variant or add-ons.
      const existing = prev.find(
        (l) =>
          l.productID === product.productID &&
          !l.productVariantID &&
          (l.addOnItemIDs?.length ?? 0) === 0 &&
          !l.promoID,
      );
      if (existing) {
        return prev.map((l) =>
          l.lineId === existing.lineId
            ? { ...l, quantity: l.quantity + 1 }
            : l,
        );
      }
      return [
        ...prev,
        {
          lineId: genLineId(),
          productID: product.productID,
          productName: product.name,
          unitID: "",
          unitName: product.stockUnitName,
          imageUrl: product.imageUrl,
          quantity: 1,
          unitPrice: product.sellingPrice ?? 0,
          discount: 0,
          currentStock: product.currentStock,
        },
      ];
    });
  }, []);

  const addProductWithOptions = useCallback(
    (product: SellableProductDto, options: AddProductOptions) => {
      setLines((prev) => {
        const qty = options.quantity ?? 1;
        const unitPrice = options.unitPrice ?? product.sellingPrice ?? 0;
        const addOnIds = (options.addOnItems ?? []).map((a) => a.productAddOnItemID);
        return [
          ...prev,
          {
            lineId: genLineId(),
            productID: product.productID,
            productName: product.name,
            unitID: "",
            unitName: product.stockUnitName,
            imageUrl: product.imageUrl,
            quantity: qty,
            unitPrice,
            discount: 0,
            currentStock: product.currentStock,
            productVariantID: options.productVariantID ?? null,
            variantName: options.variantName ?? null,
            addOnItemIDs: addOnIds,
            addOnSummary: options.addOnItems,
          },
        ];
      });
    },
    [],
  );

  const applyPromo = useCallback((product: SellableProductDto, promo: PromoDto) => {
    setLines((prev) => {
      // Remove existing plain (non-variant, non-promo) line for this product
      let filtered = prev.filter(
        (l) =>
          !(
            l.productID === product.productID &&
            !l.productVariantID &&
            (l.addOnItemIDs?.length ?? 0) === 0
          ),
      );

      if (promo.type === "PercentageDiscount") {
        const effectivePrice = product.sellingPrice ?? 0;
        const discountedPrice = round2(
          effectivePrice * (1 - ((promo.discountPercent ?? 0) / 100))
        );
        return [
          ...filtered,
          {
            lineId: genLineId(),
            productID: product.productID,
            productName: product.name,
            unitID: "",
            unitName: product.stockUnitName,
            imageUrl: product.imageUrl,
            quantity: 1,
            unitPrice: discountedPrice,
            discount: 0,
            currentStock: product.currentStock,
            promoID: promo.promoID,
            promoLabel: promo.title,
            originalPrice: effectivePrice,
          },
        ];
      } else if (promo.type === "FixedDiscount") {
        const effectivePrice = product.sellingPrice ?? 0;
        const discountedPrice = Math.max(
          0,
          round2(effectivePrice - (promo.discountAmount ?? 0))
        );
        return [
          ...filtered,
          {
            lineId: genLineId(),
            productID: product.productID,
            productName: product.name,
            unitID: "",
            unitName: product.stockUnitName,
            imageUrl: product.imageUrl,
            quantity: 1,
            unitPrice: discountedPrice,
            discount: 0,
            currentStock: product.currentStock,
            promoID: promo.promoID,
            promoLabel: promo.title,
            originalPrice: effectivePrice,
          },
        ];
      } else if (promo.type === "BuyXGetY") {
        const buyQty = promo.buyQuantity ?? 1;
        const getQty = promo.getQuantity ?? 1;
        const totalQty = buyQty + getQty;
        const discountAmount = round2((product.sellingPrice ?? 0) * getQty);
        return [
          ...filtered,
          {
            lineId: genLineId(),
            productID: product.productID,
            productName: product.name,
            unitID: "",
            unitName: product.stockUnitName,
            imageUrl: product.imageUrl,
            quantity: totalQty,
            unitPrice: product.sellingPrice ?? 0,
            discount: discountAmount,
            currentStock: product.currentStock,
            promoID: promo.promoID,
            promoLabel: promo.title,
            originalPrice: product.sellingPrice ?? undefined,
          },
        ];
      } else if (promo.type === "Bundle") {
        // Category-targeted bundle items can't be pre-resolved client-side —
        // the backend BFS-expands them at sale time. Filter them out here;
        // the caller surfaces a hint toast so the cashier adds eligible items.
        const productItems = promo.items.filter(
          (i): i is typeof i & { productID: string } => !!i.productID,
        );

        // Remove lines for all bundle product items (plain lines only)
        const bundleProductIds = new Set(productItems.map((i) => i.productID));
        filtered = filtered.filter(
          (l) => !bundleProductIds.has(l.productID) || l.productVariantID,
        );

        const bundlePrice = promo.bundlePrice ?? 0;
        const paidItems = productItems.filter((i) => !i.isFreeItem);
        const freeItems = productItems.filter((i) => i.isFreeItem);
        const totalPaidQty = paidItems.reduce((s, i) => s + i.quantity, 0);
        const pricePerPaidUnit = totalPaidQty > 0 ? round2(bundlePrice / totalPaidQty) : 0;

        const newLines = [...filtered];

        for (const item of paidItems) {
          newLines.push({
            lineId: genLineId(),
            productID: item.productID,
            productName: item.productName ?? "",
            unitID: "",
            unitName: "",
            imageUrl: null,
            quantity: item.quantity,
            unitPrice: pricePerPaidUnit,
            discount: 0,
            currentStock: 9999,
            promoID: promo.promoID,
            promoLabel: promo.title,
            originalPrice: undefined,
          });
        }

        for (const item of freeItems) {
          newLines.push({
            lineId: genLineId(),
            productID: item.productID,
            productName: item.productName ?? "",
            unitID: "",
            unitName: "",
            imageUrl: null,
            quantity: item.quantity,
            unitPrice: 0,
            discount: 0,
            currentStock: 9999,
            promoID: promo.promoID,
            promoLabel: promo.title,
            originalPrice: undefined,
          });
        }

        return newLines;
      }

      return prev;
    });
  }, []);

  const setLineQuantity = useCallback((lineId: string, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) =>
          l.lineId === lineId ? { ...l, quantity: Math.max(0, quantity) } : l,
        )
        .filter((l) => l.quantity > 0),
    );
  }, []);

  const setLineDiscount = useCallback((lineId: string, discount: number) => {
    setLines((prev) =>
      prev.map((l) =>
        l.lineId === lineId ? { ...l, discount: Math.max(0, discount) } : l,
      ),
    );
  }, []);

  const removeLine = useCallback((lineId: string) => {
    setLines((prev) => prev.filter((l) => l.lineId !== lineId));
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
    addProductWithOptions,
    applyPromo,
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
