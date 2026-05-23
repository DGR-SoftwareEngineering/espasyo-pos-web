import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertDialog, Box, Button, Callout, Flex, Heading, IconButton, Text } from "@radix-ui/themes";
import { InfoCircledIcon, ExitIcon } from "@radix-ui/react-icons";
import { FullscreenOutlined, LockOpenOutlined } from "@mui/icons-material";
import {
  useToastContext,
  usePublicSettings,
  useDialogContext,
} from "core-lib/core/contexts";
import { useApi, useApiCallback, useLogout } from "core-lib/core/hooks";
import { ConfettiCanvas, ConfettiHandle } from "core-lib/components/confetti";
import {
  CloseShiftParams,
  CreateSaleParams,
  PromoDto,
  SaleDetailDto,
  SellableProductDto,
  ShiftSummaryDto,
} from "core-lib/api/commons/types";
import type {
  PosChargePayload,
  PostSaleDialogData,
} from "core-lib/api/content/types/common";
import { DialogBox } from "core-lib/components/radix/dialog/DialogBox";
import { ProductGrid } from "./ProductGrid";
import { CartPanel } from "./CartPanel";
import { PromoSelectDialog } from "./PromoSelectDialog";
import { VariantAddOnDialog } from "./VariantAddOnDialog";
import { computeTotals, useCartState } from "./hooks";
import { SaleReceiptPrintable } from "../printables/SaleReceiptPrintable";
import { useTargetSales } from "./useTargetSales";
import { CloseShiftFormBlock } from "../../shift-management/forms/CloseShiftFormBlock";
import { CloseShiftForm } from "../../shift-management/forms/validation";

const MENU_ITEM_NO_RECIPE_CODE = "MENUITEM.NO_RECIPE";
const ERROR_CODE_PREFIX_RE = /^\[([A-Z][A-Z0-9._]*)\]\s*/;

const SALE_ERROR_FRIENDLY: Record<string, string> = {
  "SALE.VARIANT_REQUIRED":
    "Please pick a size/variant for this item before submitting.",
  "SALE.INVALID_VARIANT":
    "Selected variant is no longer available. The menu has been refreshed.",
  "SALE.INVALID_ADDON":
    "An add-on is no longer available. The menu has been refreshed.",
  "SALE.ADDON_REQUIRED":
    "A required add-on group still needs a selection.",
  "SALE.ADDON_EXCEEDED":
    "Too many add-ons selected for one group.",
};

// Persist per-day so confetti doesn't re-fire after page refresh
const CONFETTI_FIRED_KEY = "espasyo.pos.confettiFiredDate";
const getConfettiFiredToday = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CONFETTI_FIRED_KEY) === new Date().toISOString().split("T")[0];
};
const setConfettiFiredToday = () => {
  if (typeof window !== "undefined") {
    localStorage.setItem(CONFETTI_FIRED_KEY, new Date().toISOString().split("T")[0]);
  }
};

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
    if (SALE_ERROR_FRIENDLY[code]) {
      return SALE_ERROR_FRIENDLY[code];
    }
    return stripped;
  }
  return fallbackMessage ?? "Failed to complete sale";
};

export const PosRegisterBlock: React.FC = () => {
  const { showToast } = useToastContext();
  const { systemName, theme, currencyCode, pos, settingsMap } = usePublicSettings();
  const { openDialog } = useDialogContext();
  const { logout } = useLogout();
  const confettiRef = useRef<ConfettiHandle>(null);
  const [isPosMode, setIsPosMode] = useState(false);
  const [orderSource, setOrderSource] = useState<'store' | 'online'>('store');
  const targetSales = useTargetSales();

  // CSS-based fullscreen toggle — avoids the native requestFullscreen() API which
  // isolates the rendering layer and hides Radix UI portals (dialogs, dropdowns).
  const togglePosMode = useCallback(() => {
    setIsPosMode((prev) => !prev);
  }, []);

  // Close shift flow
  const [closeShiftConfirmOpen, setCloseShiftConfirmOpen] = useState(false);
  const [closeShiftFormOpen, setCloseShiftFormOpen] = useState(false);
  const [activeShiftSummary, setActiveShiftSummary] = useState<ShiftSummaryDto | null>(null);
  const [fetchingShift, setFetchingShift] = useState(false);
  const [closeShiftLoading, setCloseShiftLoading] = useState(false);

  const getActiveShiftCb = useApiCallback((api) => api.commons.getActiveShift());
  const closeShiftApiCb = useApiCallback((api, params: CloseShiftParams) =>
    api.commons.closeShift(params),
  );

  const handleConfirmCloseShift = useCallback(async () => {
    setFetchingShift(true);
    try {
      const res = await getActiveShiftCb.execute();
      const summary = res?.data?.response ?? null;
      setActiveShiftSummary(summary);
      setCloseShiftConfirmOpen(false);
      setCloseShiftFormOpen(true);
    } catch {
      showToast("Failed to load active shift", "error");
      setCloseShiftConfirmOpen(false);
    } finally {
      setFetchingShift(false);
    }
  }, [getActiveShiftCb, showToast]);

  const handleCloseShiftSubmit = useCallback(
    async (values: CloseShiftForm) => {
      if (!activeShiftSummary) return;
      setCloseShiftLoading(true);
      try {
        const params: CloseShiftParams = {
          cashierShiftID: activeShiftSummary.cashierShiftID,
          actualCash: values.actualCash,
          mpin: values.mpin,
          notes: values.notes || null,
        };
        const result = await closeShiftApiCb.execute(params);
        if (result?.data?.success) {
          showToast("Shift closed. Logging out…", "success");
          await logout();
          return;
        }
        const errorMsg =
          Array.isArray(result?.data?.errors) && result.data.errors.length > 0
            ? (result.data.errors as string[])[0]
            : result?.data?.message ?? "Failed to close shift";
        showToast(errorMsg, "error");
      } catch {
        showToast("Failed to close shift", "error");
      } finally {
        setCloseShiftLoading(false);
      }
    },
    [activeShiftSummary, closeShiftApiCb, logout, showToast],
  );

  const promoData = useApi((api) => api.commons.promoList());
  const activePromos = useMemo(
    () => (promoData.result?.data.response ?? []).filter((p) => p.status === "Active"),
    [promoData.result]
  );

  // Build a child→parent category lookup so we can do BFS-ancestry matching
  // for category-targeted promos (a promo on "Drinks" applies to products in
  // "Coffee" / "Milk Base" / etc. — see backend spec).
  const promoCategoriesData = useApi(
    (api) => api.commons.productCategoryList(),
    [],
  );
  const categoryParents = useMemo(() => {
    const m = new Map<string, string | null>();
    for (const c of promoCategoriesData.result?.data?.response ?? []) {
      m.set(c.productCategoryID, c.parentProductCategoryID);
    }
    return m;
  }, [promoCategoriesData.result]);

  const eligiblePromosFor = useCallback(
    (product: SellableProductDto): PromoDto[] => {
      if (activePromos.length === 0) return [];
      // Walk up the category tree starting from this product's direct category
      const ancestors = new Set<string>();
      let cur = product.categoryID ?? null;
      while (cur && !ancestors.has(cur)) {
        ancestors.add(cur);
        cur = categoryParents.get(cur) ?? null;
      }
      const seen = new Set<string>();
      const out: PromoDto[] = [];
      for (const promo of activePromos) {
        for (const item of promo.items) {
          const hitsProduct =
            !!item.productID && item.productID === product.productID;
          const hitsCategory =
            !!item.productCategoryID && ancestors.has(item.productCategoryID);
          if (hitsProduct || hitsCategory) {
            if (!seen.has(promo.promoID)) {
              seen.add(promo.promoID);
              out.push(promo);
            }
            break;
          }
        }
      }
      return out;
    },
    [activePromos, categoryParents],
  );
  const [promoDialogProduct, setPromoDialogProduct] = useState<SellableProductDto | null>(null);
  const [pickerProduct, setPickerProduct] = useState<SellableProductDto | null>(null);

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

  // Close POS mode on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPosMode) setIsPosMode(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPosMode]);

  const handleAdd = useCallback(
    (product: SellableProductDto) => {
      if (product.isOutOfStock && !pos.allowSales) return;
      const needsPicker =
        product.hasVariants || (product.addOnGroups?.length ?? 0) > 0;
      if (needsPicker) {
        setPickerProduct(product);
        return;
      }
      cart.addProduct(product);
    },
    [cart, pos.allowSales],
  );

  const submitSale = useCallback(
    async (payload: PosChargePayload) => {
      const params: CreateSaleParams = {
        items: cart.lines.map((l) => ({
          productID: l.productID,
          productVariantID: l.productVariantID ?? null,
          addOnItemIDs:
            l.addOnItemIDs && l.addOnItemIDs.length > 0 ? l.addOnItemIDs : null,
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
          const showPromoBadge =
            !!sale.promoID &&
            settingsMap.get("Promo.ShowBadgeOnPOS")?.value !== "false";
          if (showPromoBadge) {
            showToast("Promo discount applied to this order!", "success");
          }
          cart.clear();

          // Refresh daily total (non-blocking — don't await so it doesn't delay the dialog)
          targetSales.refresh().catch(() => {});

          // Wait for the charge dialog's close animation to finish before opening
          // the receipt dialog. Radix Dialog ignores open=true while still animating out.
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
          }, 350);

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
    [cart, createCb, showToast, openDialog, systemName, theme, currencyCode, pos, targetSales.refresh],
  );

  // Fire confetti exactly once per day when the daily target is first crossed
  useEffect(() => {
    if (
      pos.targetSalesEnabled &&
      pos.targetSalesConfettiEnabled &&
      pos.targetSalesAmountPerDay > 0 &&
      targetSales.reached &&
      !getConfettiFiredToday()
    ) {
      setConfettiFiredToday();
      confettiRef.current?.fire();
    }
  }, [targetSales.reached, pos]);

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
      style={
        isPosMode
          ? {
              position: "fixed",
              inset: 0,
              zIndex: 50,
              background: "var(--gray-2)",
              display: "flex",
              flexDirection: "column",
            }
          : undefined
      }
    >
      <ConfettiCanvas ref={confettiRef} />
      {isPosMode && (
        <Flex
          align="center"
          justify="between"
          p="3"
          style={{
            height: 60,
            background: "linear-gradient(135deg, var(--indigo-9), var(--violet-9))",
            borderBottom: "1px solid var(--indigo-a6)",
          }}
        >
          <Flex align="center" gap="3">
            {theme?.logoUrl ? (
              <img
                src={theme.logoUrl}
                alt={systemName}
                style={{
                  height: 40,
                  objectFit: "contain",
                }}
              />
            ) : (
              <Heading size="3" style={{ color: "white" }}>
                {systemName}
              </Heading>
            )}
            <Text size="2" style={{ color: "white", opacity: 0.9 }}>
              ⚡ POS Mode
            </Text>
          </Flex>
          <Flex align="center" gap="2">
            <Button
              variant="soft"
              color="red"
              size="2"
              onClick={() => setCloseShiftConfirmOpen(true)}
            >
              <LockOpenOutlined style={{ fontSize: 16 }} />
              End Shift
            </Button>
            <IconButton
              variant="soft"
              color="gray"
              onClick={togglePosMode}
              aria-label="Exit POS mode"
              title="Exit POS mode (or press Esc)"
            >
              <ExitIcon />
            </IconButton>
          </Flex>
        </Flex>
      )}
      <Box
        style={
          isPosMode
            ? {
                flex: 1,
                minHeight: 0,
                padding: 16,
                display: "flex",
                flexDirection: "column",
              }
            : {
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
              }
        }
      >
      {!isPosMode && !pos.allowSales && (
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

      {!isPosMode && (
        <Flex justify="end" align="center" gap="2">
          <Button
            variant="soft"
            color="red"
            size="2"
            onClick={() => setCloseShiftConfirmOpen(true)}
          >
            <LockOpenOutlined style={{ fontSize: 16 }} />
            End Shift
          </Button>
          <IconButton
            variant="soft"
            color="indigo"
            onClick={togglePosMode}
            aria-label="Enter POS mode"
            title="Enter fullscreen POS mode"
          >
            <FullscreenOutlined fontSize="small" />
          </IconButton>
        </Flex>
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
          eligiblePromosFor={eligiblePromosFor}
          onPromoClick={setPromoDialogProduct}
        />
        <CartPanel
          state={cart}
          totals={totals}
          onClear={cart.clear}
          onCharge={handleCharge}
          submitting={submitting}
          orderSource={orderSource}
          onOrderSourceChange={setOrderSource}
          targetSalesEnabled={targetSales.enabled && targetSales.targetAmount > 0}
          targetSalesCurrentAmount={targetSales.currentAmount}
          targetSalesTargetAmount={targetSales.targetAmount}
          targetSalesProgressPct={targetSales.progressPct}
          targetSalesReached={targetSales.reached}
        />
      </Box>
      </Box>

      {/* Close Shift — Confirmation */}
      <AlertDialog.Root
        open={closeShiftConfirmOpen}
        onOpenChange={(open) => { if (!open && !fetchingShift) setCloseShiftConfirmOpen(false); }}
      >
        <AlertDialog.Content style={{ maxWidth: 440, zIndex: 9999 }}>
          <AlertDialog.Title>End your shift?</AlertDialog.Title>
          <AlertDialog.Description size="2">
            Closing your shift will log you out automatically. Make sure all
            transactions are complete before proceeding.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray" disabled={fetchingShift}>
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <Button
              color="red"
              loading={fetchingShift}
              onClick={handleConfirmCloseShift}
            >
              <LockOpenOutlined style={{ fontSize: 16 }} />
              Close Shift &amp; Log Out
            </Button>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>

      {/* Close Shift — Form */}
      <DialogBox
        open={closeShiftFormOpen}
        onClose={(_e, _reason) => { if (!closeShiftLoading) setCloseShiftFormOpen(false); }}
        title="Close Shift"
        maxWidth="sm"
        disableDismiss={closeShiftLoading}
      >
        {closeShiftFormOpen && (
          <CloseShiftFormBlock
            onSubmit={handleCloseShiftSubmit}
            submitLoading={closeShiftLoading}
            initialValues={{ cashierShiftID: activeShiftSummary?.cashierShiftID ?? "" }}
            isInDialog
            shiftSummary={activeShiftSummary ?? undefined}
          />
        )}
      </DialogBox>

      {/* Promo Selection Dialog */}
      {promoDialogProduct && (
        <PromoSelectDialog
          product={promoDialogProduct}
          promos={eligiblePromosFor(promoDialogProduct)}
          onApply={(promo) => {
            cart.applyPromo(promoDialogProduct, promo);
            // Bundle promos with category-targeted items can't be auto-resolved
            // client-side — surface a hint so the cashier adds eligible items.
            if (
              promo.type === "Bundle" &&
              promo.items.some((i) => !!i.productCategoryID)
            ) {
              showToast(
                "Bundle includes category items — add eligible products to the cart manually. The discount applies at checkout.",
                "success",
              );
            }
            setPromoDialogProduct(null);
          }}
          onClose={() => setPromoDialogProduct(null)}
        />
      )}

      {/* Variant & Add-On Picker Dialog */}
      {pickerProduct && (
        <VariantAddOnDialog
          product={pickerProduct}
          onConfirm={(payload) => {
            cart.addProductWithOptions(pickerProduct, {
              productVariantID: payload.variant?.productVariantID ?? null,
              variantName: payload.variant?.name ?? null,
              unitPrice: payload.unitPrice,
              quantity: payload.quantity,
              addOnItems: payload.addOnItems.map(({ group, item }) => ({
                productAddOnGroupID: group.productAddOnGroupID,
                productAddOnItemID: item.productAddOnItemID,
                groupName: group.name,
                itemName: item.name,
                additionalPrice: item.additionalPrice,
              })),
            });
            setPickerProduct(null);
          }}
          onClose={() => setPickerProduct(null)}
        />
      )}
    </Box>
  );
};
