import React from "react";
import { Badge, Tooltip } from "@radix-ui/themes";
import {
  NewReleasesOutlined,
  RepeatOutlined,
  StarOutlined,
  ScheduleOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";

export type SegmentBadgeColor = "blue" | "green" | "amber" | "gray" | "red";

export type SegmentConfig = {
  label: string;
  color: SegmentBadgeColor;
  iconKey: keyof typeof ICON_MAP;
  description: string;
};

export const ICON_MAP = {
  NewReleasesOutlined,
  RepeatOutlined,
  StarOutlined,
  ScheduleOutlined,
  WarningAmberOutlined,
} as const;

interface SegmentBadgeProps {
  segment: string | number | null | undefined;
  configMap: Record<string | number, SegmentConfig>;
  size?: "1" | "2" | "3";
  tooltip?: boolean;
  showIcon?: boolean;
}

export const SegmentBadge: React.FC<SegmentBadgeProps> = ({
  segment,
  configMap,
  size = "1",
  tooltip = false,
  showIcon = true,
}) => {
  if (segment == null) return null;
  const cfg = configMap[segment];
  if (!cfg) return null;
  const Icon = ICON_MAP[cfg.iconKey];

  const badge = (
    <Badge color={cfg.color} variant="soft" radius="full" size={size} style={{ gap: 4 }}>
      {showIcon && <Icon style={{ fontSize: size === "3" ? 14 : 11 }} />}
      {cfg.label}
    </Badge>
  );

  return tooltip ? <Tooltip content={cfg.description}>{badge}</Tooltip> : badge;
};
