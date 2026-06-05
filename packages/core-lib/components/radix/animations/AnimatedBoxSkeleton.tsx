import React from "react";
import { Skeleton } from "@radix-ui/themes";

interface Props {
  height?: number | string;
  width?: number | string;
  light?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const AnimatedBoxSkeleton: React.FC<Props> = ({
  height = 24,
  width = "100%",
  light,
  className,
  style,
}) => (
  <Skeleton
    loading
    className={className}
    style={{
      height,
      width,
      borderRadius: "var(--radius-2)",
      opacity: light ? 0.5 : 1,
      ...style,
    }}
  >
    <div style={{ height, width }} />
  </Skeleton>
);
