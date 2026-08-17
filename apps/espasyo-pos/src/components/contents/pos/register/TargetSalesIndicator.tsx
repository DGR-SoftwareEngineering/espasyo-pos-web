import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Flex,
  Text,
} from "core-lib/components/radix/proxies";;
import { motion } from "framer-motion";
import { EmojiEvents } from "@mui/icons-material";
import { formatCurrency } from "../format";

interface TargetSalesIndicatorProps {
  currentAmount: number;
  targetAmount: number;
  progressPct: number;
  reached: boolean;
  currencyCode: string;
  loading?: boolean;
  onClick?: () => void;
}

const getThreshold = (pct: number) => {
  if (pct >= 100) return { color: "jade", label: "🎉 Target reached!" };
  if (pct >= 80) return { color: "green", label: "Almost there!" };
  if (pct >= 50) return { color: "amber", label: "Halfway there!" };
  return { color: "red", label: "Keep going!" };
};

const getGradient = (color: string): string => {
  const gradients: Record<string, string> = {
    red: "linear-gradient(90deg, var(--red-9), var(--red-10))",
    amber: "linear-gradient(90deg, var(--amber-9), var(--amber-10))",
    green: "linear-gradient(90deg, var(--green-9), var(--green-10))",
    jade: "linear-gradient(90deg, var(--jade-9), var(--jade-10))",
  };
  return gradients[color] || gradients.red;
};

export const TargetSalesIndicator: React.FC<TargetSalesIndicatorProps> = ({
  currentAmount,
  targetAmount,
  progressPct,
  reached,
  currencyCode,
  loading = false,
  onClick,
}) => {
  const threshold = getThreshold(progressPct);
  const prevReachedRef = useRef(reached);
  const [bouncing, setBouncing] = useState(false);

  useEffect(() => {
    if (reached && !prevReachedRef.current) {
      setBouncing(true);
      const t = setTimeout(() => setBouncing(false), 900);
      return () => clearTimeout(t);
    }
    prevReachedRef.current = reached;
  }, [reached]);

  return (
    <motion.div
      animate={
        bouncing
          ? { y: [0, -14, 0, -7, 0, -3, 0], scale: [1, 1.04, 1, 1.02, 1] }
          : {}
      }
      transition={{ duration: 0.85, ease: "easeOut" }}
      whileHover={onClick ? { scale: 1.01 } : {}}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : undefined }}
    >
      <Box
        style={{
          borderRadius: "var(--radius-2)",
          border: `1px solid var(--${threshold.color}-a5)`,
          background: reached ? `var(--${threshold.color}-a2)` : "var(--gray-a2)",
          padding: "12px",
        }}
      >
        <Flex justify="between" align="center">
          <Flex align="center" gap="2">
            <Box
              style={{
                width: 18,
                height: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EmojiEvents
                fontSize="small"
                style={{
                  color: `var(--${threshold.color}-11)`,
                }}
              />
            </Box>
            <Text size="1" weight="medium">
              Today's Target
            </Text>
          </Flex>
          <Flex align="center" gap="2">
            <Text size="1" weight="bold">
              {formatCurrency(targetAmount, currencyCode)}
            </Text>
            {onClick && (
              <Text size="1" color="gray" style={{ opacity: 0.6 }}>
                ↗
              </Text>
            )}
          </Flex>
        </Flex>

        <Box
          style={{
            marginTop: "8px",
            height: 6,
            borderRadius: 999,
            background: "var(--gray-a3)",
            overflow: "hidden",
          }}
        >
          <motion.div
            style={{
              width: `${progressPct}%`,
              height: "100%",
              borderRadius: 999,
              background: getGradient(threshold.color),
            }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </Box>

        <Flex justify="between" align="center" style={{ marginTop: "6px" }}>
          <Text size="1" color="gray">
            {formatCurrency(currentAmount, currencyCode)} of{" "}
            {formatCurrency(targetAmount, currencyCode)}
          </Text>
          <Text
            size="1"
            weight="medium"
            style={{
              color: `var(--${threshold.color}-11)`,
            }}
          >
            {threshold.label}
          </Text>
        </Flex>
      </Box>
    </motion.div>
  );
};
