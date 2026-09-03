import React from "react";
import {
  Box,
  Flex,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Card,
} from "@radix-ui/themes";;
import { PlatformDto, CreatePlatformParams, UpdatePlatformParams } from "core-lib/api/platform/types";

interface PlatformFormProps {
  data?: PlatformDto | CreatePlatformParams | UpdatePlatformParams;
  isEdit?: boolean;
  isInDialog?: boolean;
  onChange?: (field: string, value: any) => void;
}

export const PlatformForm: React.FC<PlatformFormProps> = ({
  data,
  isEdit = false,
  isInDialog = false,
  onChange,
}) => {
  const Container = isInDialog ? Box : Card;

  return (
    <Container style={{ padding: isInDialog ? 0 : "var(--space-4)" }}>
      <Flex direction="column" gap="5">
        <Box>
          <Text as="label" size="2" weight="medium">
            Platform Name
          </Text>
          <input
            type="text"
            placeholder="e.g., Customer Portal"
            value={(data as any)?.name || ""}
            onChange={(e: any) => onChange?.("name", e.target.value)}
            style={{
              marginTop: "var(--space-2)",
              width: "100%",
              padding: "var(--space-2)",
              borderRadius: "var(--radius-2)",
              border: "1px solid var(--gray-7)",
              fontFamily: "inherit",
            }}
          />
        </Box>

        <Box>
          <Text as="label" size="2" weight="medium">
            Slug Key
          </Text>
          <input
            type="text"
            placeholder="e.g., customer-portal"
            value={(data as any)?.slugKey || ""}
            onChange={(e: any) => onChange?.("slugKey", e.target.value)}
            disabled={isEdit}
            style={{
              marginTop: "var(--space-2)",
              width: "100%",
              padding: "var(--space-2)",
              borderRadius: "var(--radius-2)",
              border: "1px solid var(--gray-7)",
              fontFamily: "inherit",
              opacity: isEdit ? 0.6 : 1,
            }}
          />
          <Text size="1" color="gray" style={{ marginTop: "var(--space-1)" }}>
            {isEdit
              ? "Slug key cannot be changed after creation"
              : "Lowercase letters, numbers, and hyphens only"}
          </Text>
        </Box>

        <Box>
          <Text as="label" size="2" weight="medium">
            Description
          </Text>
          <textarea
            placeholder="Brief description of the platform purpose..."
            value={(data as any)?.description || ""}
            onChange={(e: any) => onChange?.("description", e.target.value)}
            style={{
              marginTop: "var(--space-2)",
              width: "100%",
              minHeight: "100px",
              padding: "var(--space-2)",
              borderRadius: "var(--radius-2)",
              border: "1px solid var(--gray-7)",
              fontFamily: "inherit",
            }}
          />
        </Box>
      </Flex>
    </Container>
  );
};
