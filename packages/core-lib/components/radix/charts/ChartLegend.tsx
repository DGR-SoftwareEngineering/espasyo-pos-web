import React from "react";
import { Box, Flex, Text } from "@radix-ui/themes";

interface LegendEntry {
  id: string;
  name: string;
  color: string;
}

interface Props {
  entries: LegendEntry[];
  align?: "start" | "center" | "end";
  hidden?: Set<string>;
  onToggle?: (id: string) => void;
}

/**
 * Inline legend rendered alongside the chart header — preferred to Recharts'
 * built-in legend, which crowds the plot area and doesn't theme cleanly.
 */
export const ChartLegend: React.FC<Props> = ({
  entries,
  align = "start",
  hidden,
  onToggle,
}) => {
  if (entries.length === 0) return null;

  const justify =
    align === "center" ? "center" : align === "end" ? "end" : "start";

  return (
    <Flex
      data-testid="chart-legend"
      wrap="wrap"
      gap="3"
      justify={justify as "start" | "center" | "end"}
      style={{ rowGap: 4 }}
    >
      {entries.map((entry) => {
        const isHidden = hidden?.has(entry.id) ?? false;
        const interactive = !!onToggle;
        return (
          <Flex
            key={entry.id}
            align="center"
            gap="1"
            onClick={interactive ? () => onToggle?.(entry.id) : undefined}
            style={{
              cursor: interactive ? "pointer" : "default",
              opacity: isHidden ? 0.4 : 1,
              userSelect: "none",
              transition: "opacity 0.15s",
            }}
          >
            <Box
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: entry.color,
                flexShrink: 0,
              }}
            />
            <Text size="1" color="gray">
              {entry.name}
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
};
