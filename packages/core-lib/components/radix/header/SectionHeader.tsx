import React from "react";
import { Badge, Box, Flex, Separator, Text } from "@radix-ui/themes";

interface SectionHeaderProps {
  icon?: React.ReactNode;
  title: string;
  badge?: string | number;
  subtitle?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  badge,
  subtitle,
  action,
}) => (
  <>
    <Flex
      direction="row"
      align="center"
      justify="between"
      gap="2"
      mb="2"
    >
      <Flex direction="row" align="center" gap="2">
        {icon && (
          <Box style={{ color: "var(--accent-9)", display: "inline-flex" }}>
            {icon}
          </Box>
        )}
        <Box>
          <Text size="2" weight="bold" as="div" color="gray">
            {title}
          </Text>
          {subtitle && (
            <Text size="1" color="gray" as="div">
              {subtitle}
            </Text>
          )}
        </Box>
        {badge !== undefined && badge !== null && (
          <Badge color="indigo" variant="soft">
            {badge}
          </Badge>
        )}
      </Flex>
      {action}
    </Flex>
    <Separator size="4" mb="3" />
  </>
);
