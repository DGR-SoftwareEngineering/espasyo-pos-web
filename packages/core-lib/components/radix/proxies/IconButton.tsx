import React from "react";
import { IconButton as RadixIconButton, type IconButtonProps } from "@radix-ui/themes";
import { useDesignTokens } from "../../../design-system";

type Props = IconButtonProps;

export const IconButton: React.FC<Props> = ({ variant, ...props }) => {
  const t = useDesignTokens();
  return <RadixIconButton variant={variant ?? "ghost"} color={t.accentColor} {...props} />;
};
