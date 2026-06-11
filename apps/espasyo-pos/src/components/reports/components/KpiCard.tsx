import React, { memo } from "react";
import { Box, Card, Flex, Skeleton, Text } from "@radix-ui/themes";
import { motion } from "framer-motion";
import type { KpiTile } from "../types";

const KpiCardInner = ({ tile, delay }: { tile: KpiTile; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
    style={{ minWidth: 0, height: "100%" }}
  >
    <Card
      size="2"
      variant="surface"
      style={{
        background: `var(--${tile.accent}-a2)`,
        borderColor: `var(--${tile.accent}-a5)`,
        height: "100%",
        minWidth: 0,
      }}
    >
      <Flex direction="column" gap="2" style={{ minWidth: 0 }}>
        <Flex justify="between" align="center" gap="2">
          <Text
            size="1"
            color="gray"
            weight="medium"
            style={{
              textTransform: "uppercase",
              letterSpacing: 0.5,
              lineHeight: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              minWidth: 0,
            }}
          >
            {tile.label}
          </Text>
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-2)",
              background: `var(--${tile.accent}-a3)`,
              color: `var(--${tile.accent}-11)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {tile.icon}
          </Box>
        </Flex>

        {tile.loading ? (
          <Skeleton width="80%" height="24px" />
        ) : (
          <Text
            weight="bold"
            as="div"
            style={{
              color: `var(--${tile.accent}-11)`,
              fontSize: 20,
              lineHeight: 1.15,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {tile.value ?? "\u2014"}
          </Text>
        )}

        <Text
          size="1"
          color="gray"
          as="div"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineHeight: 1.2,
          }}
        >
          {tile.hint}
        </Text>
      </Flex>
    </Card>
  </motion.div>
);

export const KpiCard = memo(KpiCardInner);
KpiCard.displayName = "KpiCard";
