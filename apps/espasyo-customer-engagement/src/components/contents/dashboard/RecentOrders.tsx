"use client";
import React from "react";
import {
  Badge,
  Box,
  Flex,
  Text,
} from "core-lib/components/radix/proxies";;
import { motion } from "framer-motion";
import { ListLoader } from "core-lib/components/radix";
import { formatCurrency } from "core-lib/business/strings";
import { CustomerOrderDto } from "core-lib/api/commons/types";
import { orderStatusColor, humanizeStatusLabel } from "./status";

interface Props {
  orders: CustomerOrderDto[];
  loading?: boolean;
  onOrderClick?: (id: string) => void;
}

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const itemSummary = (order: CustomerOrderDto): string => {
  const count = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const first = order.items[0]?.productName ?? "items";
  if (order.items.length <= 1) return `${count} × ${first}`;
  return `${first} + ${order.items.length - 1} more`;
};

const statusIcons: Record<number, string> = {
  1: "📝", 2: "📋", 3: "💰", 4: "✅", 5: "⏳", 6: "🔥", 7: "🍳", 8: "✨", 9: "🛎️", 10: "🎉", 11: "✔️", 12: "❌", 13: "🔄"
};

export const RecentOrders: React.FC<Props> = ({ orders, loading, onOrderClick }) => {
  if (loading) return <ListLoader loadersCount={3} isFullWidth />;

  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          borderRadius: 20,
          border: "1px dashed var(--gray-6)",
          padding: "48px",
          textAlign: "center",
        }}
      >
        <Text size="3" color="gray">
          🛍️ No orders yet — your past orders will show up here.
        </Text>
      </motion.div>
    );
  }

  return (
    <Flex direction="column" gap="3">
      {orders.map((order, idx) => (
        <motion.div
          key={order.customerOrderID}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05, duration: 0.3 }}
          whileHover={{ x: 4, boxShadow: "0 4px 20px var(--gray-a6)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onOrderClick?.(order.customerOrderID)}
          style={{ cursor: onOrderClick ? "pointer" : "default" }}
        >
          <Flex
            align="center"
            justify="between"
            gap="3"
            style={{
              borderRadius: 16,
              border: "1px solid var(--gray-a4)",
              background: "var(--color-panel-solid)",
              padding: "16px 20px",
              transition: "all 0.2s ease",
              cursor: onOrderClick ? "pointer" : undefined,
            }}
          >
            <Box style={{ minWidth: 0, flex: 1 }}>
              <Flex align="center" gap="2" wrap="wrap">
                <Text size="3" weight="bold" style={{ fontFamily: "monospace" }}>
                  #{order.orderNumber}
                </Text>
                <Badge
                  color={orderStatusColor(order.status)}
                  variant="soft"
                  radius="full"
                  size="2"
                >
                  {statusIcons[order.status]} {humanizeStatusLabel(order.statusLabel)}
                </Badge>
              </Flex>
              <Text size="1" color="gray" as="div" mt="1">
                {itemSummary(order)} · {formatDate(order.createdAt)}
              </Text>
            </Box>
            <Text size="4" weight="bold" style={{ flexShrink: 0, color: "var(--accent-11)" }}>
              {formatCurrency(order.totalAmount)}
            </Text>
          </Flex>
        </motion.div>
      ))}
    </Flex>
  );
};