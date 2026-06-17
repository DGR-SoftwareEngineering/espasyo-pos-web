import React, { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Dialog,
  Flex,
  IconButton,
  ScrollArea,
  Separator,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import { Cross2Icon, MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import type {
  SellableVariantDto,
  SellableAddOnGroupDto,
  SellableAddOnItemDto,
  SellableProductDto,
} from "core-lib/api/commons/types";
import { formatCurrency } from "../format";
import { usePublicSettings } from "core-lib/core/contexts";
import { useResolution } from "core-lib/core/hooks";
import { mobileDialogStyle, mobileContentStyle } from "core-lib/components/radix/dialog/mobileFullScreen";

export interface VariantAddOnConfirmPayload {
  variant: SellableVariantDto | null;
  addOnItems: { group: SellableAddOnGroupDto; item: SellableAddOnItemDto }[];
  quantity: number;
  unitPrice: number; // resolved (variant price OR base) + sum of add-on prices
}

interface Props {
  product: SellableProductDto;
  onConfirm: (payload: VariantAddOnConfirmPayload) => void;
  onClose: () => void;
}

export const VariantAddOnDialog: React.FC<Props> = ({
  product,
  onConfirm,
  onClose,
}) => {
  const { currencyCode } = usePublicSettings();
  const { isSmallMobile } = useResolution();

  const variants = useMemo(
    () =>
      [...(product.variants ?? [])].sort((a, b) =>
        a.displayOrder !== b.displayOrder
          ? a.displayOrder - b.displayOrder
          : a.name.localeCompare(b.name, undefined, { numeric: true }),
      ),
    [product.variants],
  );
  const groups = useMemo(
    () =>
      [...(product.addOnGroups ?? [])]
        .sort((a, b) =>
          a.displayOrder !== b.displayOrder
            ? a.displayOrder - b.displayOrder
            : a.name.localeCompare(b.name, undefined, { numeric: true }),
        )
        .map((g) => ({
          ...g,
          items: [...(g.items ?? [])].sort((a, b) =>
            a.displayOrder !== b.displayOrder
              ? a.displayOrder - b.displayOrder
              : a.name.localeCompare(b.name, undefined, { numeric: true }),
          ),
        })),
    [product.addOnGroups],
  );

  // Pre-select the first variant when variants exist
  const [variantId, setVariantId] = useState<string | null>(
    product.hasVariants ? variants[0]?.productVariantID ?? null : null,
  );
  const [selections, setSelections] = useState<Record<string, Set<string>>>(
    () => Object.fromEntries(groups.map((g) => [g.productAddOnGroupID, new Set<string>()])),
  );
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = variants.find((v) => v.productVariantID === variantId) ?? null;

  const basePrice = selectedVariant?.price ?? product.sellingPrice ?? 0;

  const addOnTotal = useMemo(() => {
    let sum = 0;
    for (const g of groups) {
      const chosen = selections[g.productAddOnGroupID];
      if (!chosen) continue;
      for (const item of g.items) {
        if (chosen.has(item.productAddOnItemID)) sum += item.additionalPrice;
      }
    }
    return sum;
  }, [selections, groups]);

  const unitTotal = basePrice + addOnTotal;
  const lineTotal = unitTotal * quantity;

  const variantOk = !product.hasVariants || !!selectedVariant;
  const requiredGroupOk = groups.every((g) => {
    if (!g.isRequired) return true;
    const count = selections[g.productAddOnGroupID]?.size ?? 0;
    return count >= g.minSelections;
  });
  const canConfirm = variantOk && requiredGroupOk && quantity > 0;

  const toggleItem = (group: SellableAddOnGroupDto, itemId: string) => {
    setSelections((prev) => {
      const next = { ...prev };
      const set = new Set(next[group.productAddOnGroupID] ?? new Set<string>());
      if (set.has(itemId)) {
        set.delete(itemId);
      } else {
        if (set.size >= group.maxSelections) {
          // Single-select group — replace current selection
          if (group.maxSelections === 1) set.clear();
          else return prev; // at max, ignore
        }
        set.add(itemId);
      }
      next[group.productAddOnGroupID] = set;
      return next;
    });
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    const chosenAddOns: { group: SellableAddOnGroupDto; item: SellableAddOnItemDto }[] = [];
    for (const g of groups) {
      const set = selections[g.productAddOnGroupID];
      if (!set) continue;
      for (const item of g.items) {
        if (set.has(item.productAddOnItemID))
          chosenAddOns.push({ group: g, item });
      }
    }
    onConfirm({
      variant: selectedVariant,
      addOnItems: chosenAddOns,
      quantity,
      unitPrice: unitTotal,
    });
  };

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content
        style={{
          ...(isSmallMobile
            ? mobileDialogStyle
            : { maxWidth: 520, borderRadius: "var(--radius-3)" }),
          padding: 0,
        }}
      >
        {/* Header */}
        <Flex
          align="center"
          justify="between"
          p="4"
          style={{
            borderBottom: "1px solid var(--gray-a4)",
            ...(isSmallMobile ? { flexShrink: 0 } : {}),
          }}
        >
          <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
            <Dialog.Title>
              <Text size="4" weight="bold" as="div" truncate>
                {product.name}
              </Text>
            </Dialog.Title>
            {product.categoryName && (
              <Text size="1" color="gray">
                {product.categoryName}
              </Text>
            )}
          </Flex>
          <IconButton
            size="2"
            variant="ghost"
            color="gray"
            aria-label="Close"
            onClick={onClose}
          >
            <Cross2Icon />
          </IconButton>
        </Flex>

        <ScrollArea
          type="auto"
          style={{
            ...(isSmallMobile
              ? mobileContentStyle
              : { maxHeight: "60vh" }),
          }}
        >
          <Box p="4">
            <Flex direction="column" gap="4">
              {/* Variants */}
              {product.hasVariants && variants.length > 0 && (
                <Flex direction="column" gap="2">
                  <Text size="2" weight="bold">
                    Size
                  </Text>
                  <Flex gap="2" wrap="wrap">
                    {variants.map((v) => {
                      const active = v.productVariantID === variantId;
                      const variantStockOut =
                        v.hasOwnRecipe && v.maxProductionFromVariantRecipe === 0;
                      const tooltipContent =
                        variantStockOut && v.variantBottleneckIngredients.length > 0
                          ? `Out of stock: ${v.variantBottleneckIngredients.join(", ")}`
                          : variantStockOut
                            ? "Out of stock for this variant"
                            : undefined;

                      const btn = (
                        <button
                          type="button"
                          onClick={() => setVariantId(v.productVariantID)}
                          style={{
                            cursor: "pointer",
                            padding: "10px 14px",
                            borderRadius: 12,
                            border: active
                              ? "2px solid var(--indigo-9)"
                              : variantStockOut
                                ? "1px solid var(--red-a6)"
                                : "1px solid var(--gray-a5)",
                            background: active
                              ? "var(--indigo-a3)"
                              : variantStockOut
                                ? "var(--red-a2)"
                                : "var(--color-panel-solid)",
                            color: active ? "var(--indigo-12)" : "var(--gray-12)",
                            fontWeight: 600,
                            transition: "all 0.12s ease",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 4,
                            minWidth: 80,
                          }}
                        >
                          <Text size="2" weight="bold">
                            {v.name}
                          </Text>
                          <Text size="1" color="gray">
                            {formatCurrency(v.price, currencyCode)}
                          </Text>
                          {variantStockOut && (
                            <Badge color="red" variant="soft" size="1">
                              Out of stock
                            </Badge>
                          )}
                        </button>
                      );

                      return tooltipContent ? (
                        <Tooltip key={v.productVariantID} content={tooltipContent}>
                          {btn}
                        </Tooltip>
                      ) : (
                        <React.Fragment key={v.productVariantID}>
                          {btn}
                        </React.Fragment>
                      );
                    })}
                  </Flex>
                </Flex>
              )}

              {/* Add-on groups */}
              {groups.map((g) => {
                const selectedSet =
                  selections[g.productAddOnGroupID] ?? new Set<string>();
                const count = selectedSet.size;
                const atMax = count >= g.maxSelections;
                const required = g.isRequired;
                const labelSuffix = required
                  ? `required • ${g.minSelections}${
                      g.maxSelections > g.minSelections
                        ? `–${g.maxSelections}`
                        : ""
                    }`
                  : `optional${
                      g.maxSelections > 1 ? ` • max ${g.maxSelections}` : ""
                    }`;

                return (
                  <Flex
                    key={g.productAddOnGroupID}
                    direction="column"
                    gap="2"
                    pt="2"
                    style={{ borderTop: "1px dashed var(--gray-a4)" }}
                  >
                    <Flex align="center" justify="between" gap="2">
                      <Text size="2" weight="bold">
                        {g.name}
                      </Text>
                      <Badge
                        color={required ? "amber" : "gray"}
                        variant="soft"
                        size="1"
                      >
                        {labelSuffix}
                      </Badge>
                    </Flex>

                    <Flex direction="column" gap="1">
                      {g.items.map((item) => {
                        const checked = selectedSet.has(item.productAddOnItemID);
                        const dim = !checked && atMax && g.maxSelections > 1;
                        return (
                          <button
                            key={item.productAddOnItemID}
                            type="button"
                            onClick={() =>
                              toggleItem(g, item.productAddOnItemID)
                            }
                            disabled={dim}
                            style={{
                              cursor: dim ? "not-allowed" : "pointer",
                              opacity: dim ? 0.45 : 1,
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              padding: "10px 12px",
                              borderRadius: 10,
                              border: checked
                                ? "1px solid var(--indigo-a8)"
                                : "1px solid var(--gray-a5)",
                              background: checked
                                ? "var(--indigo-a2)"
                                : "var(--color-panel-solid)",
                              textAlign: "left",
                              transition: "all 0.12s ease",
                            }}
                          >
                            <Box
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: 4,
                                border: checked
                                  ? "2px solid var(--indigo-9)"
                                  : "1.5px solid var(--gray-a8)",
                                background: checked
                                  ? "var(--indigo-9)"
                                  : "transparent",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {checked && (
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 12 12"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M2 6.5 L5 9 L10 3"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </Box>
                            <Text size="2" weight="medium" style={{ flex: 1 }}>
                              {item.name}
                            </Text>
                            {item.additionalPrice > 0 && (
                              <Text size="1" color="indigo" weight="bold">
                                +{formatCurrency(item.additionalPrice, currencyCode)}
                              </Text>
                            )}
                          </button>
                        );
                      })}
                      {g.items.length === 0 && (
                        <Text size="1" color="gray">
                          No items in this group.
                        </Text>
                      )}
                    </Flex>
                  </Flex>
                );
              })}
            </Flex>
          </Box>
        </ScrollArea>

        {/* Footer */}
        <Box
          p="4"
          style={{
            borderTop: "1px solid var(--gray-a4)",
            background: "var(--gray-a1)",
            ...(isSmallMobile ? { flexShrink: 0 } : {}),
          }}
        >
          <Flex align="center" justify="between" gap="3" mb="3">
            <Flex align="center" gap="2">
              <Text size="1" color="gray" weight="medium">
                Qty
              </Text>
              <Flex
                align="center"
                gap="1"
                style={{
                  border: "1px solid var(--gray-a5)",
                  borderRadius: 8,
                  padding: 2,
                }}
              >
                <IconButton
                  size="1"
                  variant="ghost"
                  color="gray"
                  aria-label="Decrement"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <MinusIcon />
                </IconButton>
                <Text size="2" weight="bold" style={{ minWidth: 24, textAlign: "center" }}>
                  {quantity}
                </Text>
                <IconButton
                  size="1"
                  variant="ghost"
                  color="gray"
                  aria-label="Increment"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <PlusIcon />
                </IconButton>
              </Flex>
            </Flex>
            <Flex direction="column" align="end">
              <Text size="1" color="gray">
                Total
              </Text>
              <Text size="5" weight="bold" style={{ color: "var(--indigo-11)" }}>
                {formatCurrency(lineTotal, currencyCode)}
              </Text>
            </Flex>
          </Flex>

          <Separator size="4" mb="3" />

          <Flex justify="end" gap="2">
            <Button variant="soft" color="gray" onClick={onClose}>
              Cancel
            </Button>
            <Button
              color="indigo"
              disabled={!canConfirm}
              onClick={handleConfirm}
            >
              Add to Order
            </Button>
          </Flex>
        </Box>
      </Dialog.Content>
    </Dialog.Root>
  );
};
