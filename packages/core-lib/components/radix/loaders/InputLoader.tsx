import React from "react";
import { Flex, Spinner, Text } from "@radix-ui/themes";

interface InputLoaderProps {
  message?: string;
}

export const InputLoader: React.FC<InputLoaderProps> = ({
  message = "Loading…",
}) => (
  <Flex
    align="center"
    gap="2"
    px="2"
    py="2"
    style={{
      border: "1px solid var(--gray-a4)",
      borderRadius: "var(--radius-2)",
      background: "var(--color-surface)",
    }}
  >
    <Spinner size="1" loading />
    <Text size="1" color="gray">
      {message}
    </Text>
  </Flex>
);
