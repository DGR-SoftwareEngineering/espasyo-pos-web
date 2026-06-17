import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  ScrollArea,
  Separator,
  Spinner,
  Text,
} from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { EmojiEventsOutlined } from "@mui/icons-material";
import { useApiCallback } from "core-lib/core/hooks";
import { RedeemableProductDto } from "core-lib/api/crm";
import type { SellableProductDto, SellableVariantDto } from "core-lib/api/commons/types";
import { formatCurrency } from "../format";
import { usePublicSettings } from "core-lib/core/contexts";
import { useResolution } from "core-lib/core/hooks";
import { mobileDialogStyle, mobileContentStyle } from "core-lib/components/radix/dialog/mobileFullScreen";
import { AddProductOptions } from "./hooks";

interface RedeemRewardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerID: string;
  customerName: string;
  onSelectProduct: (product: RedeemableProductDto, options: AddProductOptions) => void;
  // New optional prop to specify which size to show (defaults to "12oz")
  targetSize?: string;
}

export const RedeemRewardDialog: React.FC<RedeemRewardDialogProps> = ({
  open,
  onOpenChange,
  customerID,
  customerName,
  onSelectProduct,
  targetSize = "12oz",
}) => {
  const { currencyCode } = usePublicSettings();
  const { isSmallMobile } = useResolution();

  const [products, setProducts] = useState<RedeemableProductDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCb = useApiCallback(async (api, id: string) =>
    api.crm.getRedeemableProducts(id),
  );

  const [sellableMap, setSellableMap] = useState<Map<string, SellableProductDto>>(new Map());
  const fetchSellablesCb = useApiCallback(async (api) =>
    api.commons.sellableProductList({ pageNumber: 1, pageSize: 500 }),
  );

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    setLoading(true);
    setError(null);
    setStep("list");
    setPendingProduct(null);
    setPendingSellable(null);

    Promise.all([
      fetchCb.execute(customerID),
      fetchSellablesCb.execute(),
    ])
      .then(([redeemRes, sellableRes]) => {
        if (cancelled) return;
        setProducts(redeemRes?.data?.response?.redeemableProducts ?? []);
        const items: SellableProductDto[] = sellableRes?.data?.response?.items ?? [];
        const map = new Map<string, SellableProductDto>();
        items.forEach((p) => map.set(p.productID, p));
        setSellableMap(map);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load redeemable products.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customerID]);

  const matchesTargetSize = useMemo(() => {
    const normalizedTarget = targetSize.toLowerCase().replace(/\s/g, '');
    
    return (variantName: string): boolean => {
      const normalizedVariant = variantName.toLowerCase().replace(/\s/g, '');
      return normalizedVariant === normalizedTarget || 
             normalizedVariant.includes(normalizedTarget) ||
             normalizedTarget.includes(normalizedVariant);
    };
  }, [targetSize]);

  const filterVariantsBySize = useCallback((variants: SellableVariantDto[]): SellableVariantDto[] => {
    return variants.filter(variant => matchesTargetSize(variant.name));
  }, [matchesTargetSize]);

  type Step = "list" | "customize";
  const [step, setStep] = useState<Step>("list");
  const [pendingProduct, setPendingProduct] = useState<RedeemableProductDto | null>(null);
  const [pendingSellable, setPendingSellable] = useState<SellableProductDto | null>(null);

  const filteredVariants = useMemo(() => {
    if (!pendingSellable) return [];
    const allVariants = [...(pendingSellable.variants ?? [])];
    const sortedVariants = allVariants.sort((a, b) =>
      a.displayOrder !== b.displayOrder
        ? a.displayOrder - b.displayOrder
        : a.name.localeCompare(b.name, undefined, { numeric: true }),
    );
    return filterVariantsBySize(sortedVariants);
  }, [pendingSellable, filterVariantsBySize]);

  const [variantId, setVariantId] = useState<string | null>(null);

  const hasMatchingVariants = filteredVariants.length > 0;

  useEffect(() => {
    if (pendingSellable?.hasVariants && hasMatchingVariants) {
      setVariantId(filteredVariants[0]?.productVariantID ?? null);
    } else if (pendingSellable?.hasVariants && !hasMatchingVariants) {
      setVariantId(null);
    }
  }, [pendingSellable, filteredVariants, hasMatchingVariants]);

  const selectedVariant = filteredVariants.find((v) => v.productVariantID === variantId) ?? null;
  const canConfirm = !!selectedVariant;

  const handleProductClick = (p: RedeemableProductDto) => {
    const sellable = sellableMap.get(p.productID);
    if (sellable?.hasVariants) {
      // Check if the product has any matching variants before proceeding
      const matchingVariants = filterVariantsBySize([...(sellable.variants ?? [])]);
      if (matchingVariants.length === 0) {
        // If no matching variants, you might want to show an error or skip to add without variant
        console.warn(`No ${targetSize} variant found for product: ${p.name}`);
        // Optionally: Show toast notification
        return;
      }
      setPendingProduct(p);
      setPendingSellable(sellable);
      setStep("customize");
    } else {
      onSelectProduct(p, {});
    }
  };

  const handleConfirm = () => {
    if (!pendingProduct || !canConfirm) return;
    onSelectProduct(pendingProduct, {
      productVariantID: selectedVariant?.productVariantID ?? null,
      variantName: selectedVariant?.name ?? null,
    });
  };

  const handleBack = () => {
    setStep("list");
    setPendingProduct(null);
    setPendingSellable(null);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        style={{
          ...(isSmallMobile
            ? mobileDialogStyle
            : { maxWidth: 480 }),
          padding: 0,
        }}
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Header */}
        <Flex
          align="center"
          gap="2"
          px="4"
          pt="4"
          pb="3"
          style={{
            borderBottom: "1px solid var(--gray-a4)",
            ...(isSmallMobile ? { flexShrink: 0 } : {}),
          }}
        >
          {step === "customize" && (
            <Button
              variant="ghost"
              color="gray"
              size="1"
              onClick={handleBack}
              style={{ marginRight: 2, padding: "4px 6px" }}
            >
              <ArrowLeftIcon />
            </Button>
          )}
          <EmojiEventsOutlined style={{ fontSize: 20, color: "var(--amber-11)" }} />
          <Flex direction="column" gap="0" style={{ flex: 1, minWidth: 0 }}>
            <Dialog.Title style={{ margin: 0 }}>
              <Text size="3" weight="bold">
                Redeem Free Drink
              </Text>
            </Dialog.Title>
            <Dialog.Description size="1" color="gray" style={{ margin: 0 }}>
              {step === "list" ? (
                <>Select a product for <strong>{customerName}</strong>.</>
              ) : (
                <>Choose size for <strong>{customerName}</strong> (only {targetSize} available).</>
              )}
            </Dialog.Description>
          </Flex>
        </Flex>

        {step === "list" && (
          <>
            <ScrollArea
              type="auto"
              style={{
                ...(isSmallMobile
                  ? mobileContentStyle
                  : { maxHeight: "60vh" }),
              }}
            >
              <Box p="4">
                {loading && (
                  <Flex justify="center" py="6">
                    <Spinner size="3" />
                  </Flex>
                )}

                {!loading && error && (
                  <Text color="red" size="2">
                    {error}
                  </Text>
                )}

                {!loading && !error && products.length === 0 && (
                  <Text color="gray" size="2">
                    No redeemable products available.
                  </Text>
                )}

                {!loading && !error && products.length > 0 && (
                  <Flex direction="column" gap="2">
                    {products.map((p) => {
                      const sellable = sellableMap.get(p.productID);
                      const hasVariants = sellable?.hasVariants ?? false;
                      // Check if product has matching variants
                      const hasMatchingSize = hasVariants && 
                        filterVariantsBySize([...(sellable?.variants ?? [])]).length > 0;
                      
                      // If product has variants but none match the target size, show as disabled
                      const isDisabled = hasVariants && !hasMatchingSize;
                      
                      return (
                        <Card
                          key={p.productID}
                          variant="surface"
                          style={{ 
                            cursor: isDisabled ? "not-allowed" : "pointer",
                            opacity: isDisabled ? 0.5 : 1,
                          }}
                          onClick={() => !isDisabled && handleProductClick(p)}
                        >
                          <Flex align="center" gap="3">
                            {p.imageUrl && (
                              <Box
                                style={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: 8,
                                  overflow: "hidden",
                                  flexShrink: 0,
                                }}
                              >
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              </Box>
                            )}
                            <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 0 }}>
                              <Flex align="center" gap="2" wrap="wrap">
                                <Text size="2" weight="bold" truncate>
                                  {p.name}
                                </Text>
                                <Badge color="green" variant="soft" size="1">
                                  FREE
                                </Badge>
                                {hasVariants && hasMatchingSize && (
                                  <Badge color="indigo" variant="outline" size="1">
                                    {targetSize} only
                                  </Badge>
                                )}
                                {isDisabled && (
                                  <Badge color="red" variant="soft" size="1">
                                    No {targetSize} variant
                                  </Badge>
                                )}
                              </Flex>
                              <Flex align="center" gap="2">
                                <Badge color="gray" variant="outline" size="1">
                                  {p.productCategoryName}
                                </Badge>
                                <Text size="1" color="gray" style={{ textDecoration: "line-through" }}>
                                  {formatCurrency(p.unitPrice, currencyCode)}
                                </Text>
                              </Flex>
                            </Flex>
                          </Flex>
                        </Card>
                      );
                    })}
                  </Flex>
                )}
              </Box>
            </ScrollArea>

            <Box px="4" pb="4" pt="2" style={isSmallMobile ? mobileFooterStyle : undefined}>
              <Flex gap="3" justify="end">
                <Dialog.Close>
                  <Button variant="soft" color="gray">
                    Cancel
                  </Button>
                </Dialog.Close>
              </Flex>
            </Box>
          </>
        )}

        {step === "customize" && pendingProduct && pendingSellable && (
          <>
            <ScrollArea
              type="auto"
              style={{
                ...(isSmallMobile
                  ? mobileContentStyle
                  : { maxHeight: "60vh" }),
              }}
            >
              <Box p="4">
                {/* Selected product summary */}
                <Flex align="center" gap="3" mb="4">
                  {pendingProduct.imageUrl && (
                    <Box
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={pendingProduct.imageUrl}
                        alt={pendingProduct.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Box>
                  )}
                  <Flex direction="column" gap="1">
                    <Flex align="center" gap="2">
                      <Text size="3" weight="bold">
                        {pendingProduct.name}
                      </Text>
                      <Badge color="green" variant="solid" size="1">
                        FREE
                      </Badge>
                    </Flex>
                    <Text size="1" color="gray">
                      {pendingProduct.productCategoryName}
                    </Text>
                  </Flex>
                </Flex>

                {/* Variant / size picker - showing only target size variants */}
                {filteredVariants.length > 0 ? (
                  <Flex direction="column" gap="3">
                    <Flex align="center" justify="between">
                      <Text size="2" weight="bold">
                        Size ({targetSize})
                      </Text>
                      <Text size="1" color="gray">
                        Only {targetSize} is available for redemption
                      </Text>
                    </Flex>
                    <Flex gap="2" wrap="wrap">
                      {filteredVariants.map((v) => {
                        const active = v.productVariantID === variantId;
                        return (
                          <button
                            key={v.productVariantID}
                            type="button"
                            onClick={() => setVariantId(v.productVariantID)}
                            style={{
                              cursor: "pointer",
                              padding: "10px 14px",
                              borderRadius: 12,
                              border: active
                                ? "2px solid var(--indigo-9)"
                                : "1px solid var(--gray-a5)",
                              background: active
                                ? "var(--indigo-a3)"
                                : "var(--color-panel-solid)",
                              color: active ? "var(--indigo-12)" : "var(--gray-12)",
                              fontWeight: 600,
                              transition: "all 0.12s ease",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 4,
                              minWidth: 72,
                            }}
                          >
                            <Text size="2" weight="bold">
                              {v.name}
                            </Text>
                            <Text size="1" color="gray" style={{ textDecoration: "line-through" }}>
                              {formatCurrency(v.price, currencyCode)}
                            </Text>
                          </button>
                        );
                      })}
                    </Flex>
                  </Flex>
                ) : (
                  <Flex direction="column" align="center" gap="2" py="4">
                    <Text size="2" color="red">
                      No {targetSize} variant found for this product.
                    </Text>
                    <Button variant="soft" color="gray" onClick={handleBack}>
                      Go back
                    </Button>
                  </Flex>
                )}
              </Box>
            </ScrollArea>

            {/* Footer */}
            <Box
              px="4"
              pb="4"
              pt="3"
              style={{
                borderTop: "1px solid var(--gray-a4)",
                background: "var(--gray-a1)",
                ...(isSmallMobile ? mobileFooterStyle : {}),
              }}
            >
              <Separator size="4" mb="3" />
              <Flex justify="between" align="center" gap="3">
                <Button variant="soft" color="gray" onClick={handleBack}>
                  <ArrowLeftIcon />
                  Back
                </Button>
                <Flex align="center" gap="2">
                  <Badge color="green" variant="solid" size="2">
                    FREE
                  </Badge>
                  <Button
                    color="indigo"
                    disabled={!canConfirm}
                    onClick={handleConfirm}
                  >
                    Add Free Drink
                  </Button>
                </Flex>
              </Flex>
            </Box>
          </>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
};