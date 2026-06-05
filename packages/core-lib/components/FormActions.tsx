import React from "react";
import { CardActions, alpha } from "@mui/material";
import { Button } from "./buttons";

interface FormActionsProps {
  isEdit: boolean;
  isValid: boolean;
  isDirty: boolean;
  submitLoading: boolean;
  isInDialog: boolean;
  submissionKey?: string;
  onButtonClick: () => void;
  buttonText: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  isEdit,
  isDirty,
  submitLoading,
  onButtonClick,
  buttonText,
}) => (
  <CardActions
    sx={{
      p: 3,
      pt: 0,
      justifyContent: "flex-end",
      gap: 2,
      borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    }}
  >
    <Button
      type="Primary"
      loading={submitLoading}
      disabled={!isDirty && !isEdit}
      onClick={onButtonClick}
      sx={{
        minWidth: 180,
        borderRadius: 2,
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        boxShadow: (theme) =>
          `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
        "&:hover": {
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        },
      }}
    >
      {buttonText}
    </Button>
  </CardActions>
);
