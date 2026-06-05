import React from "react";
import { Text, Flex } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface FieldErrorProps {
  message?: string | null;
  className?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({
  message,
  className,
}) => {
  if (!message) return null;
  return (
    <Flex
      gap="1"
      align="center"
      mt="1"
      className={className}
      role="alert"
      aria-live="polite"
    >
      <ExclamationTriangleIcon
        width="14"
        height="14"
        style={{ color: "var(--red-9)" }}
      />
      <Text size="1" style={{ color: "var(--red-11)" }}>
        {message}
      </Text>
    </Flex>
  );
};
