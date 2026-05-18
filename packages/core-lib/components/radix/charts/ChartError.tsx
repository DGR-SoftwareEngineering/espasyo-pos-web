import React from "react";
import { Box, Button, Callout, Flex, Text } from "@radix-ui/themes";
import {
  ExclamationTriangleIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { DEFAULT_CHART_HEIGHT } from "./constants";

interface Props {
  height?: number | string;
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ChartError: React.FC<Props> = ({
  height = DEFAULT_CHART_HEIGHT,
  title = "Couldn't load chart",
  message,
  onRetry,
}) => {
  const resolvedHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <Flex
      data-testid="chart-error"
      direction="column"
      align="center"
      justify="center"
      gap="3"
      p="4"
      style={{
        width: "100%",
        height: resolvedHeight,
        minHeight: 180,
        borderRadius: "var(--radius-3)",
        background: "var(--red-a2)",
        border: "1px solid var(--red-a4)",
      }}
    >
      <Box
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "var(--red-a3)",
          color: "var(--red-11)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ExclamationTriangleIcon width="22" height="22" />
      </Box>
      <Box style={{ textAlign: "center", maxWidth: 320 }}>
        <Text size="2" weight="medium" as="div">
          {title}
        </Text>
        <Text size="1" color="gray" as="div" mt="1">
          {message}
        </Text>
      </Box>
      {onRetry && (
        <Button
          variant="soft"
          color="gray"
          size="2"
          onClick={onRetry}
        >
          <ReloadIcon /> Retry
        </Button>
      )}
    </Flex>
  );
};

interface InlineProps {
  message: string;
}

export const ChartInlineError: React.FC<InlineProps> = ({ message }) => (
  <Callout.Root color="red" variant="surface" size="1">
    <Callout.Icon>
      <ExclamationTriangleIcon />
    </Callout.Icon>
    <Callout.Text>{message}</Callout.Text>
  </Callout.Root>
);
