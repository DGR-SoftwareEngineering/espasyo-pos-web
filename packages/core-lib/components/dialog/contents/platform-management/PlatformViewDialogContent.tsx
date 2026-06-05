import React from "react";
import { Box, Text, Badge, Flex } from "@radix-ui/themes";
import { PlatformDto } from "../../../../api/platform/types";

interface PlatformViewDialogContentProps {
  data: PlatformDto;
  onClose: () => void;
}

export const PlatformViewDialogContent: React.FC<PlatformViewDialogContentProps> = ({
  data,
}) => {
  return (
    <Box style={{ padding: "var(--space-4)" }}>
      <Flex direction="column" gap="4">
        <Box>
          <Text size="1" color="gray" weight="medium">
            Name
          </Text>
          <Text size="3" weight="bold" style={{ marginTop: "var(--space-1)" }}>
            {data.name}
          </Text>
        </Box>

        <Box>
          <Text size="1" color="gray" weight="medium">
            Slug Key
          </Text>
          <Badge variant="outline" color="gray" size="2" style={{ marginTop: "var(--space-1)" }}>
            {data.slugKey}
          </Badge>
        </Box>

        <Box>
          <Text size="1" color="gray" weight="medium">
            Type
          </Text>
          <Flex gap="2" style={{ marginTop: "var(--space-1)" }}>
            <Badge
              variant={data.isSystem ? "soft" : "outline"}
              color={data.isSystem ? "purple" : "gray"}
              size="1"
            >
              {data.isSystem ? "System" : "Custom"}
            </Badge>
          </Flex>
        </Box>

        <Box>
          <Text size="1" color="gray" weight="medium">
            Status
          </Text>
          <Flex align="center" gap="2" style={{ marginTop: "var(--space-1)" }}>
            <Box
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: data.isActive ? "var(--green-11)" : "var(--red-11)",
              }}
            />
            <Text size="2">{data.isActive ? "Active" : "Inactive"}</Text>
          </Flex>
        </Box>

        {data.description && (
          <Box>
            <Text size="1" color="gray" weight="medium">
              Description
            </Text>
            <Text size="2" style={{ marginTop: "var(--space-1)" }}>
              {data.description}
            </Text>
          </Box>
        )}
      </Flex>
    </Box>
  );
};
