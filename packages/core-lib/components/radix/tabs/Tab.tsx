import React from "react";
import { Box, Text } from "@radix-ui/themes";

interface TabProps {
  id?: string;
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick?: () => void;
  "aria-controls"?: string;
}

export const Tab: React.FC<TabProps> = ({
  id,
  label,
  active,
  disabled,
  onClick,
  ...rest
}) => (
  <Box
    asChild
    style={{
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      padding: "12px 24px",
      borderBottom: active
        ? "2px solid var(--accent-9)"
        : "2px solid transparent",
      background: active ? "var(--accent-a3)" : "transparent",
      color: active ? "var(--accent-11)" : "var(--gray-12)",
      transition: "background 120ms ease, border-color 120ms ease",
      userSelect: "none",
    }}
  >
    <button
      id={id}
      type="button"
      role="tab"
      aria-selected={active}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      <Text size="2" weight="bold">
        {label}
      </Text>
    </button>
  </Box>
);
