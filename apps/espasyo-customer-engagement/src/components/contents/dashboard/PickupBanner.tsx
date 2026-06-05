import React from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import {
  CustomerOrderDto,
  CustomerOrderStatus,
} from "core-lib/api/commons/types";

interface Props {
  orders: CustomerOrderDto[];
}

/** Prominent banner shown only when one or more orders are ready for pickup. */
export const PickupBanner: React.FC<Props> = ({ orders }) => {
  const ready = orders.filter(
    (o) => o.status === CustomerOrderStatus.ReadyForPickup,
  );
  if (ready.length === 0) return null;

  return (
    <Box
      style={{
        borderRadius: "var(--radius-4)",
        padding: "16px 20px",
        background: "var(--green-a3)",
        border: "1px solid var(--green-7)",
      }}
    >
      <Flex align="center" gap="3">
        <CheckCircledIcon
          width={28}
          height={28}
          style={{ color: "var(--green-11)", flexShrink: 0 }}
        />
        <Box style={{ flex: 1 }}>
          <Text size="3" weight="bold" as="div" style={{ color: "var(--green-11)" }}>
            {ready.length === 1
              ? "Your order is ready for pickup! 🎉"
              : `${ready.length} orders ready for pickup! 🎉`}
          </Text>
          <Text size="2" color="gray" as="div">
            Head to the counter — show order{" "}
            {ready.map((o) => o.orderNumber).join(", ")} and pay with cash or GCash.
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};
