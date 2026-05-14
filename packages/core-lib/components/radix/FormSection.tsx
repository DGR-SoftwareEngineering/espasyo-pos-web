import React from "react";
import { Flex, Text, Box, Separator } from "@radix-ui/themes";

interface FormSectionProps {
  icon: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  icon,
  title,
  description,
  children,
}) => (
  <Flex direction="column" gap="2" width="100%">
    <Flex align="center" gap="2">
      <Box style={{ display: "inline-flex", alignItems: "center" }}>{icon}</Box>
      <Text size="3" weight="bold">
        {title}
      </Text>
      <Separator orientation="horizontal" style={{ flex: 1, marginLeft: 8 }} />
    </Flex>

    {description && <Box>{description}</Box>}

    {children}
  </Flex>
);
