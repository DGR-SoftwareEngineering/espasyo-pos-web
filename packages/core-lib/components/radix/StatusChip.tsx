import React from "react";
import { Badge } from "@radix-ui/themes";
import {
  CheckCircledIcon,
  ExclamationTriangleIcon,
  CrossCircledIcon,
} from "@radix-ui/react-icons";
import { ProductionStatus } from "../../api/commons/types";

interface StatusChipProps {
  status: ProductionStatus;
  size?: "1" | "2" | "3";
  showIcon?: boolean;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  size = "1",
  showIcon = true,
}) => {
  const config = getStatusConfig(status);

  return (
    <Badge color={config.color} size={size} variant="soft" radius="full">
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );
};

function getStatusConfig(status: ProductionStatus): {
  color: React.ComponentProps<typeof Badge>["color"];
  icon: React.ReactNode;
  label: string;
} {
  switch (status) {
    case "InStock":
      return {
        color: "green",
        icon: <CheckCircledIcon width="14" height="14" />,
        label: "In Stock",
      };
    case "LowStock":
      return {
        color: "amber",
        icon: <ExclamationTriangleIcon width="14" height="14" />,
        label: "Low Stock",
      };
    case "OutOfStock":
      return {
        color: "red",
        icon: <CrossCircledIcon width="14" height="14" />,
        label: "Out of Stock",
      };
    default:
      return {
        color: "gray",
        icon: null,
        label: status ?? "Unknown",
      };
  }
}
