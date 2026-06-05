"use client";
import React, { useState } from "react";
import { Badge, Box, Flex, Separator, Text, TextArea } from "@radix-ui/themes";
import { ArrowLeftIcon, HomeIcon } from "@radix-ui/react-icons";
import { PrimaryButton } from "../buttons/PrimaryButton";
import { Button } from "../buttons/Button";
import { useApiCallback } from "../../../core/hooks";
import { useToastContext } from "../../../core/contexts";
import { formatCurrency } from "../../../business/strings";
import { CustomerCheckoutParams } from "../../../api/commons/types";
import { useCart } from "./CartContext";

interface Props {
  /** Return to the cart line view. */
  onBack: () => void;
  /** Called with the created order number after a successful checkout. */
  onPlaced: (orderNumber: string) => void;
}

/**
 * Pickup-only checkout. There is no online payment step: the order is placed
 * and the customer pays cash/GCash at the counter on pickup (the cashier records
 * the reference and advances status). Online payment options are shown disabled.
 */
export const CheckoutPanel: React.FC<Props> = ({ onBack, onPlaced }) => {
  const { items, totals, toCheckoutItems, clear } = useCart();
  const { showToast } = useToastContext();
  const [instructions, setInstructions] = useState("");

  const checkout = useApiCallback(
    (api, params: CustomerCheckoutParams) => api.commons.customerCheckout(params),
  );

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    try {
      const res = await checkout.execute({
        items: toCheckoutItems(),
        specialInstructions: instructions.trim() || null,
      });
      const orderNumber = res?.data?.response?.orderNumber ?? "";
      clear();
      showToast(
        orderNumber
          ? `Order ${orderNumber} placed! Pay at the counter on pickup.`
          : "Order placed! Pay at the counter on pickup.",
        "success",
      );
      onPlaced(orderNumber);
    } catch (error) {
      const first = Array.isArray(error) ? (error as string[])[0] : null;
      showToast(first ?? "We couldn't place your order. Please try again.", "error");
    }
  };

  return (
    <Flex direction="column" style={{ height: "100%" }}>
      <Box style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        <Button type="Link" onClick={onBack}>
          <ArrowLeftIcon /> Back to cart
        </Button>

        {/* Fulfillment — pickup only */}
        <Text size="2" weight="bold" as="div" mt="3" mb="2">
          Fulfillment
        </Text>
        <Box
          style={{
            border: "1px solid var(--accent-7)",
            background: "var(--accent-a2)",
            borderRadius: "var(--radius-3)",
            padding: "12px 14px",
          }}
        >
          <Flex align="center" gap="2">
            <HomeIcon style={{ color: "var(--accent-11)" }} />
            <Box>
              <Text size="2" weight="medium" as="div">
                Pick up in store
              </Text>
              <Text size="1" color="gray" as="div">
                The only option for now — we&apos;ll have it ready at the counter.
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Payment — pay at counter */}
        <Text size="2" weight="bold" as="div" mt="4" mb="2">
          Payment
        </Text>
        <Flex direction="column" gap="2">
          <Box
            style={{
              border: "1px solid var(--gray-6)",
              borderRadius: "var(--radius-3)",
              padding: "12px 14px",
            }}
          >
            <Flex align="center" justify="between">
              <Text size="2" weight="medium">
                💵 Pay at the counter (cash / GCash)
              </Text>
              <Badge color="green" variant="soft" radius="full">
                Available
              </Badge>
            </Flex>
            <Text size="1" color="gray" as="div" mt="1">
              Please bring cash, or pay via GCash, when you pick up your order.
            </Text>
          </Box>

          <Flex
            align="center"
            justify="between"
            style={{
              border: "1px dashed var(--gray-5)",
              borderRadius: "var(--radius-3)",
              padding: "12px 14px",
              opacity: 0.65,
            }}
          >
            <Text size="2" color="gray">
              💳 Pay online (card / e-wallet)
            </Text>
            <Badge color="gray" variant="soft" radius="full">
              Coming soon
            </Badge>
          </Flex>
        </Flex>

        {/* Special instructions */}
        <Text size="2" weight="bold" as="div" mt="4" mb="2">
          Special instructions
        </Text>
        <TextArea
          placeholder="e.g. Extra hot, less ice…"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          maxLength={250}
          resize="vertical"
        />
      </Box>

      {/* Footer summary + place order */}
      <Box
        style={{
          borderTop: "1px solid var(--gray-a4)",
          padding: "16px 20px",
          background: "var(--color-background)",
        }}
      >
        <Flex align="center" justify="between" mb="3">
          <Text size="2" color="gray">
            Total ({totals.itemCount} {totals.itemCount === 1 ? "item" : "items"})
          </Text>
          <Text size="5" weight="bold">
            {formatCurrency(totals.subtotal)}
          </Text>
        </Flex>
        <Separator size="4" mb="3" />
        <PrimaryButton
          fullWidth
          size="3"
          loading={checkout.loading}
          disabled={items.length === 0}
          onClick={handlePlaceOrder}
        >
          Place pickup order
        </PrimaryButton>
      </Box>
    </Flex>
  );
};
