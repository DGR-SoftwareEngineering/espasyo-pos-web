import React from "react";
import { Box, Flex } from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Button } from "./Button";

interface Props {
  onClick: () => void;
  disabled?: boolean;
  text?: string;
  loading?: boolean;
}

export const BackButton: React.FC<Props> = ({
  onClick,
  disabled,
  text = "Back",
  loading,
}) => (
  <Box width="100%" my="1" style={{ display: "flex", justifyContent: "flex-start" }}>
    <Button
      type="Link"
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      data-testid="back-button"
    >
      <Flex align="center" gap="2">
        <ArrowLeftIcon />
        {text}
      </Flex>
    </Button>
  </Box>
);
