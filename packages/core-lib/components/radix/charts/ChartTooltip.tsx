import React from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { formatChartValue } from "./format";
import { ChartNumberFormat, ChartSeries } from "./types";

interface RechartsPayloadEntry {
  name: string;
  value: number | string;
  color?: string;
  dataKey?: string;
  payload?: Record<string, unknown>;
}

interface Props {
  active?: boolean;
  label?: string | number;
  payload?: RechartsPayloadEntry[];
  numberFormat?: ChartNumberFormat;
  series?: ChartSeries[];
}

/**
 * Radix-styled custom Recharts tooltip. Renders a small floating panel with
 * the X label, then one row per series with a color swatch, name, and
 * formatted value.
 */
export const ChartTooltip: React.FC<Props> = ({
  active,
  label,
  payload,
  numberFormat,
  series,
}) => {
  if (!active || !payload?.length) return null;

  const seriesById = new Map(series?.map((s) => [s.id, s]) ?? []);

  return (
    <Box
      data-testid="chart-tooltip"
      p="2"
      style={{
        background: "var(--color-panel-solid)",
        border: "1px solid var(--gray-a5)",
        borderRadius: "var(--radius-2)",
        boxShadow: "var(--shadow-3)",
        minWidth: 140,
      }}
    >
      {label !== undefined && (
        <Text size="1" color="gray" as="div" mb="1">
          {String(label)}
        </Text>
      )}
      <Flex direction="column" gap="1">
        {payload.map((entry, idx) => {
          const seriesDef = entry.dataKey
            ? seriesById.get(String(entry.dataKey))
            : undefined;
          const displayName = seriesDef?.name ?? entry.name;
          return (
            <Flex
              key={`${entry.dataKey ?? entry.name}-${idx}`}
              align="center"
              justify="between"
              gap="3"
            >
              <Flex align="center" gap="2" style={{ minWidth: 0 }}>
                <Box
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: entry.color,
                    flexShrink: 0,
                  }}
                />
                <Text size="1" color="gray" truncate>
                  {displayName}
                </Text>
              </Flex>
              <Text size="1" weight="medium">
                {formatChartValue(entry.value, numberFormat)}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};
