import React from "react";
import { Box, Flex, Skeleton, Text } from "@radix-ui/themes";
import { DEFAULT_CHART_HEIGHT } from "./constants";

interface Props {
  height?: number | string;
  message?: string;
  variant?: "cartesian" | "donut";
}

export const ChartLoader: React.FC<Props> = ({
  height = DEFAULT_CHART_HEIGHT,
  message = "Loading chart…",
  variant = "cartesian",
}) => {
  const resolvedHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <Flex
      data-testid="chart-loader"
      direction="column"
      gap="3"
      aria-busy="true"
      aria-live="polite"
      style={{ width: "100%", height: resolvedHeight, minHeight: 180 }}
    >
      {variant === "cartesian" ? (
        <>
          <Flex justify="between" align="center">
            <Skeleton width="120px" height="10px" />
            <Flex gap="2">
              <Skeleton width="50px" height="10px" />
              <Skeleton width="50px" height="10px" />
              <Skeleton width="50px" height="10px" />
            </Flex>
          </Flex>
          <Box
            style={{
              flex: 1,
              position: "relative",
              borderRadius: "var(--radius-3)",
              overflow: "hidden",
            }}
          >
            <Skeleton style={{ position: "absolute", inset: 0 }} />
            <Box
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                gridTemplateRows: "repeat(4, 1fr)",
                pointerEvents: "none",
              }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <Box
                  key={i}
                  style={{
                    borderBottom: "1px dashed var(--gray-a4)",
                  }}
                />
              ))}
            </Box>
          </Box>
          <Flex justify="between" px="2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} width="24px" height="8px" />
            ))}
          </Flex>
        </>
      ) : (
        <Flex
          align="center"
          justify="center"
          style={{ flex: 1, position: "relative" }}
        >
          <Box
            style={{
              width: 180,
              height: 180,
              borderRadius: "50%",
              background:
                "conic-gradient(var(--gray-a3) 0deg, var(--gray-a4) 90deg, var(--gray-a3) 180deg, var(--gray-a4) 270deg, var(--gray-a3) 360deg)",
              position: "relative",
            }}
          >
            <Box
              style={{
                position: "absolute",
                inset: "32%",
                background: "var(--color-panel-solid)",
                borderRadius: "50%",
              }}
            />
          </Box>
        </Flex>
      )}
      <Text size="1" color="gray" align="center">
        {message}
      </Text>
    </Flex>
  );
};
