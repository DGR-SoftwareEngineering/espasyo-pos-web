"use client";
import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
} from "core-lib/components/radix/proxies";
import {
  Grid,
} from "@radix-ui/themes";;
import { motion, useScroll, useTransform } from "framer-motion";
import {
  CustomerLoyaltyDto,
  CustomerMenuItemDto,
  CustomerOrderDto,
  CustomerPromoDto,
} from "core-lib/api/commons/types";
import { CustomerLoyaltyCard } from "./CustomerLoyaltyCard";
import { PromosSection } from "./PromosSection";
import { PickupBanner } from "./PickupBanner";
import { RecentOrders } from "./RecentOrders";
import { MenuGrid } from "./MenuGrid";
import { OrderDetailSheet } from "./OrderDetailSheet";
import {
  CoffeeOutlined,
  EmojiEventsOutlined,
  LocalOfferOutlined,
  ShoppingBagOutlined,
} from "@mui/icons-material";

interface Props {
  promos: CustomerPromoDto[];
  promosLoading?: boolean;
  menu: CustomerMenuItemDto[];
  menuLoading?: boolean;
  loyalty: CustomerLoyaltyDto | null;
  loyaltyLoading?: boolean;
  orders: CustomerOrderDto[];
  ordersLoading?: boolean;
  totalVisits?: number;
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

const SectionHeader: React.FC<{ title: string; icon?: React.ReactNode }> = ({
  title,
  icon,
}) => (
  <Flex align="center" gap="2" mb="4">
    {icon && <Box style={{ color: "var(--accent-9)" }}>{icon}</Box>}
    <Heading size="5" weight="bold" style={{ letterSpacing: "-0.02em" }}>
      {title}
    </Heading>
  </Flex>
);

/** Presentational layout for the customer hub — pure UI, no data fetching. */
export const CustomerDashboard: React.FC<Props> = ({
  promos,
  promosLoading,
  menu,
  menuLoading,
  loyalty,
  loyaltyLoading,
  orders,
  ordersLoading,
  totalVisits = 0,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      style={{ width: "100%" }}
    >

      {/* Hero Section */}
      <motion.div
        style={{ opacity: heroOpacity }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            borderRadius: 28,
            padding: "40px 32px",
            marginBottom: 32,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Animated particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0.4, 0], scale: [0, 1, 0] }}
              transition={{
                duration: 4,
                delay: i * 0.3,
                repeat: Infinity,
                ease: "easeOut",
              }}
              style={{
                position: "absolute",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                background: "rgba(255,255,255,0.3)",
                borderRadius: "50%",
              }}
            />
          ))}
          
          <Flex
            direction={{ initial: "column", md: "row" }}
            align="center"
            justify="between"
            gap="4"
          >
            <Box>
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Flex align="center" gap="2" mb="2">
                  <CoffeeOutlined style={{ fontSize: 28, color: "#fbbf24" }} />
                  <Text size="6" weight="bold" style={{ color: "white", letterSpacing: "-0.02em" }}>
                    Welcome Back!
                  </Text>
                </Flex>
                <Text size="3" style={{ color: "rgba(255,255,255,0.8)", maxWidth: 500 }}>
                  Your perfect cup is waiting. Explore our menu and earn rewards with every order.
                </Text>
              </motion.div>
            </Box>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <Flex gap="4">
                <Box style={{ textAlign: "center" }}>
                  <Text size="5" weight="bold" style={{ color: "#fbbf24" }}>50+</Text>
                  <Text size="1" style={{ color: "rgba(255,255,255,0.7)" }}>Items</Text>
                </Box>
                <Box style={{ textAlign: "center" }}>
                  <Text size="5" weight="bold" style={{ color: "#fbbf24" }}>4.9★</Text>
                  <Text size="1" style={{ color: "rgba(255,255,255,0.7)" }}>Rating</Text>
                </Box>
                <Box style={{ textAlign: "center" }}>
                  <Text size="5" weight="bold" style={{ color: "#fbbf24" }}>5k+</Text>
                  <Text size="1" style={{ color: "rgba(255,255,255,0.7)" }}>Happy</Text>
                </Box>
              </Flex>
            </motion.div>
          </Flex>
        </Box>
      </motion.div>

      <PickupBanner orders={orders} />

      {/* Hot Offers Section */}
      <motion.div variants={fadeInUp} style={{ marginBottom: 32 }}>
        <SectionHeader 
          title="Hot Offers" 
          icon={<LocalOfferOutlined style={{ fontSize: 22 }} />}
        />
        <PromosSection promos={promos} loading={promosLoading} />
      </motion.div>

      {/* Two Column Layout: Left = Loyalty Card, Right = Recent Orders */}
      <Grid columns={{ initial: "1", lg: "2" }} gap="6" style={{ marginBottom: 32 }}>
        {/* LEFT COLUMN - Loyalty Card */}
        <motion.div variants={fadeInUp}>
          <Box id="rewards" style={{ scrollMarginTop: 80 }}>
            <CustomerLoyaltyCard 
              loyalty={loyalty} 
              loading={loyaltyLoading}
              totalVisits={totalVisits}
            />
          </Box>
        </motion.div>

        {/* RIGHT COLUMN - Recent Orders */}
        <motion.div variants={fadeInUp}>
          <Box id="orders" style={{ scrollMarginTop: 80 }}>
            <SectionHeader 
              title="Recent Orders" 
              icon={<ShoppingBagOutlined style={{ fontSize: 20 }} />}
            />
            <RecentOrders 
              orders={orders} 
              loading={ordersLoading} 
              onOrderClick={setSelectedOrderId} 
            />
          </Box>
        </motion.div>
      </Grid>

      {/* Our Menu - Full Width Below */}
      <motion.div variants={fadeInUp}>
        <Box id="menu" style={{ scrollMarginTop: 80 }}>
          <Flex align="center" justify="between" mb="4" wrap="wrap" gap="2">
            <SectionHeader 
              title="Our Menu" 
              icon={<CoffeeOutlined style={{ fontSize: 20 }} />}
            />
            <Flex gap="2">
              <Badge color="amber" variant="soft" size="1">🔥 All Day</Badge>
              <Badge color="brown" variant="soft" size="1">☕ Fresh Brew</Badge>
            </Flex>
          </Flex>
          <MenuGrid menu={menu} loading={menuLoading} />
        </Box>
      </motion.div>

      <OrderDetailSheet orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
    </motion.div>
  );
};