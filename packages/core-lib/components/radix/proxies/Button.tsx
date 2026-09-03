import React from "react";
import { Button as RadixButton, type ButtonProps } from "@radix-ui/themes";
import { useDesignTokens } from "../../../design-system";

type Props = ButtonProps;

const defaultVariant = "solid" as const;

export const Button: React.FC<Props> = ({ variant, ...props }) => {
  const { tokens } = useDesignTokens();
  return <RadixButton variant={variant ?? defaultVariant} color={tokens.accentColor} {...props} />;
};
