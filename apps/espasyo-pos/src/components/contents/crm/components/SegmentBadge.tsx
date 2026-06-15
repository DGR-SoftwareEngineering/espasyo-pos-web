import React from "react";
import { CustomerSegment } from "core-lib/api/crm";
import { SegmentBadge as BaseSegmentBadge, SegmentConfig } from "core-lib/components/radix/customer/SegmentBadge";
import { SEGMENT_CONFIG } from "../constants";

interface SegmentBadgeProps {
  segment: CustomerSegment | number | null | undefined;
  size?: "1" | "2" | "3";
  tooltip?: boolean;
  showIcon?: boolean;
}

export const SegmentBadge: React.FC<SegmentBadgeProps> = (props) => (
  <BaseSegmentBadge
    segment={props.segment}
    configMap={SEGMENT_CONFIG as unknown as Record<string | number, SegmentConfig>}
    size={props.size}
    tooltip={props.tooltip}
    showIcon={props.showIcon}
  />
);
