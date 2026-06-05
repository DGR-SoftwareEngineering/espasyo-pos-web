import React from "react";
import { Flex, Box, Heading, Text } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";
import { Button } from "../buttons/Button";
import { ButtonType } from "../../../api/content/types/common";

interface ActionButtonConfig {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  /** MUI-compatible variant; mapped to a Radix `type` internally. */
  variant?: "contained" | "outlined" | "text";
  color?: "primary" | "secondary" | "success" | "error" | "info" | "warning";
  disabled?: boolean;
}

interface Props {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actionButton?: ActionButtonConfig;
  /** Shortcut: when set without `actionButton`, generates a "New X" button. */
  onCreate?: () => void;
  extraContent?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const HeaderV2: React.FC<Props> = ({
  title,
  subtitle,
  icon,
  actionButton,
  onCreate,
  extraContent,
  className,
  style,
}) => {
  const resolved: ActionButtonConfig | undefined =
    actionButton ||
    (onCreate
      ? {
          label: `New ${title?.split(" ")[0] ?? ""}`,
          onClick: onCreate,
          icon: <PlusIcon />,
          variant: "contained",
          color: "primary",
        }
      : undefined);

  return (
    <Flex
      direction="row"
      justify="between"
      align="center"
      wrap="wrap"
      gap="3"
      className={className}
      style={style}
    >
      <Flex direction="row" gap="3" align="center">
        {icon && (
          <Box
            style={{
              width: 48,
              height: 48,
              borderRadius: "var(--radius-3)",
              background: "var(--accent-a3)",
              color: "var(--accent-11)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        )}
        <Box>
          {title && (
            <Heading size="5" weight="bold">
              {title}
            </Heading>
          )}
          {subtitle && (
            <Text size="2" color="gray">
              {subtitle}
            </Text>
          )}
        </Box>
      </Flex>

      <Flex direction="row" gap="3" align="center">
        {extraContent}
        {resolved && (
          <Button
            type={mapMuiVariantToType(resolved.variant, resolved.color)}
            size="2"
            disabled={resolved.disabled}
            onClick={resolved.onClick}
          >
            <Flex align="center" gap="2">
              {resolved.icon || <PlusIcon />}
              {resolved.label}
            </Flex>
          </Button>
        )}
      </Flex>
    </Flex>
  );
};

function mapMuiVariantToType(
  variant: ActionButtonConfig["variant"],
  color: ActionButtonConfig["color"],
): ButtonType {
  if (variant === "outlined") return "Secondary";
  if (variant === "text") return "Link";
  if (color === "error") return "Critical";
  if (color === "success") return "Success";
  return "Primary";
}
