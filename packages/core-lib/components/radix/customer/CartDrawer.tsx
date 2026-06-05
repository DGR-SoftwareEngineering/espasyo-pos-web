"use client";
import React, { useEffect, useState } from "react";
import { Box, Flex, IconButton, Separator, Text } from "@radix-ui/themes";
import {
  Cross2Icon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { PrimaryButton } from "../buttons/PrimaryButton";
import { formatCurrency } from "../../../business/strings";
import { useCart } from "./CartContext";
import { CheckoutPanel } from "./CheckoutPanel";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DrawerView = "cart" | "checkout";

const PANEL_WIDTH = 420;

/**
 * Right-anchored slide-in cart. Animated with CSS transitions only (core-lib has
 * no framer-motion dependency). Hosts both the cart line view and the pickup
 * checkout step.
 */
export const CartDrawer: React.FC<Props> = ({ open, onOpenChange }) => {
  const { items, totals, removeItem, setQty } = useCart();
  const [view, setView] = useState<DrawerView>("cart");

  // Reset to the cart view whenever the drawer is fully closed so it never
  // re-opens mid-checkout.
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setView("cart"), 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  const close = () => onOpenChange(false);

  return (
    <>
      {/* Overlay */}
      <Box
        onClick={close}
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 220ms ease",
          zIndex: 50,
        }}
      />

      {/* Panel */}
      <Flex
        direction="column"
        role="dialog"
        aria-label="Shopping cart"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "100%",
          maxWidth: PANEL_WIDTH,
          background: "var(--color-background)",
          boxShadow: "-12px 0 40px rgba(0,0,0,0.18)",
          transform: open ? "translateX(0)" : `translateX(${PANEL_WIDTH}px)`,
          transition: "transform 260ms cubic-bezier(0.22, 1, 0.36, 1)",
          zIndex: 60,
        }}
      >
        {/* Header */}
        <Flex
          align="center"
          justify="between"
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--gray-a4)",
          }}
        >
          <Text size="4" weight="bold">
            {view === "cart" ? "Your cart" : "Checkout"}
          </Text>
          <IconButton variant="ghost" color="gray" onClick={close} aria-label="Close cart">
            <Cross2Icon />
          </IconButton>
        </Flex>

        {view === "checkout" ? (
          <CheckoutPanel onBack={() => setView("cart")} onPlaced={close} />
        ) : items.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <Box style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
              <Flex direction="column" gap="3">
                {items.map((item) => (
                  <Flex key={item.lineId} gap="3" align="center">
                    <Box
                      style={{
                        width: 56,
                        height: 56,
                        flexShrink: 0,
                        borderRadius: "var(--radius-3)",
                        background: item.imageUrl
                          ? `center / cover no-repeat url(${item.imageUrl})`
                          : "var(--gray-a3)",
                      }}
                    />
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text size="2" weight="medium" as="div" truncate>
                        {item.name}
                      </Text>
                      {item.variantName && (
                        <Text size="1" color="gray" as="div" truncate>
                          {item.variantName}
                        </Text>
                      )}
                      <Text size="2" weight="bold" as="div" mt="1">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </Text>
                    </Box>
                    <Flex align="center" gap="1">
                      <IconButton
                        size="1"
                        variant="soft"
                        color="gray"
                        aria-label="Decrease quantity"
                        onClick={() => setQty(item.lineId, item.quantity - 1)}
                      >
                        <MinusIcon />
                      </IconButton>
                      <Text size="2" weight="medium" style={{ minWidth: 20, textAlign: "center" }}>
                        {item.quantity}
                      </Text>
                      <IconButton
                        size="1"
                        variant="soft"
                        color="gray"
                        aria-label="Increase quantity"
                        onClick={() => setQty(item.lineId, item.quantity + 1)}
                      >
                        <PlusIcon />
                      </IconButton>
                      <IconButton
                        size="1"
                        variant="ghost"
                        color="red"
                        aria-label="Remove item"
                        onClick={() => removeItem(item.lineId)}
                      >
                        <TrashIcon />
                      </IconButton>
                    </Flex>
                  </Flex>
                ))}
              </Flex>
            </Box>

            {/* Footer */}
            <Box
              style={{
                borderTop: "1px solid var(--gray-a4)",
                padding: "16px 20px",
                background: "var(--color-background)",
              }}
            >
              <Flex align="center" justify="between" mb="3">
                <Text size="2" color="gray">
                  Subtotal
                </Text>
                <Text size="5" weight="bold">
                  {formatCurrency(totals.subtotal)}
                </Text>
              </Flex>
              <Separator size="4" mb="3" />
              <PrimaryButton fullWidth size="3" onClick={() => setView("checkout")}>
                Checkout · {formatCurrency(totals.subtotal)}
              </PrimaryButton>
            </Box>
          </>
        )}
      </Flex>
    </>
  );
};

const EmptyCart: React.FC = () => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    gap="2"
    style={{ flex: 1, padding: 24, textAlign: "center" }}
  >
    <Text size="7">🛒</Text>
    <Text size="3" weight="bold">
      Your cart is empty
    </Text>
    <Text size="2" color="gray">
      Add something tasty from the menu to get started.
    </Text>
  </Flex>
);
