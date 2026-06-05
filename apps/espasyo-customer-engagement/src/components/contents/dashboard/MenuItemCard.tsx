"use client";
import React, { useState } from "react";
import { Badge, Box, Flex, IconButton, Text } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { useCart } from "core-lib/components/radix";
import { formatCurrency } from "core-lib/business/strings";
import { CustomerMenuItemDto } from "core-lib/api/commons/types";
import { MenuItemCustomizeDialog } from "./MenuItemCustomizeDialog";

interface Props {
  item: CustomerMenuItemDto;
}

export const MenuItemCard: React.FC<Props> = ({ item }) => {
  const { addItem } = useCart();
  const [open, setOpen] = useState(false);

  const needsCustomization =
    item.variants.length > 0 || item.addOnGroups.length > 0;
  
  const fromPrice =
    item.variants.length > 0
      ? Math.min(...item.variants.map((v) => v.price))
      : item.sellingPrice;
  
  const priceLabel =
    item.variants.length > 0
      ? `from ${formatCurrency(fromPrice)}`
      : formatCurrency(item.sellingPrice);

  const handleCardClick = () => {
    if (!item.isAvailable) return;
    if (needsCustomization) {
      setOpen(true);
      return;
    }
    addItem({
      productID: item.productID,
      productVariantID: null,
      name: item.name,
      variantName: null,
      imageUrl: item.imageUrl,
      unitPrice: item.sellingPrice,
      addOnsJson: null,
    });
  };

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent double triggering
    handleCardClick();
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Flex
          direction="column"
          style={{
            borderRadius: 20,
            border: "1px solid var(--gray-a4)",
            background: "var(--color-panel-solid)",
            overflow: "hidden",
            opacity: item.isAvailable ? 1 : 0.55,
            transition: "all 0.2s ease",
            cursor: item.isAvailable ? "pointer" : "not-allowed",
          }}
          onClick={handleCardClick}
        >
          {/* Image Section */}
          <Box style={{ position: "relative", overflow: "hidden" }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "relative",
                width: "100%",
                paddingTop: "62%",
                background: item.imageUrl
                  ? `center / cover no-repeat url(${item.imageUrl})`
                  : "linear-gradient(135deg, var(--gray-6), var(--gray-4))",
              }}
            />
            {!item.isAvailable && (
              <Badge
                color="gray"
                variant="solid"
                radius="full"
                style={{ position: "absolute", top: 12, left: 12 }}
              >
                Unavailable
              </Badge>
            )}
            {item.isAvailable && (
              <Badge
                color="orange"
                variant="solid"
                radius="full"
                style={{ position: "absolute", top: 12, left: 12 }}
              >
                Low Stock
              </Badge>
            )}
          </Box>

          {/* Body Section */}
          <Flex direction="column" gap="1" style={{ flex: 1, padding: 16 }}>
            <Text size="3" weight="bold" as="div" truncate>
              {item.name}
            </Text>
            {item.description && (
              <Text
                size="1"
                color="gray"
                as="div"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  minHeight: 32,
                }}
              >
                {item.description}
              </Text>
            )}
            <Flex align="center" justify="between" mt="2">
              <Text size="3" weight="bold" style={{ color: "var(--accent-11)" }}>
                {priceLabel}
              </Text>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconButton
                  size="2"
                  radius="full"
                  aria-label={`Add ${item.name} to cart`}
                  disabled={!item.isAvailable}
                  onClick={handlePlusClick}
                  style={{
                    background: item.isAvailable ? "linear-gradient(135deg, #c2410c, #ea580c)" : undefined,
                    cursor: item.isAvailable ? "pointer" : "not-allowed",
                  }}
                >
                  <PlusIcon />
                </IconButton>
              </motion.div>
            </Flex>
          </Flex>
        </Flex>
      </motion.div>

      {needsCustomization && open && (
        <MenuItemCustomizeDialog
          item={item}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};