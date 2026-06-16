import React from "react";
import { Card, Flex, Text, Box, Heading } from "@radix-ui/themes";
import { resolveAccent, MuiSemanticColor, RadixAccent, radixVar } from "./_utils";

interface StatsCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  /** Accepts the MUI palette name OR a Radix accent name. */
  color?: MuiSemanticColor | RadixAccent;
  formatValue?: (value: number | string) => string;
  trend?: { value: number; label: string };
  variant?: "default" | "compact" | "detailed";
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon,
  color = "primary",
  formatValue = (v) => (v != null ? v.toString() : "0"),
  trend,
  variant = "default",
  onClick,
  className,
  style,
}) => {
  const accent = resolveAccent(color);

  const surfaceStyle: React.CSSProperties = {
    flex: 1,
    minWidth: variant === "compact" ? 120 : 150,
    cursor: onClick ? "pointer" : undefined,
    transition: "all 0.15s ease-in-out",
    borderColor: radixVar.accentAlpha(accent, 4),
    background: radixVar.accentAlpha(accent, 2),
    ...style,
  };

  return (
    <Card
      variant="surface"
      size={variant === "compact" ? "1" : "2"}
      onClick={onClick}
      className={className}
      style={surfaceStyle}
    >
      {variant === "compact" ? (
        <Flex align="center" gap="3">
          {icon && (
            <Box
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--radius-3)",
                background: radixVar.accentAlpha(accent, 3),
                color: radixVar.accent(accent, 11),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icon}
            </Box>
          )}
          <Flex direction="column">
            <Heading
              size="4"
              weight="bold"
              style={{ color: radixVar.accent(accent, 11) }}
            >
              {formatValue(value ?? 0)}
            </Heading>
            <Text size="1" color="gray">
              {label}
            </Text>
          </Flex>
        </Flex>
      ) : variant === "detailed" ? (
        <Flex direction="column" gap="2">
          <Flex justify="between" align="center">
            <Text size="1" color="gray">
              {label}
            </Text>
            {icon && (
              <Box style={{ color: radixVar.accentAlpha(accent, 11) }}>
                {icon}
              </Box>
            )}
          </Flex>
          <Heading
            size="5"
            weight="bold"
            style={{ color: radixVar.accent(accent, 11) }}
          >
            {formatValue(value ?? 0)}
          </Heading>
          {trend && (
            <Flex align="center" gap="2">
              <Box
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background:
                    trend.value > 0 ? "var(--green-9)" : "var(--red-9)",
                }}
              />
              <Text size="1" color="gray">
                {trend.value > 0 ? "+" : ""}
                {trend.value}% {trend.label}
              </Text>
            </Flex>
          )}
        </Flex>
      ) : (
        <Flex direction="column" gap="1">
          <Text size="1" color="gray">
            {label}
          </Text>
          <Flex align="center" gap="2">
            {icon && (
              <Box style={{ color: radixVar.accentAlpha(accent, 11) }}>
                {icon}
              </Box>
            )}
            <Heading
              size="5"
              weight="bold"
              style={{ color: radixVar.accent(accent, 11) }}
            >
              {formatValue(value ?? 0)}
            </Heading>
          </Flex>
        </Flex>
      )}
    </Card>
  );
};
