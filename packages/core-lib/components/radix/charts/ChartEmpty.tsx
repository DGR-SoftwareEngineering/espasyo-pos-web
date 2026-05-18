import React from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { BarChartIcon } from "@radix-ui/react-icons";
import { DEFAULT_CHART_HEIGHT } from "./constants";

interface Props {
  height?: number | string;
  title?: string;
  message?: string;
  hint?: string;
}

export const ChartEmpty: React.FC<Props> = ({
  height = DEFAULT_CHART_HEIGHT,
  title = "No data yet",
  message = "Once data flows into this chart, it'll show up here.",
  hint,
}) => {
  const resolvedHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <Flex
      data-testid="chart-empty"
      direction="column"
      align="center"
      justify="center"
      gap="2"
      style={{
        width: "100%",
        height: resolvedHeight,
        minHeight: 180,
        borderRadius: "var(--radius-3)",
        background: "var(--gray-a2)",
        border: "1px dashed var(--gray-a5)",
      }}
    >
      <Box
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "var(--gray-a3)",
          color: "var(--gray-11)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BarChartIcon width="22" height="22" />
      </Box>
      <Text size="2" weight="medium">
        {title}
      </Text>
      <Text size="1" color="gray" align="center" style={{ maxWidth: 260 }}>
        {message}
      </Text>
      {hint && (
        <Text size="1" color="gray" align="center" style={{ opacity: 0.7 }}>
          {hint}
        </Text>
      )}
    </Flex>
  );
};
