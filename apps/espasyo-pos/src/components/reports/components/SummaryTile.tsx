import React, { memo } from "react";
import {
  Box,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Skeleton,
} from "@radix-ui/themes";;

interface SummaryTileProps {
  label: string;
  value: string;
  loading: boolean;
  color: string;
  hint: string;
  negative?: boolean;
}

const SummaryTileInner: React.FC<SummaryTileProps> = ({ label, value, loading, color, hint, negative }) => (
  <Box
    p="3"
    style={{
      borderRadius: "var(--radius-3)",
      background: "var(--gray-a2)",
      border: "1px solid var(--gray-a3)",
      minWidth: 0,
      overflow: "hidden",
    }}
  >
    <Text
      size="1"
      color="gray"
      weight="medium"
      as="div"
      style={{
        textTransform: "uppercase",
        letterSpacing: 0.5,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Text>
    {loading ? (
      <Skeleton width="90%" height="22px" style={{ marginTop: 6 }} />
    ) : (
      <Text
        weight="bold"
        as="div"
        mt="1"
        style={{
          color,
          fontSize: 18,
          lineHeight: 1.2,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {negative ? `\u2212 ${value}` : value}
      </Text>
    )}
    <Text
      size="1"
      color="gray"
      as="div"
      mt="1"
      style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {hint}
    </Text>
  </Box>
);

export const SummaryTile = memo(SummaryTileInner);
SummaryTile.displayName = "SummaryTile";
