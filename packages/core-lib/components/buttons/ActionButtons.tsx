import React from "react";
import { Stack, IconButton, Tooltip, alpha, useTheme } from "@mui/material";
import {
  VisibilityOutlined,
  EditOutlined,
  DeleteOutlined,
  ExpandMoreOutlined,
  ChevronRightOutlined,
} from "@mui/icons-material";

interface ActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onExpand?: () => void;
  viewTooltip?: string;
  editTooltip?: string;
  deleteTooltip?: string;
  expandTooltip?: string;
  size?: "small" | "medium";
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showExpand?: boolean;
  isExpanded?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onView,
  onEdit,
  onDelete,
  onExpand,
  viewTooltip = "View Details",
  editTooltip = "Edit",
  deleteTooltip = "Delete",
  expandTooltip = "Expand/Collapse",
  size = "small",
  showView = true,
  showEdit = true,
  showDelete = true,
  showExpand = false,
  isExpanded = false,
}) => {
  const theme = useTheme();

  const buttonStyles = (color: string) => ({
    color: theme.palette.text.secondary,
    "&:hover": {
      color: color,
      bgcolor: alpha(color, 0.1),
    },
  });

  return (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
      {showView && onView && (
        <Tooltip title={viewTooltip} arrow>
          <IconButton
            size={size}
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            sx={buttonStyles(theme.palette.info.main)}
          >
            <VisibilityOutlined fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      {showEdit && onEdit && (
        <Tooltip title={editTooltip} arrow>
          <IconButton
            size={size}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            sx={buttonStyles(theme.palette.primary.main)}
          >
            <EditOutlined fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      {showDelete && onDelete && (
        <Tooltip title={deleteTooltip} arrow>
          <IconButton
            size={size}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            sx={buttonStyles(theme.palette.error.main)}
          >
            <DeleteOutlined fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      {showExpand && onExpand && (
        <Tooltip title={expandTooltip} arrow>
          <IconButton
            size={size}
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            sx={buttonStyles(theme.palette.info.main)}
          >
            {isExpanded ? (
              <ExpandMoreOutlined fontSize={size} />
            ) : (
              <ChevronRightOutlined fontSize={size} />
            )}
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
};
