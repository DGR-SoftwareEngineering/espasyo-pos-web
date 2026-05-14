import React from "react";
import { Badge, BadgeProps } from "@radix-ui/themes";
import { resolveAccent, MuiSemanticColor, RadixAccent } from "../_utils";

export type LabelColor = MuiSemanticColor | RadixAccent;
export type LabelVariant = "filled" | "outlined" | "soft" | "inverted";

export interface LabelProps {
  color?: LabelColor;
  variant?: LabelVariant;
  disabled?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const VARIANT_MAP: Record<LabelVariant, BadgeProps["variant"]> = {
  filled: "solid",
  outlined: "outline",
  soft: "soft",
  inverted: "solid",
};

export const Label: React.FC<LabelProps> = ({
  color = "default",
  variant = "soft",
  disabled,
  startIcon,
  endIcon,
  children,
  className,
  style,
}) => (
  <Badge
    color={resolveAccent(color, "gray")}
    variant={VARIANT_MAP[variant]}
    className={className}
    style={{
      opacity: disabled ? 0.6 : undefined,
      pointerEvents: disabled ? "none" : undefined,
      gap: 4,
      ...style,
    }}
  >
    {startIcon && (
      <span style={{ display: "inline-flex", alignItems: "center" }}>
        {startIcon}
      </span>
    )}
    {typeof children === "string"
      ? children.charAt(0).toUpperCase() + children.slice(1)
      : children}
    {endIcon && (
      <span style={{ display: "inline-flex", alignItems: "center" }}>
        {endIcon}
      </span>
    )}
  </Badge>
);
