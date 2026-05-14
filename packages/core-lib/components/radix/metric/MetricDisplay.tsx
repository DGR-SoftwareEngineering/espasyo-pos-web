import React from "react";
import { Box, Flex, Text, Tooltip } from "@radix-ui/themes";

interface Props {
  label: string;
  value: string;
  icon?: React.ReactNode;
  iconColor?: string;
  valueColor?: string;
  tooltip?: React.ReactNode;
  showTooltip?: boolean;
}

export const MetricDisplay: React.FC<Props> = ({
  label,
  value,
  icon,
  iconColor,
  valueColor,
  tooltip,
  showTooltip = false,
}) => {
  const content = (
    <Flex direction="column" gap="1">
      <Text size="1" color="gray">
        {label}
      </Text>
      <Flex align="center" gap="1">
        {icon && (
          <Box style={{ color: iconColor, display: "inline-flex" }}>{icon}</Box>
        )}
        <Text
          size="2"
          weight="bold"
          style={{
            color: valueColor,
            cursor: showTooltip ? "help" : undefined,
          }}
        >
          {value}
        </Text>
      </Flex>
    </Flex>
  );

  if (showTooltip && tooltip) {
    return (
      <Tooltip content={tooltip as string}>
        <Box>{content}</Box>
      </Tooltip>
    );
  }

  return content;
};
