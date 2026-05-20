import React, { useCallback, useMemo, useState } from "react";
import { Box, Callout } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  useToastContext,
  usePublicSettings,
  useDialogContext,
} from "core-lib/core/contexts";
import { useApiCallback } from "core-lib/core/hooks";
import {
  CreateSaleParams,
  SaleDetailDto,
  SellableProductDto,
} from "core-lib/api/commons/types";
import type {
  PosChargePayload,
  PostSaleDialogData,
} from "core-lib/api/content/types/common";
import { ProductGrid } from "./ProductGrid";
import { CartPanel } from "./CartPanel";
import { computeTotals, useCartState } from "./hooks";
import { SaleReceiptPrintable } from "../printables/SaleReceiptPrintable";

const MENU_ITEM_NO_RECIPE_CODE = "MENUITEM.NO_RECIPE";
const ERROR_CODE_PREFIX_RE = /^\[([A-Z][A-Z0-9._]*)\]\s*/;

const resolveSaleErrorMessage = (
  errors: string[] | null,
  fallbackMessage: string | null,
): string => {
  if (errors && errors.length > 0) {
    const first = errors[0];
    const match = first.match(ERROR_CODE_PREFIX_RE);
    const code = match?.[1] ?? "";
    const stripped = match ? first.slice(match[0].length) : first;
    if (code === MENU_ITEM_NO_RECIPE_CODE) {
      return `${stripped} Set up the recipe before selling, or have an admin enable 'Allow Menu Items Without Recipe' in settings.`;
    }
    return stripped;
  }
  return fallbackMessage ?? "Failed to complete sale";
};

export const PosRegisterBlock: React.FC = () => {
  const { showToast } = useToastContext();
  const { systemName, theme, currencyCode, pos } = usePublicSettings();
  const { openDialog } = useDialogContext();

  const cart = useCartState(pos.defaultTaxRate);
  const totals = useMemo(
    () => computeTotals(cart.lines, cart.orderDiscount, cart.taxRate, []),
    [cart.lines, cart.orderDiscount, cart.taxRate],
  );

  const cartCountByProductID = useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of cart.lines) map[l.productID] = l.quantity;
    return map;
  }, [cart.lines]);

  const [submitting, setSubmitting] = useState(false);

  const createCb = useApiCallback(async (api, args: CreateSaleParams) =>
    api.commons.createSale(args),
  );

  const handleAdd = useCallback(
    (product: SellableProductDto) => {
      if (product.isOutOfStock && !pos.allowSales) return;
      cart.addProduct(product);
    },
    [cart, pos.allowSales],
  );

  const submitSale = useCallback(
    async (payload: PosChargePayload) => {
      const params: CreateSaleParams = {
        items: cart.lines.map((l) => ({
          productID: l.productID,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          discount: l.discount > 0 ? l.discount : null,
        })),
        discountAmount: cart.orderDiscount > 0 ? cart.orderDiscount : null,
        taxRate: cart.taxRate,
        payments: payload.payments.map((p) => ({
          method: p.method,
          amount: p.amount,
          tendered: p.tendered,
          referenceNumber: p.referenceNumber,
        })),
        notes: payload.notes,
      };

      setSubmitting(true);
      try {
        const result = await createCb.execute(params);
        if (
          result.status >= 200 &&
          result.status < 300 &&
          result.data?.success &&
          result.data.response
        ) {
          const sale = result.data.response;
          showToast(`Sale ${sale.saleNumber} completed`, "success");
          cart.clear();
          // Open the post-sale dialog after the charge dialog closes (setTimeout
          // ensures openDialog runs after CompleteSaleDialogContent calls onClose).
          setTimeout(() => {
            openDialog({
              title: `Receipt · ${sale.saleNumber}`,
              dialogContentType: "PostSale",
              data: {
                sale,
                renderReceipt: (s: SaleDetailDto) => (
                  <SaleReceiptPrintable
                    sale={s}
                    businessName={systemName}
                    logoUrl={theme?.logoUrl ?? null}
                    currencyCode={currencyCode}
                    receiptHeader={pos.receiptHeader}
                    receiptFooter={pos.receiptFooter}
                  />
                ),
              } as PostSaleDialogData,
            });
          }, 0);
          return;
        }
        const errorMessage = resolveSaleErrorMessage(
          Array.isArray(result.data?.errors)
            ? (result.data.errors as string[])
            : null,
          result.data?.message ?? null,
        );
        showToast(errorMessage, "error");
        throw new Error(errorMessage);
      } catch (error) {
        if (error instanceof Error) throw error;
        const errors =
          Array.isArray(error) && error.every((e) => typeof e === "string")
            ? (error as string[])
            : null;
        const first = resolveSaleErrorMessage(errors, null);
        showToast(first, "error");
        throw new Error(first);
      } finally {
        setSubmitting(false);
      }
    },
    [cart, createCb, showToast, openDialog, systemName, theme, currencyCode, pos],
  );

  const handleCharge = useCallback(() => {
    if (cart.lines.length === 0) return;
    openDialog({
      title: "Complete sale",
      dialogContentType: "PosCharge",
      data: {
        totalAmount: totals.totalAmount,
        subtotal: totals.subtotal,
        discountAmount: totals.discountTotal,
        taxRate: cart.taxRate,
        taxAmount: totals.taxAmount,
        itemCount: cart.lines.reduce((s, l) => s + l.quantity, 0),
        onConfirm: submitSale,
      },
    });
  }, [cart.lines, cart.taxRate, totals, openDialog, submitSale]);

  return (
    <Box
      style={{
        height: "calc(100vh - 120px)",
        minHeight: 560,
        margin: "-24px -32px",
        padding: 20,
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, var(--indigo-a2) 0%, transparent 60%), var(--gray-2)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {!pos.allowSales && (
        <Callout.Root color="red" variant="surface" size="1">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            Sales are currently disabled by admin settings. The register is
            visible but cannot record new transactions.
          </Callout.Text>
        </Callout.Root>
      )}

      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(380px, 440px)",
          gap: 16,
          flex: 1,
          minHeight: 0,
        }}
      >
        <ProductGrid
          onAdd={handleAdd}
          cartCountByProductID={cartCountByProductID}
        />
        <CartPanel
          state={cart}
          totals={totals}
          onClear={cart.clear}
          onCharge={handleCharge}
          submitting={submitting}
        />
      </Box>
    </Box>
  );
};
