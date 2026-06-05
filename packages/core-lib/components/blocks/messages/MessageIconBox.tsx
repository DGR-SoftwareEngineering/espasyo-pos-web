import {
  CheckCircleOutlineOutlined,
  ErrorOutlineRounded,
  WarningAmberRounded,
} from "@mui/icons-material";
import { useTheme } from "@mui/material";
import { EvaIcon } from "../../EvaIcon";
import { MessageType } from "../../topAlertMessages/types";
import React from "react";

interface Props {
  icon?: string | React.ReactElement;
  type: MessageType;
  size?: "small" | "medium" | "large";
  inheritColor?: boolean;
}

export const MessageIconBox: React.FC<Props> = ({
  icon,
  type,
  size = "medium",
  inheritColor = false,
}) => {
  const theme = useTheme();

  if (typeof icon === "string" && !!icon.trim()) {
    const iconSize = evaSize(size);
    const iconColor = evaColor(type);

    return (
      <EvaIcon
        name={icon}
        fill={iconColor}
        width={iconSize}
        height={iconSize}
      />
    );
  }

  if (!!icon) {
    return icon as React.ReactElement;
  }

  return {
    [MessageType.Info]: (
      <CheckCircleOutlineOutlined
        fontSize={size}
        color={inheritColor ? "inherit" : "success"}
      />
    ),
    [MessageType.Success]: (
      <CheckCircleOutlineOutlined
        fontSize={size}
        color={inheritColor ? "inherit" : "success"}
      />
    ),
    [MessageType.Problem]: (
      <ErrorOutlineRounded
        fontSize={size}
        color={inheritColor ? "inherit" : "error"}
      />
    ),
    [MessageType.Warning]: (
      <WarningAmberRounded
        fontSize={size}
        color={inheritColor ? "inherit" : "warning"}
      />
    ),
    [MessageType.Note]: null,
  }[type];

  function evaColor(type: MessageType) {
    if (inheritColor) return "inherit";

    return {
      [MessageType.Info]: theme.palette.success.main,
      [MessageType.Success]: theme.palette.success.main,
      [MessageType.Problem]: theme.palette.error.main,
      [MessageType.Warning]: theme.palette.warning.main,
      [MessageType.Note]: theme.palette.text.primary,
    }[type];
  }
};

const evaSize = (size: NonNullable<Props["size"]>) =>
  ({
    small: 20,
    medium: 24,
    large: 35,
  })[size];
