import React from "react";
import { Alert, AlertTitle, Box, SxProps, Theme, Typography } from "@mui/material";
import { FieldErrors } from "react-hook-form";

interface FormErrorSummaryProps {
  errors: FieldErrors;
  title?: string;
  fieldLabels?: Record<string, string>;
  sx?: SxProps<Theme>;
}

export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({
  errors,
  title = "Please fix the following before submitting:",
  fieldLabels,
  sx,
}) => {
  const messages = React.useMemo(
    () => collectErrorMessages(errors, fieldLabels),
    [errors, fieldLabels],
  );

  if (messages.length === 0) return null;

  return (
    <Alert
      severity="error"
      variant="outlined"
      sx={{ borderRadius: 2, ...sx }}
      data-testid="form-error-summary"
    >
      <AlertTitle sx={{ fontWeight: 600, mb: 0.5 }}>{title}</AlertTitle>
      <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
        {messages.map((m, i) => (
          <Box component="li" key={`${m}-${i}`} sx={{ mt: 0.25 }}>
            <Typography variant="body2">{m}</Typography>
          </Box>
        ))}
      </Box>
    </Alert>
  );
};

function collectErrorMessages(
  errors: FieldErrors,
  fieldLabels?: Record<string, string>,
): string[] {
  const out: string[] = [];

  for (const key of Object.keys(errors)) {
    const entry = errors[key];
    if (!entry) continue;

    const message = (entry as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) {
      const label = fieldLabels?.[key];
      out.push(label ? `${label}: ${message}` : message);
    }
  }

  return out;
}
