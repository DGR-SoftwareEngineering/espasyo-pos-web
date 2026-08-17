import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Avatar,
  Card,
} from "@radix-ui/themes";;
import { motion } from "framer-motion";
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons";
import { STATS_CARDS } from "../../constants/stats";

const MotionDiv = motion.div;

type StatCard = (typeof STATS_CARDS)[number];

interface Props {
  stat: StatCard;
  index: number;
}

/**
 * Single stat tile in the dashboard grid. Radix `<Card>` surface with a
 * rotating accent orb behind the avatar — the same micro-interaction the
 * MUI version had, now riding on Radix tokens (`stat.color` is preserved
 * for tenant-specific brand colors).
 */
export const AnimatedStatsCard = ({ stat, index }: Props) => {
  const Icon = stat.icon;
  // `stat.trend` is a literal string in the data file; widen here so the
  // comparison isn't flagged as a tautology when seed data only has one value.
  const trendUp = (stat.trend as string) === "up";
  const TrendIcon = trendUp ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trendUp ? "var(--green-11)" : "var(--red-11)";

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -4 }}
    >
      <Card
        size="3"
        variant="surface"
        style={{
          position: "relative",
          overflow: "hidden",
          transition: "box-shadow 200ms ease",
        }}
      >
        {/* Slowly rotating accent orb */}
        <motion.div
          aria-hidden
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            top: -22,
            right: -22,
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: `${stat.color}22`,
            pointerEvents: "none",
          }}
        />

        <Flex justify="between" align="center" style={{ position: "relative" }}>
          <Box>
            <Text size="1" color="gray">
              {stat.title}
            </Text>
            <Heading size="7" weight="bold" my="1">
              {stat.value}
            </Heading>
            <Flex align="center" gap="1">
              <TrendIcon style={{ color: trendColor, width: 14, height: 14 }} />
              <Text
                size="1"
                weight="bold"
                style={{ color: trendColor }}
              >
                {stat.change}
              </Text>
              <Text size="1" color="gray">
                vs yesterday
              </Text>
            </Flex>
          </Box>

          <Avatar
            size="4"
            radius="full"
            fallback={<Icon />}
            style={{
              background: `${stat.color}22`,
              color: stat.color,
            }}
          />
        </Flex>
      </Card>
    </MotionDiv>
  );
};
