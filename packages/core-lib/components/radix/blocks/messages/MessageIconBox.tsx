import React from "react";
import { Box } from "@radix-ui/themes";
import {
  CheckCircleOutlineOutlined,
  ErrorOutlineRounded,
  WarningAmberRounded,
} from "@mui/icons-material";
import { EvaIcon } from "../../../EvaIcon";
import { MessageType } from "../../../topAlertMessages/types";

interface Props {
  icon?: string | React.ReactElement;
  type: MessageType;
  size?: "small" | "medium" | "large";
  inheritColor?: boolean;
}

const SIZE_TO_PX: Record<NonNullable<Props["size"]>, number> = {
  small: 20,
  medium: 24,
  large: 35,
};

const TYPE_TO_VAR: Record<MessageType, string> = {
  [MessageType.Info]: "var(--green-11)",
  [MessageType.Success]: "var(--green-11)",
  [MessageType.Problem]: "var(--red-11)",
  [MessageType.Warning]: "var(--amber-11)",
  [MessageType.Note]: "var(--gray-12)",
};

export const MessageIconBox: React.FC<Props> = ({
  icon,
  type,
  size = "medium",
  inheritColor = false,
}) => {
  const pixelSize = SIZE_TO_PX[size];
  const color = inheritColor ? "inherit" : TYPE_TO_VAR[type];

  if (typeof icon === "string" && !!icon.trim()) {
    return (
      <EvaIcon
        name={icon}
        fill={color}
        width={pixelSize}
        height={pixelSize}
      />
    );
  }

  if (icon) {
    return icon as React.ReactElement;
  }

  const Fallback = (() => {
    switch (type) {
      case MessageType.Info:
      case MessageType.Success:
        return CheckCircleOutlineOutlined;
      case MessageType.Problem:
        return ErrorOutlineRounded;
      case MessageType.Warning:
        return WarningAmberRounded;
      case MessageType.Note:
      default:
        return null;
    }
  })();

  if (!Fallback) return null;

  return (
    <Box style={{ color, display: "inline-flex", lineHeight: 0 }}>
      <Fallback style={{ fontSize: pixelSize }} />
    </Box>
  );
};
