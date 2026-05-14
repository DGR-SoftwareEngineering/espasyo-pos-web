import React from "react";
import { Box, Flex, Text, Spinner } from "@radix-ui/themes";

interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = "Loading…",
  fullScreen = false,
  className,
  style,
}) => {
  const content = (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap="3"
      style={{
        padding: 24,
        minHeight: fullScreen ? "100vh" : 240,
        ...style,
      }}
      className={className}
      role="status"
      aria-live="polite"
    >
      <Spinner size="3" loading />
      <Text size="2" color="gray">
        {message}
      </Text>
    </Flex>
  );

  if (!fullScreen) return content;

  return (
    <Box
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--color-overlay)",
        backdropFilter: "blur(2px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {content}
    </Box>
  );
};
