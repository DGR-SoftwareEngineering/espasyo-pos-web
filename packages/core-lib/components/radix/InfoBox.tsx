import React from "react";
import { Callout } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";

interface InfoBoxProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  color?: React.ComponentProps<typeof Callout.Root>["color"];
  variant?: React.ComponentProps<typeof Callout.Root>["variant"];
  icon?: React.ReactNode;
  className?: string;
}

export const InfoBox: React.FC<InfoBoxProps> = ({
  title,
  children,
  color = "blue",
  variant = "surface",
  icon,
  className,
}) => (
  <Callout.Root color={color} variant={variant} className={className}>
    <Callout.Icon>{icon ?? <InfoCircledIcon />}</Callout.Icon>
    <Callout.Text>
      {title && <strong style={{ display: "block", marginBottom: 4 }}>{title}</strong>}
      {children}
    </Callout.Text>
  </Callout.Root>
);
