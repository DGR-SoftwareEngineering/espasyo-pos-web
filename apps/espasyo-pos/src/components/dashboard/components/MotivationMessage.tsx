import React from "react";
import { Avatar, Flex, Text } from "@radix-ui/themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaceIcon,
  StarFilledIcon,
  LightningBoltIcon,
  HeartFilledIcon,
  RocketIcon,
} from "@radix-ui/react-icons";

const iconMap = {
  EmojiEmotions: FaceIcon,
  Whatshot: LightningBoltIcon,
  Star: StarFilledIcon,
  Spa: HeartFilledIcon,
  Bolt: RocketIcon,
} as const;

interface Props {
  message: { id: string; text: string; icon: string };
  isVisible: boolean;
}

export const MotivationMessage = ({ message, isVisible }: Props) => {
  const Icon =
    iconMap[message.icon as keyof typeof iconMap] ?? StarFilledIcon;

  return (
    <div style={{ minHeight: 64, marginBottom: 24 }}>
      <AnimatePresence mode="wait" initial={false}>
        {isVisible && (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <Flex
              align="center"
              gap="3"
              display="inline-flex"
              px="3"
              py="2"
              style={{
                background: "var(--accent-9)",
                color: "var(--accent-contrast)",
                borderRadius: "var(--radius-4)",
                boxShadow: "0 4px 12px var(--accent-a4)",
              }}
            >
              <Avatar
                size="2"
                radius="full"
                fallback={<Icon />}
                style={{
                  background: "rgba(255,255,255,0.18)",
                  color: "white",
                }}
              />
              <Text size="3" weight="medium" style={{ color: "inherit" }}>
                {message.text}
              </Text>
            </Flex>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
