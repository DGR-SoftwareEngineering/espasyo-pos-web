import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Dialog,
} from "@radix-ui/themes";;
import { RefreshOutlined } from "@mui/icons-material";
import { motion } from "framer-motion";

interface RefreshDialogProps {
  open: boolean;
}

export const RefreshDialog: React.FC<RefreshDialogProps> = ({ open }) => (
  <Dialog.Root open={open}>
    <Dialog.Content
      style={{
        maxWidth: 340,
        textAlign: "center",
        padding: "48px 32px 40px",
        borderRadius: 20,
        overflow: "visible",
      }}
      aria-describedby={undefined}
    >
      <Flex direction="column" align="center" gap="5">
        <Box style={{ position: "relative", width: 96, height: 96 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "3px dashed var(--accent-6)",
              opacity: 0.7,
            }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              inset: 10,
              borderRadius: "50%",
              border: "3px solid transparent",
              borderTopColor: "var(--accent-9)",
              borderRightColor: "var(--accent-7)",
            }}
          />
          <Flex
            align="center"
            justify="center"
            style={{
              position: "absolute",
              inset: 18,
              borderRadius: "50%",
              background: "var(--accent-3)",
            }}
          >
            <RefreshOutlined style={{ fontSize: 28, color: "var(--accent-9)" }} />
          </Flex>
        </Box>

        <Flex direction="column" gap="2" align="center">
          <Heading size="4" weight="bold">
            Refreshing Reports
          </Heading>
          <Text
            size="2"
            color="gray"
            style={{ animation: "pulse 1.8s ease-in-out infinite" }}
          >
            Updating all your data, please wait\u2026
          </Text>
        </Flex>
      </Flex>
    </Dialog.Content>
  </Dialog.Root>
);
