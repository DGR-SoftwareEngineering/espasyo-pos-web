"use client";
import React, { useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Badge,
  IconButton,
} from "core-lib/components/radix/proxies";
import {
  Dialog,
  Spinner,
  VisuallyHidden,
} from "@radix-ui/themes";;
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "core-lib/core/hooks";
import { CustomerOrderDetailDto, CustomerOrderStatus } from "core-lib/api/commons/types";
import { formatCurrency } from "core-lib/business/strings";
import { orderStatusColor, humanizeStatusLabel } from "./status";

interface Props {
  orderId: string | null;
  onClose: () => void;
}

const statusIcons: Record<number, string> = {
  1: "📝", 2: "📋", 3: "💰", 4: "✅", 5: "⏳", 6: "🔥", 7: "🍳", 8: "✨", 9: "🛎️", 10: "🎉", 11: "✔️", 12: "❌", 13: "🔄"
};

interface ParsedAddOn {
  Name: string;
  Price: number;
}

function parseAddOns(json: string | null): ParsedAddOn[] {
  if (!json) return [];
  try {
    return JSON.parse(json) as ParsedAddOn[];
  } catch {
    return [];
  }
}

function getStatusStage(status: CustomerOrderStatus): { stage: number; label: string } {
  switch (status) {
    case CustomerOrderStatus.OrderReceived:
    case CustomerOrderStatus.OrderTaken:
      return { stage: 0, label: "Order Placed" };
    case CustomerOrderStatus.PaymentReceived:
    case CustomerOrderStatus.OrderConfirmed:
      return { stage: 1, label: "Payment Confirmed" };
    case CustomerOrderStatus.OrderQueued:
    case CustomerOrderStatus.OrderAccepted:
    case CustomerOrderStatus.InPreparation:
    case CustomerOrderStatus.FinalizingOrder:
      return { stage: 2, label: "Preparing" };
    case CustomerOrderStatus.ReadyForPickup:
      return { stage: 3, label: "Ready for Pickup" };
    case CustomerOrderStatus.PickedUp:
    case CustomerOrderStatus.OrderCompleted:
      return { stage: 4, label: "Done" };
    default:
      return { stage: 0, label: "Order Placed" };
  }
}

const StageBar: React.FC<{ status: CustomerOrderStatus; statusLabel: string }> = ({ status, statusLabel }) => {
  if (status === CustomerOrderStatus.Cancelled) {
    return (
      <Box
        style={{
          background: "var(--red-a3)",
          borderRadius: 12,
          padding: "12px 16px",
          marginBottom: "24px",
        }}
      >
        <Text size="2" weight="medium">
          ❌ This order was cancelled.
        </Text>
      </Box>
    );
  }

  if (status === CustomerOrderStatus.Remake) {
    return (
      <Box
        style={{
          background: "var(--amber-a3)",
          borderRadius: 12,
          padding: "12px 16px",
          marginBottom: "24px",
        }}
      >
        <Text size="2" weight="medium">
          🔄 This order is being remade — hang tight!
        </Text>
      </Box>
    );
  }

  const { stage } = getStatusStage(status);
  const STAGES = ["Order Placed", "Payment Confirmed", "Preparing", "Ready for Pickup", "Done"];

  return (
    <Box mb="6">
      <Flex justify="center" align="center" gap="2" style={{ marginBottom: "16px" }}>
        {STAGES.map((label, idx) => {
          const isCompleted = stage > idx;
          const isActive = stage === idx;
          const color = isCompleted ? "var(--green-9)" : isActive ? "var(--accent-9)" : "var(--gray-7)";

          return (
            <React.Fragment key={idx}>
              <motion.div
                animate={{ scale: isActive ? 1.2 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: color,
                  flexShrink: 0,
                }}
              />
              {idx < STAGES.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    background: isCompleted ? "var(--green-9)" : isActive ? "var(--accent-9)" : "var(--gray-7)",
                    borderRadius: 1,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Flex>
      <Flex justify="center">
        <Text size="2" weight="medium" style={{ color: "var(--accent-9)" }}>
          {statusIcons[status]} {humanizeStatusLabel(statusLabel)}
        </Text>
      </Flex>
    </Box>
  );
};

const OrderItemRow: React.FC<{ productName: string; variantName?: string | null; addOnsJson?: string | null; quantity: number; unitPrice: number; lineTotal: number }> = ({
  productName,
  variantName,
  addOnsJson,
  quantity,
  unitPrice,
  lineTotal,
}) => {
  const addOns = parseAddOns(addOnsJson ?? null);

  return (
    <Flex direction="column" gap="2" style={{ paddingBottom: "16px" }}>
      <Flex justify="between" align="start" gap="2">
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text size="3" weight="bold" as="div">
            {productName}
          </Text>
          {variantName && (
            <Text size="1" color="gray" as="div">
              {variantName}
            </Text>
          )}
          {addOns.length > 0 && (
            <Box mt="1">
              {addOns.map((addon, idx) => (
                <Text key={idx} size="1" color="gray" as="div">
                  + {addon.Name} (+{formatCurrency(addon.Price)})
                </Text>
              ))}
            </Box>
          )}
        </Box>
        <Box style={{ flexShrink: 0, textAlign: "right" }}>
          <Text size="2" color="gray" as="div">
            {quantity} × {formatCurrency(unitPrice)}
          </Text>
          <Text size="3" weight="bold" as="div">
            {formatCurrency(lineTotal)}
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
};

export const OrderDetailSheet: React.FC<Props> = ({ orderId, onClose }) => {
  const { result, loading } = useApi(
    (api) => api.commons.customerDashboardOrderById(orderId ?? ""),
    [orderId],
  );

  const order = result?.data?.response ?? null;
  const isOpen = !!orderId;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog.Root open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
          <Dialog.Content
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              top: "auto",
              borderRadius: "20px 20px 0 0",
              maxWidth: "100vw",
              width: "100%",
              padding: 0,
              margin: 0,
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                background: "var(--color-panel-solid)",
              }}
            >
              <VisuallyHidden>
                <Dialog.Title>Order #{order?.orderNumber ?? ""}</Dialog.Title>
              </VisuallyHidden>

              <Flex
                justify="between"
                align="center"
                px="5"
                py="4"
                style={{
                  borderBottom: "1px solid var(--gray-a4)",
                  flexShrink: 0,
                }}
              >
                <Flex align="center" gap="2">
                  <Text size="3" weight="bold" style={{ fontFamily: "monospace" }}>
                    #{order?.orderNumber ?? ""}
                  </Text>
                  {order && (
                    <Badge
                      color={orderStatusColor(order.status)}
                      variant="soft"
                      radius="full"
                      size="2"
                    >
                      {statusIcons[order.status]} {humanizeStatusLabel(order.statusLabel)}
                    </Badge>
                  )}
                </Flex>
                <Dialog.Close>
                  <IconButton variant="ghost" size="2" style={{ cursor: "pointer" }}>
                    ✕
                  </IconButton>
                </Dialog.Close>
              </Flex>

              {loading ? (
                <Flex justify="center" align="center" style={{ flex: 1, minHeight: "200px" }}>
                  <Spinner />
                </Flex>
              ) : !order ? (
                <Flex justify="center" align="center" style={{ flex: 1, minHeight: "200px" }}>
                  <Text color="gray">Could not load order details.</Text>
                </Flex>
              ) : (
                <Box
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "20px",
                    paddingBottom: "140px",
                  }}
                >
                  <StageBar status={order.status} statusLabel={order.statusLabel} />

                  <Box mb="6">
                    <Text size="2" weight="bold" color="gray" as="div" mb="3">
                      Items
                    </Text>
                    {order.items?.map((item) => (
                      <OrderItemRow
                        key={item.customerOrderItemID}
                        productName={item.productName}
                        variantName={item.variantName}
                        addOnsJson={item.addOnsJson}
                        quantity={item.quantity}
                        unitPrice={item.unitPrice}
                        lineTotal={item.lineTotal}
                      />
                    ))}
                  </Box>

                  {order.specialInstructions && (
                    <Box
                      style={{
                        background: "var(--amber-a3)",
                        borderRadius: 12,
                        padding: "12px 16px",
                      }}
                      mb="6"
                    >
                      <Text size="2" weight="bold" as="div">
                        Special Instructions
                      </Text>
                      <Text size="2" color="gray" as="div">
                        {order.specialInstructions}
                      </Text>
                    </Box>
                  )}

                  {order.paymentReference && (
                    <Box mb="6">
                      <Text size="1" color="gray" as="div">
                        Payment Reference
                      </Text>
                      <Text
                        size="2"
                        weight="medium"
                        style={{ fontFamily: "monospace" }}
                        as="div"
                      >
                        {order.paymentReference}
                      </Text>
                    </Box>
                  )}
                </Box>
              )}

              {!loading && order && (
                <Flex
                  justify="between"
                  align="center"
                  px="5"
                  py="4"
                  style={{
                    position: "sticky",
                    bottom: 0,
                    borderTop: "1px solid var(--gray-a4)",
                    background: "var(--color-panel-solid)",
                    flexShrink: 0,
                  }}
                >
                  <Text size="3" weight="bold">
                    Total
                  </Text>
                  <Text
                    size="5"
                    weight="bold"
                    style={{ color: "var(--accent-11)" }}
                  >
                    {formatCurrency(order.totalAmount)}
                  </Text>
                </Flex>
              )}
            </motion.div>
          </Dialog.Content>
        </Dialog.Root>
      )}
    </AnimatePresence>
  );
};
