import React from "react";
import { Flex, IconButton, Tooltip } from "@radix-ui/themes";
import {
  EyeOpenIcon,
  Pencil1Icon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";

interface ActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onExpand?: () => void;
  viewTooltip?: string;
  editTooltip?: string;
  deleteTooltip?: string;
  expandTooltip?: string;
  size?: "1" | "2" | "3";
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
  size = "1",
  showView = true,
  showEdit = true,
  showDelete = true,
  showExpand = false,
  isExpanded = false,
}) => (
  <Flex direction="row" gap="1" justify="end">
    {showView && onView && (
      <Tooltip content={viewTooltip}>
        <IconButton
          size={size}
          variant="ghost"
          color="blue"
          aria-label={viewTooltip}
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
        >
          <EyeOpenIcon />
        </IconButton>
      </Tooltip>
    )}
    {showEdit && onEdit && (
      <Tooltip content={editTooltip}>
        <IconButton
          size={size}
          variant="ghost"
          color="indigo"
          aria-label={editTooltip}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Pencil1Icon />
        </IconButton>
      </Tooltip>
    )}
    {showDelete && onDelete && (
      <Tooltip content={deleteTooltip}>
        <IconButton
          size={size}
          variant="ghost"
          color="red"
          aria-label={deleteTooltip}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <TrashIcon />
        </IconButton>
      </Tooltip>
    )}
    {showExpand && onExpand && (
      <Tooltip content={expandTooltip}>
        <IconButton
          size={size}
          variant="ghost"
          color="gray"
          aria-label={expandTooltip}
          onClick={(e) => {
            e.stopPropagation();
            onExpand();
          }}
        >
          {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Tooltip>
    )}
  </Flex>
);
