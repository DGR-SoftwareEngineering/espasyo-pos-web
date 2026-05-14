import React from "react";
import { Tooltip as RadixTooltip } from "@radix-ui/themes";

interface TooltipProps {
  title: React.ReactNode;
  children: React.ReactElement;
  delayDuration?: number;
  side?: "top" | "right" | "bottom" | "left";
}

export const Tooltip: React.FC<TooltipProps> = ({
  title,
  children,
  delayDuration = 300,
  side = "top",
}) => (
  <RadixTooltip content={title} delayDuration={delayDuration} side={side}>
    {children}
  </RadixTooltip>
);
