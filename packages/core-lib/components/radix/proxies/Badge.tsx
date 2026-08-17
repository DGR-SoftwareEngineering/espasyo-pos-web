import React from "react";
import { Badge as RadixBadge, type BadgeProps } from "@radix-ui/themes";
import { useDesignTokens } from "../../../design-system";

type Props = BadgeProps;

export const Badge: React.FC<Props> = ({ color, ...props }) => {
  const t = useDesignTokens();
  return <RadixBadge color={color ?? t.accentColor} {...props} />;
};
