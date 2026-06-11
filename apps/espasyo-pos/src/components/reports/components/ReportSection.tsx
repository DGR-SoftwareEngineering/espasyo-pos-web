import React, { memo } from "react";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { motion } from "framer-motion";
import type { Accent } from "../types";

interface ReportSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: Accent;
  delay: number;
  children: React.ReactNode;
}

const ReportSectionInner: React.FC<ReportSectionProps> = ({ title, description, icon, accent, delay, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
  >
    <Box mb="5">
      <Flex align="center" gap="3" mb="4">
        <Box
          style={{
            width: 34,
            height: 34,
            borderRadius: "var(--radius-2)",
            background: `var(--${accent}-a3)`,
            color: `var(--${accent}-11)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box style={{ minWidth: 0 }}>
          <Heading size="4" weight="bold">
            {title}
          </Heading>
          <Text size="2" color="gray">
            {description}
          </Text>
        </Box>
      </Flex>
      {children}
    </Box>
  </motion.div>
);

export const ReportSection = memo(ReportSectionInner);
ReportSection.displayName = "ReportSection";
