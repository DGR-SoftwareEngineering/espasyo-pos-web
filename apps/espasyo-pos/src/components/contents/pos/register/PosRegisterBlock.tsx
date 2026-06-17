import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertDialog, Box, Button, Callout, Flex, Heading, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { InfoCircledIcon, ExitIcon } from "@radix-ui/react-icons";
import { FullscreenOutlined, LockOpenOutlined, PointOfSaleRounded, ReceiptLongOutlined } from "@mui/icons-material";
import {
  useToastContext,
  usePublicSettings,
  useDialogContext,
  useOfflineMode,
} from "core-lib/core/contexts";
import { useApi, useApiCallback, useLogout, useCashDrawer, useResolution } from "core-lib/core/hooks";
import { extractApiError } from "core-lib/business/errorUtils";
import { mobileDialogStyle, mobileFooterStyle } from "core-lib/components/radix/dialog/mobileFullScreen";
import { addOfflineSale } from "core-lib/core/services/offlineDb";
import { ConfettiCanvas, ConfettiHandle } from "core-lib/components/confetti";
import { cashDrawerService } from "core-lib/business/cashDrawer";
import {
  CloseShiftParams,
  CreateSaleParams,
  CustomerPromoProductDto,
  CustomerPromoProductItemDto,
  PromoDto,
  PromoListResponse,
  SaleDetailDto,
  SalesPaymentMethodDto,
  SellableProductDto,
  ShiftSummaryDto,
} from "core-lib/api/commons/types";
import { RedeemableProductDto } from "core-lib/api/crm";
import type {
  PosChargePayload,
  PostSaleDialogData,
} from "core-lib/api/content/types/common";
import { DialogBox } from "core-lib/components/radix/dialog/DialogBox";
import { ProductGrid } from "./ProductGrid";
import { CartPanel } from "./CartPanel";
import { PromoSelectDialog } from "./PromoSelectDialog";
import { VariantAddOnDialog } from "./VariantAddOnDialog";
import { AddProductOptions, computeTotals, useCartState } from "./hooks";
import { SaleReceiptPrintable } from "../printables/SaleReceiptPrintable";
import { useTargetSales } from "./useTargetSales";
import { TargetSalesDetailDialog } from "./TargetSalesDetailDialog";
import { PosOrdersDialog } from "./PosOrdersDialog";
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

// Persist per-day so confetti doesn't re-fire after page refresh.
// The ".v2" suffix is a one-time cache-buster: it invalidates any stale flag
// that was set before the fire/flag ordering below was corrected.
const CONFETTI_FIRED_KEY = "espasyo.pos.confettiFiredDate.v2";
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
  const { isSupported: drawerSupported, isConnected: drawerConnected, testKick: openDrawer } = useCashDrawer();
  const confettiRef = useRef<ConfettiHandle>(null);
  const { isSmallMobile, isTablet, isDesktop } = useResolution();
  const [isPosMode, setIsPosMode] = useState(false);
  const [orderSource, setOrderSource] = useState<'store' | 'online'>('store');
  const [addedExclusiveIds, setAddedExclusiveIds] = useState<Set<string>>(new Set());
  const targetSales = useTargetSales();
  const [targetDialogOpen, setTargetDialogOpen] = useState(false);
  const [ordersDialogOpen, setOrdersDialogOpen] = useState(false);
  const { isOnline, refreshPendingCount } = useOfflineMode();

  // Browser fullscreen toggle
  const togglePosMode = useCallback(async () => {
    if (!isPosMode) {
      setIsPosMode(true);
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // User denied or browser doesn't support — CSS overlay still works
      }
    } else {
      setIsPosMode(false);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, [isPosMode]);

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
        showToast(extractApiError(result, "Failed to close shift"), "error");
      } catch {
        showToast("Failed to close shift", "error");
      } finally {
        setCloseShiftLoading(false);
      }
    },
    [activeShiftSummary, closeShiftApiCb, logout, showToast],
  );

  // ──── Cart state ──────────────────────────────────────────────────────
  const cart = useCartState(pos.defaultTaxRate);

  // Use a ref to always point to the latest cart without triggering re-renders
  const cartRef = useRef(cart);
  cartRef.current = cart;

  const totals = useMemo(
    () => computeTotals(cart.lines, cart.orderDiscount, cart.taxRate, []),
    [cart.lines, cart.orderDiscount, cart.taxRate],
  );

  const cartCountByProductID = useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of cart.lines) map[l.productID] = l.quantity;
    return map;
  }, [cart.lines]);

  // ──── Promos ──────────────────────────────────────────────────────────
  const promoData = useApi((api) => api.commons.promoList());
  const sellableProductsApi = useApi(
    (api) => api.commons.sellableProductList({ pageNumber: 1, pageSize: 500 }),
  );
  const sellableProducts = sellableProductsApi.result?.data?.response?.items ?? [];

  // Filter: show only active promos that are NOT customer-specific
  // (customer-specific promos only appear when that customer is selected in cart)
  const generalPromos = useMemo(
    () => (promoData.result?.data.response ?? [])
      .filter((p) => p.status === "Active" && !p.isCustomerSpecific),
    [promoData.result],
  );

  // Customer-specific promos: loaded when a customer is attached to the cart
  const [customerPromos, setCustomerPromos] = useState<PromoDto[]>([]);
  const promoAssignedCb = useApiCallback(
    async (api, customerId: string) =>
      api.commons.promoAssignedForCustomer(customerId),
  );

  useEffect(() => {
    const customerId = cart.selectedCustomer?.customerID;
    if (!customerId) {
      setCustomerPromos([]);
      return;
    }
    promoAssignedCb.execute(customerId).then((res) => {
      const promos = (res?.data as PromoListResponse | undefined)?.response ?? [];
      setCustomerPromos(promos.filter((p) => p.status === "Active"));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.selectedCustomer?.customerID]);

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
      const allPromos = [...generalPromos, ...customerPromos];
      if (allPromos.length === 0) return [];
      const ancestors = new Set<string>();
      let cur = product.categoryID ?? null;
      while (cur && !ancestors.has(cur)) {
        ancestors.add(cur);
        cur = categoryParents.get(cur) ?? null;
      }
      const seen = new Set<string>();
      const out: PromoDto[] = [];
      for (const promo of allPromos) {
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
    [generalPromos, customerPromos, categoryParents],
  );

  // ──── Dialog state ────────────────────────────────────────────────────
  const [promoDialogProduct, setPromoDialogProduct] = useState<SellableProductDto | null>(null);
  const [pickerProduct, setPickerProduct] = useState<SellableProductDto | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const createCb = useApiCallback(async (api, args: CreateSaleParams) =>
    api.commons.createSale(args),
  );
  const confirmRedeemCb = useApiCallback(async (api, id: string) =>
    api.crm.confirmRedeem(id),
  );

  // Close POS mode on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPosMode) {
        setIsPosMode(false);
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPosMode]);

  // Sync state when user exits fullscreen via browser
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsPosMode(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // ──── Stable callbacks (use cartRef to avoid depending on `cart`) ─────

  const handleAdd = useCallback(
    (product: SellableProductDto) => {
      if (product.isOutOfStock && !pos.allowSales) return;
      const needsPicker =
        product.hasVariants || (product.addOnGroups?.length ?? 0) > 0;
      if (needsPicker) {
        setPickerProduct(product);
        return;
      }
      cartRef.current.addProduct(product);
    },
    [pos.allowSales],
  );

  const handleRedeemProductSelected = useCallback(
    (product: RedeemableProductDto, options: AddProductOptions) => {
      cartRef.current.addRedeemedProduct(product, options);
    },
    [],
  );

  const handleAttachPromoProduct = useCallback(
    (product: CustomerPromoProductItemDto, promo: CustomerPromoProductDto) => {
      cartRef.current.applyPromoProduct(product, promo);
      setAddedExclusiveIds(prev => new Set(prev).add(product.productID));
    },
    [],
  );

  const submitSale = useCallback(
    async (payload: PosChargePayload) => {
      const currentCart = cartRef.current;
      const params: CreateSaleParams = {
        customerID: currentCart.selectedCustomer?.customerID ?? null,
        items: currentCart.lines.map((l) => ({
          productID: l.productID,
          productVariantID: l.productVariantID ?? null,
          addOnItemIDs:
            l.addOnItemIDs && l.addOnItemIDs.length > 0 ? l.addOnItemIDs : null,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          discount: l.discount > 0 ? l.discount : null,
          isRedemptionLine: l.isRedeemed ?? false,
          isPromoFreeLine: !!l.promoID && l.unitPrice === 0,
        })),
        discountAmount: currentCart.orderDiscount > 0 ? currentCart.orderDiscount : null,
        taxRate: currentCart.taxRate,
        payments: payload.payments.map((p) => ({
          method: p.method,
          amount: p.amount,
          tendered: p.tendered,
          referenceNumber: p.referenceNumber,
        })),
        notes: payload.notes,
      };

      // Offline path — queue sale in IndexedDB
      if (!isOnline) {
        const localId = crypto.randomUUID();
        await addOfflineSale({
          localId,
          createdAt: new Date().toISOString(),
          payload: params,
          syncStatus: "pending",
        });
        await refreshPendingCount();
        showToast(`Sale queued offline (${localId.slice(0, 8)}…)`, "success");
        currentCart.clear();
        return;
      }

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

          const hasRedeemedLine = currentCart.lines.some((l) => l.isRedeemed);
          const redeemCustomerID = currentCart.selectedCustomer?.customerID ?? null;

          currentCart.clear();

          if (hasRedeemedLine && redeemCustomerID) {
            confirmRedeemCb.execute(redeemCustomerID).catch(() => {
              showToast(
                "Sale recorded but reward confirmation failed. Notify a manager.",
                "error",
              );
            });
          }

          const hasCash = params.payments.some(
            (p) => p.method === SalesPaymentMethodDto.Cash,
          );
          if (hasCash && pos.cashDrawerEnabled && cashDrawerService.isConnected()) {
            cashDrawerService.kickDrawer().catch(() => {});
          }

          targetSales.refresh().catch(() => {});

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
    [createCb, showToast, openDialog, systemName, theme, currencyCode, pos, targetSales.refresh, settingsMap, confirmRedeemCb, isOnline, refreshPendingCount],
  );

  // Fire confetti exactly once per day when the daily target is first crossed.
  // Fire first, then persist the flag — so a fire that never lands (e.g. canvas
  // not yet mounted) doesn't permanently suppress confetti for the rest of the day.
  useEffect(() => {
    if (
      pos.targetSalesEnabled &&
      pos.targetSalesConfettiEnabled &&
      pos.targetSalesAmountPerDay > 0 &&
      targetSales.reached &&
      !getConfettiFiredToday() &&
      confettiRef.current
    ) {
      confettiRef.current.fire();
      setConfettiFiredToday();
    }
  }, [targetSales.reached, pos]);

  useEffect(() => {
    if (cart.lines.length === 0 || !cart.selectedCustomer) {
      setAddedExclusiveIds(new Set());
    }
  }, [cart.lines.length, cart.selectedCustomer]);

  const handleCharge = useCallback(() => {
    const currentCart = cartRef.current;
    if (currentCart.lines.length === 0) return;
    openDialog({
      title: "Complete sale",
      dialogContentType: "PosCharge",
      data: {
        totalAmount: totals.totalAmount,
        subtotal: totals.subtotal,
        discountAmount: totals.discountTotal,
        taxRate: currentCart.taxRate,
        taxAmount: totals.taxAmount,
        itemCount: currentCart.lines.reduce((s, l) => s + l.quantity, 0),
        onConfirm: submitSale,
      },
    });
  }, [totals, openDialog, submitSale]);

  // ──── Render ──────────────────────────────────────────────────────────

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

      <TargetSalesDetailDialog
        open={targetDialogOpen}
        onClose={() => setTargetDialogOpen(false)}
        currentAmount={targetSales.currentAmount}
        targetAmount={targetSales.targetAmount}
        progressPct={targetSales.progressPct}
        reached={targetSales.reached}
        currencyCode={currencyCode}
        summary={targetSales.summary}
      />

      <PosOrdersDialog
        open={ordersDialogOpen}
        onClose={() => setOrdersDialogOpen(false)}
      />

      {isPosMode && (
        <Flex
          align="center"
          justify="between"
          p="3"
          style={{
            height: 60,
            background: "linear-gradient(135deg, var(--espasyo-primary, var(--indigo-9)), var(--espasyo-secondary, var(--violet-9)))",
            borderBottom: "1px solid rgba(0,0,0,0.15)",
          }}
        >
          <Flex align="center" gap="3">
            {theme?.logoUrl ? (
              <img
                src={theme.logoUrl}
                alt={systemName}
                style={{ height: 40, objectFit: "contain" }}
              />
            ) : (
              <Heading size="3" style={{ color: "white" }}>{systemName}</Heading>
            )}
            <Text size="2" style={{ color: "white", opacity: 0.9 }}>⚡ POS Mode</Text>
            {drawerSupported && (
              <Flex align="center" gap="1">
                <Box
                  style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: drawerConnected ? "var(--green-9)" : "var(--gray-6)",
                    boxShadow: drawerConnected ? "0 0 0 2px var(--green-a4)" : undefined,
                    flexShrink: 0,
                  }}
                />
                <Text size="1" style={{ color: "var(--white-a9)" }}>
                  {drawerConnected ? "Drawer" : "No drawer"}
                </Text>
              </Flex>
            )}
          </Flex>
          <Flex align="center" gap="2">
            {drawerSupported && (
              <Tooltip content="Open cash drawer">
                <IconButton variant="ghost" color="gray" size="2" disabled={!drawerConnected} onClick={openDrawer} style={{ color: "var(--white-a11)" }}>
                  <PointOfSaleRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip content="View recent and offline orders">
              <Button variant="ghost" size="2" onClick={() => setOrdersDialogOpen(true)} style={{ color: "var(--white-a11)" }}>
                <ReceiptLongOutlined style={{ fontSize: 16 }} /> Orders
              </Button>
            </Tooltip>
            <Button
              variant="ghost"
              size="2"
              disabled={!isOnline}
              title={!isOnline ? "End Shift disabled while offline" : undefined}
              onClick={() => setCloseShiftConfirmOpen(true)}
              style={{ color: isOnline ? "var(--red-4)" : undefined }}
            >
              <LockOpenOutlined style={{ fontSize: 16 }} /> End Shift
            </Button>
            <IconButton variant="ghost" color="gray" onClick={togglePosMode} aria-label="Exit POS mode" title="Exit POS mode (or press Esc)" style={{ color: "var(--white-a11)" }}>
              <ExitIcon />
            </IconButton>
          </Flex>
        </Flex>
      )}
      <Box
        style={{
          ...(isSmallMobile ? { maxWidth: "100vw", overflowX: "hidden" } : {}),
          ...(isPosMode
            ? { flex: 1, minHeight: 0, padding: 16, display: "flex", flexDirection: "column" }
            : {
                height: "calc(100vh - 120px)", minHeight: 560, margin: "-24px -32px", padding: 20,
                background: "radial-gradient(ellipse 80% 60% at 50% 0%, var(--indigo-a2) 0%, transparent 60%), var(--gray-2)",
                position: "relative", display: "flex", flexDirection: "column", gap: 12,
              }),
        }}
      >
        {!isPosMode && !pos.allowSales && (
          <Callout.Root color="red" variant="surface" size="1">
            <Callout.Icon><InfoCircledIcon /></Callout.Icon>
            <Callout.Text>
              Sales are currently disabled by admin settings. The register is visible but cannot record new transactions.
            </Callout.Text>
          </Callout.Root>
        )}

        {!isPosMode && (
          <Flex justify="end" align="center" gap="2">
            <Tooltip content="View recent and offline orders">
              <Button variant="soft" color="gray" size="2" onClick={() => setOrdersDialogOpen(true)}>
                <ReceiptLongOutlined style={{ fontSize: 16 }} /> Orders
              </Button>
            </Tooltip>
            <Button
              variant="soft"
              color="red"
              size="2"
              disabled={!isOnline}
              title={!isOnline ? "End Shift disabled while offline" : undefined}
              onClick={() => setCloseShiftConfirmOpen(true)}
            >
              <LockOpenOutlined style={{ fontSize: 16 }} /> End Shift
            </Button>
            <IconButton variant="soft" color="indigo" onClick={togglePosMode} aria-label="Enter POS mode" title="Enter fullscreen POS mode">
              <FullscreenOutlined fontSize="small" />
            </IconButton>
          </Flex>
        )}

        <Box
          style={
            isSmallMobile
              ? { display: "flex", flexDirection: "column", gap: 12, flex: 1, minHeight: 0 }
              : { display: "grid", gridTemplateColumns: isTablet ? "minmax(0, 1fr) minmax(280px, 320px)" : "minmax(0, 1fr) minmax(380px, 440px)", gap: 16, flex: 1, minHeight: 0 }
          }
        >
          <Box style={isSmallMobile ? { flex: 1, minHeight: 0, overflow: "hidden" } : { minHeight: 0, display: "contents" }}>
            <ProductGrid
              onAdd={handleAdd}
              cartCountByProductID={cartCountByProductID}
              eligiblePromosFor={eligiblePromosFor}
              onPromoClick={setPromoDialogProduct}
            />
          </Box>
          <Box style={isSmallMobile ? { flex: "0 0 auto", maxHeight: "50vh", overflow: "hidden", minHeight: 0 } : { minHeight: 0, display: "contents" }}>
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
              onTargetSalesClick={targetSales.enabled ? () => setTargetDialogOpen(true) : undefined}
              onRedeemProductSelected={handleRedeemProductSelected}
              onAttachPromoProduct={handleAttachPromoProduct}
              addedExclusiveIds={addedExclusiveIds}
            />
          </Box>
        </Box>
      </Box>

      {/* Close Shift — Confirmation */}
      <AlertDialog.Root open={closeShiftConfirmOpen} onOpenChange={(open) => { if (!open && !fetchingShift) setCloseShiftConfirmOpen(false); }}>
        <AlertDialog.Content style={isSmallMobile ? mobileDialogStyle : { maxWidth: 440, zIndex: 9999 }}>
          <AlertDialog.Title>End your shift?</AlertDialog.Title>
          <AlertDialog.Description size="2">
            Closing your shift will log you out automatically. Make sure all transactions are complete before proceeding.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end" style={isSmallMobile ? mobileFooterStyle : undefined}>
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray" disabled={fetchingShift}>Cancel</Button>
            </AlertDialog.Cancel>
            <Button color="red" loading={fetchingShift} onClick={handleConfirmCloseShift}>
              <LockOpenOutlined style={{ fontSize: 16 }} /> Close Shift &amp; Log Out
            </Button>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>

      {/* Close Shift — Form */}
      <DialogBox open={closeShiftFormOpen} onClose={(_e, _reason) => { if (!closeShiftLoading) setCloseShiftFormOpen(false); }} title="Close Shift" maxWidth="sm" disableDismiss={closeShiftLoading}>
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
            const productMapLocal = new Map(sellableProducts.map((p) => [p.productID, p]));
            const blocked = promo.items
              .filter((i) => !!i.productID && !i.isFreeItem)
              .filter((i) => {
                const p = productMapLocal.get(i.productID!);
                return p !== undefined && p.currentStock <= 0;
              });
            if (blocked.length > 0) {
              showToast(
                `Cannot apply promo: ${blocked.map((i) => i.productName ?? i.productID).join(", ")} is out of stock.`,
                "error",
              );
              setPromoDialogProduct(null);
              return;
            }
            cartRef.current.applyPromo(promoDialogProduct, promo, sellableProducts);
            if (promo.type === "Bundle" && promo.items.some((i) => !!i.productCategoryID)) {
              showToast("Bundle includes category items — add eligible products to the cart manually. The discount applies at checkout.", "success");
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
            cartRef.current.addProductWithOptions(pickerProduct, {
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