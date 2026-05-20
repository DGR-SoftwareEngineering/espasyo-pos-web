import React from "react";
import { Box, Callout, Flex, Heading, Text } from "@radix-ui/themes";
import { WarningAmberOutlined } from "@mui/icons-material";

import type { DetectGapDto } from "../../../../api/commons/types";
import { Button } from "../../../radix";

interface RecipeGapWarningProps {
  gap: DetectGapDto;
  onProceed: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

export const RecipeGapWarning: React.FC<RecipeGapWarningProps> = ({
  gap,
  onProceed,
  onCancel,
  disabled = false,
}) => {
  return (
    <Callout.Root color="amber" variant="surface" size="2" mb="4">
      <Flex gap="2">
        <Box style={{ flexShrink: 0, marginTop: 2 }}>
          <WarningAmberOutlined style={{ fontSize: 20, color: "var(--amber-11)" }} />
        </Box>
        <Box style={{ flex: 1 }}>
          <Heading size="3" weight="bold" mb="2" style={{ color: "var(--amber-11)" }}>
            ⚠️ Inventory gap detected
          </Heading>

          <Text size="2" as="div" mb="3" color="gray">
            {gap.message}
          </Text>

          <Text size="1" color="gray" as="div" mb="3">
            We recommend doing a <strong>physical stock count</strong> for this product's
            ingredients before creating the recipe. Once you create the recipe, we'll show
            you the detailed ingredient impact.
          </Text>

          <Flex gap="2">
            <Button
              type="Primary"
              onClick={onProceed}
              disabled={disabled}
            >
              Got it, proceed anyway
            </Button>
            <Button
              type="Secondary"
              onClick={onCancel}
              disabled={disabled}
            >
              Cancel
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Callout.Root>
  );
};
