import React from "react";
import { Callout } from "@radix-ui/themes";
import {
  CheckCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  CrossCircledIcon,
} from "@radix-ui/react-icons";

type AlertSeverity = "info" | "success" | "warning" | "error";

interface CardAlertProps {
  severity?: AlertSeverity;
  title?: React.ReactNode;
  children: React.ReactNode;
  variant?: React.ComponentProps<typeof Callout.Root>["variant"];
  className?: string;
}

const ICONS: Record<AlertSeverity, React.ReactNode> = {
  info: <InfoCircledIcon />,
  success: <CheckCircledIcon />,
  warning: <ExclamationTriangleIcon />,
  error: <CrossCircledIcon />,
};

const COLORS: Record<AlertSeverity, "blue" | "green" | "amber" | "red"> = {
  info: "blue",
  success: "green",
  warning: "amber",
  error: "red",
};

export const CardAlert: React.FC<CardAlertProps> = ({
  severity = "info",
  title,
  children,
  variant = "surface",
  className,
}) => (
  <Callout.Root color={COLORS[severity]} variant={variant} className={className}>
    <Callout.Icon>{ICONS[severity]}</Callout.Icon>
    <Callout.Text>
      {title && <strong style={{ display: "block", marginBottom: 4 }}>{title}</strong>}
      {children}
    </Callout.Text>
  </Callout.Root>
);
