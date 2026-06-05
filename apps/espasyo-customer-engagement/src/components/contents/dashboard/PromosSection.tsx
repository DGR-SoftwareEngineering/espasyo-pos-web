"use client";
import React from "react";
import { Badge, Box, Flex, Text } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { ListLoader } from "core-lib/components/radix";
import { CustomerPromoDto } from "core-lib/api/commons/types";

interface Props {
  promos: CustomerPromoDto[];
  loading?: boolean;
}

const promoLabel = (p: CustomerPromoDto): string => {
  if (p.discountPercent) return `${Math.round(p.discountPercent * 100)}% OFF`;
  if (p.discountAmount) return `₱${p.discountAmount} OFF`;
  if (p.bundlePrice) return `Bundle ₱${p.bundlePrice}`;
  if (p.buyQuantity && p.getQuantity)
    return `Buy ${p.buyQuantity} Get ${p.getQuantity}`;
  return "Promo";
};

export const PromosSection: React.FC<Props> = ({ promos, loading }) => {
  if (loading) return <ListLoader loadersCount={1} isFullWidth />;

  if (promos.length === 0) {
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
          🎁 No promos right now — check back soon!
        </Text>
      </motion.div>
    );
  }

  return (
    <Box style={{ position: "relative" }}>
      <Flex
        gap="4"
        style={{
          overflowX: "auto",
          paddingBottom: 12,
          scrollSnapType: "x mandatory",
          cursor: "grab",
        }}
      >
        {promos.map((promo, index) => (
          <motion.div
            key={promo.promoID}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            style={{
              flex: "0 0 auto",
              width: 320,
              scrollSnapAlign: "start",
            }}
          >
            <Box
              style={{
                position: "relative",
                height: 180,
                borderRadius: 20,
                overflow: "hidden",
                background: promo.imageUrl
                  ? `linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), center / cover no-repeat url(${promo.imageUrl})`
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
            >
              <Flex justify="end">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  style={{ display: "inline-block" }}
                >
                  <Badge color="orange" variant="solid" radius="full" size="2">
                    {promoLabel(promo)}
                  </Badge>
                </motion.div>
              </Flex>
              <Box>
                <Text size="5" weight="bold" as="div" style={{ lineHeight: 1.2, marginBottom: 4 }}>
                  {promo.title}
                </Text>
                {promo.description && (
                  <Text size="1" as="div" style={{ opacity: 0.9 }}>
                    {promo.description}
                  </Text>
                )}
              </Box>
            </Box>
          </motion.div>
        ))}
      </Flex>
    </Box>
  );
};