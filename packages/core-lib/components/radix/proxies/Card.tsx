import React from "react";
import { Card as RadixCard, type CardProps } from "@radix-ui/themes";
import { useDesignTokens } from "../../../design-system";

type Props = CardProps;

export const Card: React.FC<Props> = ({ variant, ...props }) => {
  const { tokens } = useDesignTokens();
  return <RadixCard variant={variant ?? "surface"} {...props} />;
};
