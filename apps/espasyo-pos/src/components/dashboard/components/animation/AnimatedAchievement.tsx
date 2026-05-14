import React from "react";
import { Avatar, Box, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { motion } from "framer-motion";
import {
  LightningBoltIcon,
  StarFilledIcon,
  MagicWandIcon,
} from "@radix-ui/react-icons";

const iconMap = {
  Bolt: LightningBoltIcon,
  Star: StarFilledIcon,
  Psychology: MagicWandIcon,
} as const;

interface Achievement {
  id: string;
  label: string;
  value: string | number;
  icon: keyof typeof iconMap;
}

interface Props {
  item: Achievement;
  index: number;
}

/**
 * Single achievement row in the "Today's Achievements" card. Radix `<Card>`
 * with a soft outlined surface; subtle slide-in animation on mount.
 */
export const AnimatedAchievement = ({ item, index }: Props) => {
  const Icon = iconMap[item.icon] ?? StarFilledIcon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.12 }}
      whileHover={{ x: 4 }}
    >
      <Card variant="surface" size="2">
        <Flex align="center" gap="3">
          <Avatar
            size="3"
            radius="full"
            fallback={<Icon />}
            color="indigo"
            variant="solid"
          />
          <Box>
            <Text size="1" color="gray" as="div">
              {item.label}
            </Text>
            <Heading size="4" weight="bold" as="h6">
              {item.value}
            </Heading>
          </Box>
        </Flex>
      </Card>
    </motion.div>
  );
};
