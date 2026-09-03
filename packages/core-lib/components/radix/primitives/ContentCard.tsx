import React from "react";
import { Card, type CardProps } from "@radix-ui/themes";
import { useDesignTokens } from "../../../design-system";

interface Props extends Omit<CardProps, "variant"> {
  variant?: "surface" | "classic" | "ghost";
}

export const ContentCard: React.FC<React.PropsWithChildren<Props>> = ({
  variant = "surface",
  style,
  ...props
}) => {
  const t = useDesignTokens();

  return (
    <Card
      variant={variant}
      style={{
        padding: t.spacing[5],
        ...style,
      }}
      {...props}
    />
  );
};
