import React from "react";
import { Box, Flex, Text } from "@radix-ui/themes";

interface Props {
  label: string;
  value: React.ReactNode;
  caption?: string;
  direction?: "row" | "column";
}

export const InfoRow: React.FC<Props> = ({
  label,
  value,
  caption,
  direction = "column",
}) => {
  if (direction === "row") {
    return (
      <Flex justify="between" align="center">
        <Text size="2" color="gray">
          {label}
        </Text>
        <Box>
          <Text size="2" weight="medium" as="div">
            {value}
          </Text>
          {caption && (
            <Text size="1" color="gray" as="div">
              {caption}
            </Text>
          )}
        </Box>
      </Flex>
    );
  }

  return (
    <Box>
      <Text size="1" color="gray" as="div">
        {label}
      </Text>
      <Text size="2" as="div" style={{ marginTop: 2 }}>
        {value}
      </Text>
      {caption && (
        <Text size="1" color="gray" as="div" style={{ marginTop: 2 }}>
          {caption}
        </Text>
      )}
    </Box>
  );
};
