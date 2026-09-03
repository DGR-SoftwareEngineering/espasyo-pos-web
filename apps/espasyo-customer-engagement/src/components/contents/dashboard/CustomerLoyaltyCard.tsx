"use client";
import React, { useMemo } from "react";
import {
  Badge,
  Box,
  Flex,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Callout,
  Progress,
} from "@radix-ui/themes";;
import { motion } from "framer-motion";
import {
  LocalCafeOutlined,
  EmojiEventsOutlined,
  CoffeeOutlined,
  LockOutlined,
} from "@mui/icons-material";
import { CustomerLoyaltyDto } from "core-lib/api/commons/types";
import { formatCurrency } from "core-lib/business/strings";

interface Props {
  loyalty: CustomerLoyaltyDto | null;
  loading?: boolean;
  totalVisits?: number; // From customer data
  requiredVisitsForEnrollment?: number; // Default: 5
}

const LOYALTY_TOTAL_SLOTS = 12;
const LOYALTY_REWARD_SLOTS = [6, 12];
const REQUIRED_VISITS_FOR_ENROLLMENT = 5;

interface SlotState {
  number: number;
  filled: boolean;
  isReward: boolean;
  isRedeemed: boolean;
}

const computeSlots = (
  totalStamps: number,
  availableRewards: number,
): SlotState[] => {
  const safeTotal = Math.max(0, totalStamps ?? 0);
  const safeRewards = Math.max(0, availableRewards ?? 0);
  
  // For customer view, we show the current card state
  const filledCount = safeTotal % LOYALTY_TOTAL_SLOTS;
  let rewardsToShow = safeRewards;
  
  return Array.from({ length: LOYALTY_TOTAL_SLOTS }, (_, idx) => {
    const number = idx + 1;
    const filled = number <= filledCount;
    const isReward = LOYALTY_REWARD_SLOTS.includes(number);
    let isRedeemed = false;
    
    if (filled && isReward && rewardsToShow > 0) {
      isRedeemed = true;
      rewardsToShow -= 1;
    }
    
    return { number, filled, isReward, isRedeemed };
  });
};

/** Customer loyalty stamp circle - view only */
const CustomerStampCircle: React.FC<{
  slot: SlotState;
  size: number;
}> = ({ slot, size }) => {
  const tooltipText = (() => {
    if (slot.filled && slot.isRedeemed)
      return "Reward earned & redeemed! 🎉";
    if (slot.filled && slot.isReward) return "Reward slot earned! 🏆";
    if (slot.filled) return `Stamp #${slot.number} collected`;
    if (slot.isReward) return `Slot ${slot.number} — Free drink reward`;
    return `Slot #${slot.number} — Keep ordering to earn stamps`;
  })();

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    flexShrink: 0,
    border: "2px solid var(--gray-a6)",
    background: "var(--gray-a2)",
    color: "var(--gray-9)",
    cursor: "default",
    position: "relative",
  };

  let style: React.CSSProperties = { ...baseStyle };

  if (slot.filled && slot.isRedeemed) {
    style = {
      ...style,
      background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
      borderColor: "#f59e0b",
      color: "white",
      boxShadow: "0 0 0 2px rgba(251,191,36,0.3)",
    };
  } else if (slot.filled && slot.isReward) {
    style = {
      ...style,
      background: "linear-gradient(135deg, #fcd34d, #fbbf24)",
      borderColor: "#f59e0b",
      color: "white",
    };
  } else if (slot.filled) {
    style = {
      ...style,
      background: "linear-gradient(135deg, #8B5E3C, #6F4E37)",
      borderColor: "#5C3A21",
      color: "white",
    };
  } else if (slot.isReward) {
    style = {
      ...style,
      border: "2px dashed #fbbf24",
      background: "rgba(251,191,36,0.1)",
      color: "#fbbf24",
    };
  } else {
    style = {
      ...style,
      border: "2px dashed var(--gray-a5)",
      background: "var(--gray-a2)",
      color: "var(--gray-7)",
    };
  }

  const iconSize = Math.round(size * 0.5);
  const inner = slot.filled ? (
    slot.isReward ? (
      <EmojiEventsOutlined style={{ fontSize: iconSize }} />
    ) : (
      <LocalCafeOutlined style={{ fontSize: iconSize }} />
    )
  ) : slot.isReward ? (
    <EmojiEventsOutlined style={{ fontSize: iconSize, opacity: 0.5 }} />
  ) : null;

  return (
    <div
      title={tooltipText}
      style={style}
    >
      {inner}
    </div>
  );
};

/** Customer loyalty card — view only, respects enrollment requirement */
export const CustomerLoyaltyCard: React.FC<Props> = ({
  loyalty,
  loading,
  totalVisits = 0,
  requiredVisitsForEnrollment = REQUIRED_VISITS_FOR_ENROLLMENT,
}) => {
  const card = loyalty?.loyaltyCard ?? null;
  const isEnrolled = loyalty?.loyaltyCard !== null;
  const totalStamps = card?.totalStamps ?? 0;
  const availableRewards = card?.availableRewards ?? 0;
  const stampsUntilNextReward = card?.stampsUntilNextReward ?? 
    (totalStamps === 0 ? 6 : 6 - ((totalStamps % 6) || 6));
  
  const visitsRemaining = Math.max(0, requiredVisitsForEnrollment - totalVisits);
  const eligibilityProgress = (totalVisits / requiredVisitsForEnrollment) * 100;
  
  const slots = useMemo(
    () => computeSlots(totalStamps, availableRewards),
    [totalStamps, availableRewards],
  );

  const firstName = loyalty?.firstName?.trim();

  // Loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          borderRadius: 24,
          padding: 32,
          background: "linear-gradient(135deg, #f5f0e8, #ede5d8)",
          textAlign: "center",
        }}
      >
        <Flex align="center" justify="center" gap="2">
          <CoffeeOutlined style={{ fontSize: 24, opacity: 0.5 }} />
          <Text size="2" color="gray">Loading your loyalty card...</Text>
        </Flex>
      </motion.div>
    );
  }

  // Not eligible for enrollment yet
  if (!isEnrolled && totalVisits < requiredVisitsForEnrollment) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          style={{
            borderRadius: 24,
            padding: 32,
            background: "linear-gradient(135deg, #f5f0e8, #ede5d8)",
            border: "1px solid rgba(0,0,0,0.05)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative elements */}
          <Box
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          
          <Flex direction="column" align="center" gap="4">
            <Box
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                background: "linear-gradient(135deg, #e8dcc8, #d4c4a8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CoffeeOutlined style={{ fontSize: 40, color: "#8B5E3C", opacity: 0.6 }} />
            </Box>
            
            <Box style={{ textAlign: "center" }}>
              <Text size="5" weight="bold" style={{ color: "#6F4E37" }}>
                Unlock Loyalty Rewards
              </Text>
              <Text size="2" color="gray" mt="2" as="div">
                {firstName ? `${firstName}, make` : "Make"} {visitsRemaining} more 
                {visitsRemaining === 1 ? " purchase" : " purchases"} to unlock your loyalty card
              </Text>
            </Box>

            {/* Progress bar */}
            <Box style={{ width: "100%", maxWidth: 300 }}>
              <Flex justify="between" mb="1">
                <Text size="1" color="gray">Progress</Text>
                <Text size="1" weight="bold" style={{ color: "#f59e0b" }}>
                  {totalVisits}/{requiredVisitsForEnrollment} visits
                </Text>
              </Flex>
              <Box
                style={{
                  height: 8,
                  background: "rgba(0,0,0,0.05)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${eligibilityProgress}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
                    borderRadius: 4,
                  }}
                />
              </Box>
            </Box>

            <Flex gap="2" wrap="wrap" justify="center">
              <Badge color="amber" variant="soft" size="2">
                🎁 Free drink on 6th & 12th stamp
              </Badge>
              <Badge color="brown" variant="soft" size="2">
                ☕ Earn 1 stamp per purchase
              </Badge>
            </Flex>
          </Flex>
        </Box>
      </motion.div>
    );
  }

  // Not enrolled (paused or never enrolled with enough visits but no card created)
  // This should rarely happen, but handle gracefully
  if (!isEnrolled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Callout.Root color="orange" variant="surface">
          <Callout.Icon>
            <LockOutlined />
          </Callout.Icon>
          <Callout.Text>
            Your loyalty card is being set up. Check back after your next purchase!
          </Callout.Text>
        </Callout.Root>
      </motion.div>
    );
  }

  // Enrolled - show full loyalty card
  const circleSize = 56;
  const progressPercent = (totalStamps % LOYALTY_TOTAL_SLOTS) / LOYALTY_TOTAL_SLOTS * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
      whileHover={{ scale: 1.01 }}
    >
      <Box
        style={{
          position: "relative",
          borderRadius: 28,
          padding: 28,
          background: "linear-gradient(135deg, #fffdf7 0%, #f7ebd6 55%, #efd9a8 100%)",
          border: "1px solid rgba(251,191,36,0.3)",
          boxShadow: "0 20px 40px -12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.7)",
          overflow: "hidden",
        }}
      >
        {/* Animated gradient overlay */}
        <motion.div
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
            pointerEvents: "none",
          }}
        />

        {/* Decorative coffee stain */}
        <Box
          aria-hidden
          style={{
            position: "absolute",
            right: -60,
            bottom: -80,
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(111,78,55,0.06) 0%, rgba(111,78,55,0) 70%)",
            pointerEvents: "none",
          }}
        />

        <Flex direction={{ initial: "column", md: "row" }} gap="6" align="center" style={{ position: "relative" }}>
          {/* LEFT PANEL - Customer Info */}
          <Flex direction="column" gap="2" style={{ minWidth: 180, maxWidth: 240 }}>
            <Box
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: "linear-gradient(135deg, #c2410c, #ea580c)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 16px -8px rgba(194,65,12,0.3)",
              }}
            >
              <CoffeeOutlined style={{ fontSize: 32, color: "white" }} />
            </Box>
            
            <Text size="5" weight="bold" style={{ color: "#2A1B0E", letterSpacing: "-0.02em" }}>
              Loyalty Card
            </Text>
            <Text size="2" style={{ color: "#4A2F1E" }}>
              Earn stamps with every purchase
            </Text>
            {firstName && (
              <Text size="1" color="gray" style={{ fontStyle: "italic" }}>
                {firstName}'s card
              </Text>
            )}
            
            <Flex gap="2" align="center" mt="2" wrap="wrap">
              <Badge color="amber" variant="soft" size="2">
                ☕ {totalStamps} {totalStamps === 1 ? "stamp" : "stamps"}
              </Badge>
              {availableRewards > 0 ? (
                <Badge color="green" variant="solid" size="2" style={{ gap: 4 }}>
                  <EmojiEventsOutlined style={{ fontSize: 14 }} />
                  {availableRewards} free {availableRewards === 1 ? "drink" : "drinks"} ready!
                </Badge>
              ) : (
                <Badge color="gray" variant="soft" size="2">
                  {stampsUntilNextReward} more for free drink
                </Badge>
              )}
            </Flex>
          </Flex>

          {/* RIGHT PANEL - Stamp Grid */}
          <Flex direction="column" gap="3" style={{ flex: 1 }}>
            {/* Stamp grid - 3x4 layout */}
            <Box
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 14,
                padding: 16,
                background: "rgba(255,255,255,0.5)",
                borderRadius: 20,
                border: "1px solid rgba(120, 85, 30, 0.1)",
              }}
            >
              {slots.map((s, idx) => (
                <CustomerStampCircle
                  key={s.number}
                  slot={s}
                  size={circleSize}
                />
              ))}
            </Box>

            {/* Progress info */}
            <Box>
              <Flex justify="between" mb="1">
                <Text size="1" color="gray">Card progress</Text>
                <Text size="1" weight="bold" style={{ color: "#f59e0b" }}>
                  {totalStamps % LOYALTY_TOTAL_SLOTS} / {LOYALTY_TOTAL_SLOTS} stamps
                </Text>
              </Flex>
              <Box
                style={{
                  height: 6,
                  background: "rgba(0,0,0,0.05)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6 }}
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
                    borderRadius: 3,
                  }}
                />
              </Box>
            </Box>

            {/* Rewards info */}
            <Flex gap="2" wrap="wrap" mt="1">
              <Text size="1" color="gray">
                🎁 Every 6th stamp = 1 free drink
              </Text>
              <Text size="1" color="gray">
                ☕ 12 stamps complete a full card
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </motion.div>
  );
};