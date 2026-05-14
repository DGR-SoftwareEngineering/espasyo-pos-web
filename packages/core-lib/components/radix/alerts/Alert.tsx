import React, { useState } from "react";
import { Callout, IconButton, Flex } from "@radix-ui/themes";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";

type Severity = "info" | "success" | "warning" | "error";

interface Props {
  severity: Severity;
  title: string;
  description?: string;
  style?: React.CSSProperties;
  Icon?: React.ReactNode;
  hasCloseButton?: boolean;
}

const COLORS: Record<Severity, "blue" | "green" | "amber" | "red"> = {
  info: "blue",
  success: "green",
  warning: "amber",
  error: "red",
};

const DEFAULT_ICONS: Record<Severity, React.ReactNode> = {
  info: <InfoCircledIcon />,
  success: <CheckCircledIcon />,
  warning: <ExclamationTriangleIcon />,
  error: <CrossCircledIcon />,
};

export const Alert: React.FC<Props> = ({
  severity,
  title,
  description,
  style,
  Icon,
  hasCloseButton,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <Callout.Root
      color={COLORS[severity]}
      variant="surface"
      style={{ marginBottom: 16, ...style }}
    >
      <Callout.Icon>{Icon ?? DEFAULT_ICONS[severity]}</Callout.Icon>
      <Flex
        direction="column"
        gap="1"
        style={{ flex: 1, minWidth: 0 }}
      >
        <strong>{title}</strong>
        {description && <span>{description}</span>}
      </Flex>
      {hasCloseButton && (
        <IconButton
          variant="ghost"
          color="gray"
          aria-label="Dismiss"
          onClick={() => setIsOpen(false)}
        >
          <Cross2Icon />
        </IconButton>
      )}
    </Callout.Root>
  );
};
