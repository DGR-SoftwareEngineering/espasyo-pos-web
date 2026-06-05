"use client";
import React, { useMemo, useState } from "react";
import { Box, Checkbox, Flex, RadioGroup, Separator, Text } from "@radix-ui/themes";
import { Modal, PrimaryButton, useCart } from "core-lib/components/radix";
import { formatCurrency } from "core-lib/business/strings";
import {
  CustomerMenuAddOnItemDto,
  CustomerMenuItemDto,
} from "core-lib/api/commons/types";

interface Props {
  item: CustomerMenuItemDto;
  open: boolean;
  onClose: () => void;
}

/** Variant + add-on picker. Builds a cart line and adds it on confirm. */
export const MenuItemCustomizeDialog: React.FC<Props> = ({
  item,
  open,
  onClose,
}) => {
  const { addItem } = useCart();
  const hasVariants = item.variants.length > 0;

  const [variantId, setVariantId] = useState<string>(
    hasVariants ? item.variants[0]!.productVariantID : "",
  );
  const [addOnIds, setAddOnIds] = useState<Set<string>>(new Set());

  const selectedVariant = useMemo(
    () => item.variants.find((v) => v.productVariantID === variantId) ?? null,
    [item.variants, variantId],
  );

  const allAddOns = useMemo<CustomerMenuAddOnItemDto[]>(
    () => item.addOnGroups.flatMap((g) => g.items),
    [item.addOnGroups],
  );

  const selectedAddOns = useMemo(
    () => allAddOns.filter((a) => addOnIds.has(a.productAddOnItemID)),
    [allAddOns, addOnIds],
  );

  // Use sellingPrice for base price
  const basePrice = selectedVariant?.price ?? item.sellingPrice;
  
  // Use additionalPrice for add-ons (the correct field name from API)
  const unitPrice =
    basePrice + selectedAddOns.reduce((sum, a) => sum + (a.additionalPrice || 0), 0);

  const toggleAddOn = (id: string, checked: boolean) => {
    setAddOnIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleAdd = () => {
    const addOnsJson = selectedAddOns.length
      ? JSON.stringify(
          selectedAddOns.map((a) => ({
            AddOnItemID: a.productAddOnItemID,
            Name: a.name,
            Price: a.additionalPrice || 0,
          })),
        )
      : null;

    addItem({
      productID: item.productID,
      productVariantID: selectedVariant?.productVariantID ?? null,
      name: item.name,
      variantName: selectedVariant?.name ?? null,
      imageUrl: item.imageUrl,
      unitPrice: unitPrice,
      addOnsJson,
    });
    onClose();
    
    // Reset selections after adding
    setAddOnIds(new Set());
    if (hasVariants) {
      setVariantId(item.variants[0]!.productVariantID);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item.name}
      subtitle={item.description ?? undefined}
      maxWidth="sm"
      actions={
        <PrimaryButton onClick={handleAdd} size="3">
          Add to cart · {formatCurrency(unitPrice)}
        </PrimaryButton>
      }
    >
      {hasVariants && (
        <Box mb="4">
          <Text size="2" weight="bold" as="div" mb="2">
            Choose a size
          </Text>
          <RadioGroup.Root value={variantId} onValueChange={setVariantId}>
            <Flex direction="column" gap="2">
              {item.variants.map((v) => (
                <label key={v.productVariantID} style={{ cursor: "pointer" }}>
                  <Flex align="center" justify="between" gap="2">
                    <Flex align="center" gap="2">
                      <RadioGroup.Item value={v.productVariantID} />
                      <Text size="2">{v.name}</Text>
                    </Flex>
                    <Text size="2" weight="medium">
                      {formatCurrency(v.price)}
                    </Text>
                  </Flex>
                </label>
              ))}
            </Flex>
          </RadioGroup.Root>
        </Box>
      )}

      {item.addOnGroups.map((group) => (
        <Box key={group.productAddOnGroupID} mb="4">
          <Separator size="4" mb="3" />
          <Text size="2" weight="bold" as="div" mb="2">
            {group.name}
            {group.isRequired && (
              <Text size="1" color="red" ml="1">
                *
              </Text>
            )}
          </Text>
          <Flex direction="column" gap="2">
            {group.items.map((addOn) => (
              <label
                key={addOn.productAddOnItemID}
                style={{ cursor: "pointer" }}
              >
                <Flex align="center" justify="between" gap="2">
                  <Flex align="center" gap="2">
                    <Checkbox
                      checked={addOnIds.has(addOn.productAddOnItemID)}
                      onCheckedChange={(c) =>
                        toggleAddOn(addOn.productAddOnItemID, c === true)
                      }
                    />
                    <Text size="2">{addOn.name}</Text>
                  </Flex>
                  <Text size="2" weight="medium">
                    +{formatCurrency(addOn.additionalPrice || 0)}
                  </Text>
                </Flex>
              </label>
            ))}
          </Flex>
        </Box>
      ))}
    </Modal>
  );
};