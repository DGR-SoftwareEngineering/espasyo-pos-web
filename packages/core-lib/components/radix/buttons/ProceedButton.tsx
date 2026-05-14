import React from "react";
import { Box, Flex } from "@radix-ui/themes";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Button } from "./Button";

interface Props {
  onClick: () => void;
  disabled?: boolean;
  text?: string;
  loading?: boolean;
}

export const ProceedButton: React.FC<Props> = ({
  onClick,
  disabled,
  text = "Proceed",
  loading,
}) => (
  <Box width="100%" my="3" style={{ display: "flex", justifyContent: "flex-end" }}>
    <Button
      type="Primary"
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      data-testid="proceed-button"
    >
      <Flex align="center" gap="2">
        {text}
        <ArrowRightIcon />
      </Flex>
    </Button>
  </Box>
);
