import React from "react";
import { Box, Card, Flex, Heading, Text } from "@radix-ui/themes";

interface Props {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  iconAccent?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const StepShell: React.FC<Props> = ({
  icon,
  title,
  subtitle,
  iconAccent = "var(--accent-11)",
  children,
  actions,
}) => (
  <Card variant="surface" size="3" style={{ width: "100%" }}>
    <Flex
      align="center"
      gap="3"
      px="4"
      py="3"
      style={{
        background: "var(--accent-a2)",
        borderBottom: "1px solid var(--accent-a4)",
      }}
    >
      <Box
        style={{
          width: 44,
          height: 44,
          borderRadius: "var(--radius-3)",
          background: "var(--accent-a3)",
          color: iconAccent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Heading size="4" weight="bold">
          {title}
        </Heading>
        {subtitle && (
          <Text size="2" color="gray">
            {subtitle}
          </Text>
        )}
      </Box>
    </Flex>

    <Box p="4">{children}</Box>

    {actions && (
      <Box
        px="4"
        py="3"
        style={{ borderTop: "1px solid var(--gray-a4)" }}
      >
        {actions}
      </Box>
    )}
  </Card>
);
