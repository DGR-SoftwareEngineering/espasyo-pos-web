import React from "react";
import { Avatar, Badge, Box, Flex, Heading, Progress, Text } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { StarFilledIcon } from "@radix-ui/react-icons";
import { TIME_OF_DAY } from "../constants/timeOfDay";

const MotionDiv = motion.div;

interface Props {
  name: string;
  role: string;
  timeOfDay: keyof typeof TIME_OF_DAY;
  transactions?: number;
  progress?: number;
}

export const WelcomeHeader = ({
  name,
  role,
  timeOfDay,
  transactions = 156,
  progress = 75,
}: Props) => {
  const config = TIME_OF_DAY[timeOfDay];
  const Icon = config.icon;

  return (
    <MotionDiv
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <Box
        p="5"
        style={{
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
          borderRadius: "var(--radius-4)",
          background:
            "linear-gradient(135deg, var(--accent-9) 0%, var(--accent-11) 100%)",
          color: "var(--accent-contrast)",
          border: "1px solid var(--accent-a6)",
          boxShadow: "var(--shadow-3)",
        }}
      >
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: 280,
            height: 280,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <Flex
          justify="between"
          align={{ initial: "start", sm: "center" }}
          wrap="wrap"
          gap="4"
          style={{ position: "relative" }}
        >
          <Flex align="center" gap="4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 220 }}
            >
              <Avatar
                size="5"
                fallback={<Icon />}
                radius="full"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.35)",
                }}
              />
            </motion.div>
            <Box>
              <Heading size="7" weight="bold" style={{ color: "inherit" }}>
                {greetingPrefix()}, {name}! 👋
              </Heading>
              <Text size="2" style={{ color: "inherit", opacity: 0.85 }}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </Box>
          </Flex>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Box style={{ minWidth: 220 }}>
              <Badge
                color="amber"
                variant="solid"
                radius="full"
                size="2"
                style={{ marginBottom: 8 }}
              >
                <StarFilledIcon /> {role} of the Month
              </Badge>
              <Heading
                size="8"
                weight="bold"
                style={{ color: "inherit", lineHeight: 1.05 }}
              >
                {transactions}
              </Heading>
              <Text size="2" style={{ color: "inherit", opacity: 0.85 }}>
                Transactions today
              </Text>
              <Box mt="2">
                <Progress
                  value={progress}
                  size="2"
                  radius="full"
                  style={{ background: "rgba(255,255,255,0.18)" }}
                />
              </Box>
            </Box>
          </motion.div>
        </Flex>
      </Box>
    </MotionDiv>
  );
};

function greetingPrefix(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}
