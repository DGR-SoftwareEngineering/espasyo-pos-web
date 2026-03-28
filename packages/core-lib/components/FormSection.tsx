import React from "react";
import { Stack, Typography, Divider, Box } from "@mui/material";

interface FormSectionProps {
  icon: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  icon,
  title,
  description,
  children,
}) => (
  <Stack direction="column" spacing={2} sx={{ width: "100%" }}>
    <Stack direction="row" spacing={1} alignItems="center">
      {icon}
      <Typography variant="subtitle1" fontWeight={600}>
        {title}
      </Typography>
      <Divider sx={{ flex: 1, ml: 2 }} />
    </Stack>

    {description && <Box sx={{ mb: 1 }}>{description}</Box>}

    {children}
  </Stack>
);
