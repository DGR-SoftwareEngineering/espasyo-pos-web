import React from "react";
import { Badge, Tooltip } from "@radix-ui/themes";
import { truncateId } from "../../business/strings";

interface IDChipProps {
  id: string;
  label?: string;
  color?: React.ComponentProps<typeof Badge>["color"];
}

export const IDChip: React.FC<IDChipProps> = ({
  id,
  label,
  color = "gray",
}) => (
  <Tooltip content={id}>
    <Badge color={color} variant="soft" radius="medium">
      {label ? `${label}: ` : ""}
      {truncateId(id)}
    </Badge>
  </Tooltip>
);
