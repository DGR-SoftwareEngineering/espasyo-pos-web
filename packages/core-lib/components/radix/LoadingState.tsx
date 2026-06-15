import React from "react";
import { Flex, Spinner, Text } from "@radix-ui/themes";

interface LoadingStateProps {
  message?: string;
  minHeight?: number | string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading\u2026",
  minHeight = 240,
}) => (
  <Flex
    align="center"
    justify="center"
    style={{ minHeight }}
  >
    <Flex align="center" gap="2">
      <Spinner />
      <Text color="gray" size="2">{message}</Text>
    </Flex>
  </Flex>
);
