import React from "react";
import { Box, Card, Flex, Text, Separator } from "@radix-ui/themes";

interface StepShellProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const StepShell: React.FC<StepShellProps> = ({
  icon,
  title,
  subtitle,
  children,
  actions,
}) => {
  return (
    <Card style={{ width: "100%" }}>
      {/* Header Band — Translucent accent, matches user-management pattern */}
      <Flex
        align="center"
        gap="3"
        px="4"
        py="3"
        style={{
          background: "var(--accent-a2)",
          borderBottom: "1px solid var(--accent-a4)",
          borderTopLeftRadius: "inherit",
          borderTopRightRadius: "inherit",
        }}
      >
        {/* Icon container — 44px circle with accent background */}
        <Box
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "var(--accent-a3)",
            color: "var(--accent-11)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        {/* Title and subtitle */}
        <Box>
          <Text as="div" weight="bold" size="4">
            {title}
          </Text>
          {subtitle && (
            <Text as="div" size="2" color="gray">
              {subtitle}
            </Text>
          )}
        </Box>
      </Flex>

      {/* Body */}
      <Box style={{ padding: "1.5rem" }}>
        {children}
      </Box>

      {/* Actions Footer */}
      {actions && (
        <>
          <Separator />
          <Box style={{ padding: "1rem 1.5rem" }}>
            {actions}
          </Box>
        </>
      )}
    </Card>
  );
};
