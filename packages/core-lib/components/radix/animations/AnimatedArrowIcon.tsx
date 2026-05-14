import React from "react";
import { ChevronUpIcon } from "@radix-ui/react-icons";

interface Props {
  open?: boolean;
  /** Accepts a Radix accent name or any CSS color string. */
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

export const AnimatedArrowIcon: React.FC<Props> = ({
  open,
  color,
  width = 20,
  height = 20,
  className,
}) => (
  <ChevronUpIcon
    width={width}
    height={height}
    className={className}
    aria-label={open ? "Collapse" : "Expand"}
    style={{
      color: color
        ? color.startsWith("var(") || color.startsWith("#") || color.startsWith("rgb")
          ? color
          : `var(--${color}-9)`
        : "var(--accent-9)",
      transform: `rotate(${open ? 0 : 180}deg)`,
      transition: "transform 0.2s ease",
    }}
  />
);
