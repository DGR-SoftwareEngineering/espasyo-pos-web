import React, { useMemo } from "react";
import { Badge, Box, Flex, Text, Tooltip, Progress } from "@radix-ui/themes";
import { IngredientStats } from "../../core/types/ingredients";
import { formatCurrency } from "../../business/strings";

interface Props {
  stats: IngredientStats;
  total: number;
}

export const CostDistributionBar: React.FC<Props> = ({ stats, total }) => {
  const items = useMemo(
    () => [
      {
        label: "Min",
        value: stats.min,
        percentage: (stats.min / total) * 100,
        color: "green" as const,
      },
      {
        label: "Avg",
        value: stats.avg,
        percentage: (stats.avg / total) * 100,
        color: "blue" as const,
      },
      {
        label: "Max",
        value: stats.max,
        percentage: (stats.max / total) * 100,
        color: "amber" as const,
      },
    ],
    [stats, total],
  );

  const tooltipContent = (
    <Box>
      {items.map(({ label, percentage }) => (
        <Text key={label} as="div" size="1">
          • {label} ingredient: {percentage.toFixed(1)}% of total
        </Text>
      ))}
    </Box>
  );

  return (
    <Box mb="4">
      <Flex justify="between" align="center" mb="2">
        <Text size="1" color="gray">
          Cost Distribution (each bar = ingredient cost % of total)
        </Text>
        <Tooltip content={tooltipContent}>
          <Badge variant="soft" color="gray" style={{ cursor: "help" }}>
            What's this?
          </Badge>
        </Tooltip>
      </Flex>

      <Flex direction="column" gap="2">
        {items.map(({ label, value, percentage, color }) => (
          <Box key={label}>
            <Flex justify="between" mb="1">
              <Text size="1">
                {label} ({formatCurrency(value)})
              </Text>
              <Text size="1">{percentage.toFixed(1)}%</Text>
            </Flex>
            <Progress value={percentage} color={color} size="2" radius="full" />
          </Box>
        ))}
      </Flex>
    </Box>
  );
};
