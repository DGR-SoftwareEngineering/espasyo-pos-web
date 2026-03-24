import React from "react";
import { Chip, alpha, useTheme } from "@mui/material";
import {
  CheckCircleOutlineOutlined,
  WarningAmberOutlined,
  CancelOutlined,
} from "@mui/icons-material";
import { ProductionStatus } from "../api/commons/types";

interface StatusChipProps {
  status: ProductionStatus;
  size?: "small" | "medium";
  showIcon?: boolean;
}

interface StatusConfig {
  color: string;
  icon: React.ReactElement;
  label: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  size = "small",
  showIcon = true,
}) => {
  const theme = useTheme();

  const getStatusConfig = (statusValue: ProductionStatus): StatusConfig => {
    const configs: Record<string, StatusConfig> = {
      InStock: {
        color: theme.palette.success.main,
        icon: (
          <CheckCircleOutlineOutlined
            sx={{ fontSize: size === "small" ? 16 : 20 }}
          />
        ),
        label: "In Stock",
      },
      LowStock: {
        color: theme.palette.warning.main,
        icon: (
          <WarningAmberOutlined sx={{ fontSize: size === "small" ? 16 : 20 }} />
        ),
        label: "Low Stock",
      },
      OutOfStock: {
        color: theme.palette.error.main,
        icon: <CancelOutlined sx={{ fontSize: size === "small" ? 16 : 20 }} />,
        label: "Out of Stock",
      },
    };

    return (
      configs[statusValue] || {
        color: theme.palette.text.secondary,
        icon: <></>,
        label: statusValue || "Unknown",
      }
    );
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      icon={showIcon ? config.icon : undefined}
      label={config.label}
      size={size}
      sx={{
        bgcolor: alpha(config.color, 0.1),
        color: config.color,
        fontWeight: 500,
        height: size === "small" ? 24 : 32,
      }}
    />
  );
};
