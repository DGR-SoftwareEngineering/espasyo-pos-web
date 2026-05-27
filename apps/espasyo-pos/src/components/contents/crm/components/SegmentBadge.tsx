import React from "react";
import { Badge, Tooltip } from "@radix-ui/themes";
import {
  NewReleasesOutlined,
  RepeatOutlined,
  StarOutlined,
  ScheduleOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import { CustomerSegment } from "core-lib/api/crm";
import { SEGMENT_CONFIG } from "../constants";

const ICON_MAP = {
  NewReleasesOutlined,
  RepeatOutlined,
  StarOutlined,
  ScheduleOutlined,
  WarningAmberOutlined,
} as const;

interface SegmentBadgeProps {
  segment: CustomerSegment | number | null | undefined;
  size?: "1" | "2" | "3";
  tooltip?: boolean;
  showIcon?: boolean;
}

export const SegmentBadge: React.FC<SegmentBadgeProps> = ({
  segment,
  size = "1",
  tooltip = false,
  showIcon = true,
}) => {
  if (segment == null) return null;
  const cfg = SEGMENT_CONFIG[segment as CustomerSegment];
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
