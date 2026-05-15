import React from "react";
import { TextField as RadixTextField } from "@radix-ui/themes";

export interface InputProps
  extends Omit<React.ComponentProps<typeof RadixTextField.Root>, "size"> {
  size?: "1" | "2" | "3";
  error?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  size = "2",
  error,
  startAdornment,
  endAdornment,
  style,
  ...rest
}) => (
  <RadixTextField.Root
    size={size}
    color={error ? "red" : undefined}
    style={{ width: "100%", ...style }}
    {...rest}
  >
    {startAdornment && (
      <RadixTextField.Slot side="left">{startAdornment}</RadixTextField.Slot>
    )}
    {endAdornment && (
      <RadixTextField.Slot side="right">{endAdornment}</RadixTextField.Slot>
    )}
  </RadixTextField.Root>
);
