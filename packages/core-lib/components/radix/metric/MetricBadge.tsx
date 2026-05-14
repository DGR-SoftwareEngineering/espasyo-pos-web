import React from "react";
import { Badge, Tooltip } from "@radix-ui/themes";
import {
  MuiSemanticColor,
  RadixAccent,
  muiToRadixAccent,
  resolveAccent,
} from "../_utils";

interface Props {
  label: string;
  value: string;
  color: string;
  tooltip?: string;
}

const KNOWN_KEYS = new Set<string>([
  ...Object.keys(muiToRadixAccent),
  "indigo",
  "violet",
  "green",
  "amber",
  "red",
  "blue",
  "gray",
]);

export const MetricBadge: React.FC<Props> = ({
  label,
  value,
  color,
  tooltip,
}) => {
  const isKnown = KNOWN_KEYS.has(color);
  const accent: RadixAccent = isKnown
    ? resolveAccent(color as MuiSemanticColor | RadixAccent, "gray")
    : "gray";

  const badge = (
    <Badge
      color={accent}
      variant="soft"
      style={
        isKnown
          ? { cursor: tooltip ? "help" : undefined }
          : {
              color,
              background: `${color}1a`,
              cursor: tooltip ? "help" : undefined,
            }
      }
    >
      {label}: {value}
    </Badge>
  );

  return tooltip ? <Tooltip content={tooltip}>{badge}</Tooltip> : badge;
};
