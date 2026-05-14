import React from "react";
import { Checkbox as RadixCheckbox, Flex, Text } from "@radix-ui/themes";

interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  label?: React.ReactNode;
  disabled?: boolean;
  size?: "1" | "2" | "3";
  color?: React.ComponentProps<typeof RadixCheckbox>["color"];
  className?: string;
  "data-testid"?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  defaultChecked,
  onCheckedChange,
  label,
  disabled,
  size = "2",
  color,
  className,
  ...rest
}) => {
  const cb = (
    <RadixCheckbox
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      size={size}
      color={color}
      data-testid={rest["data-testid"]}
    />
  );

  if (!label) return cb;

  return (
    <Text as="label" size="2" className={className}>
      <Flex gap="2" align="center">
        {cb}
        {label}
      </Flex>
    </Text>
  );
};
