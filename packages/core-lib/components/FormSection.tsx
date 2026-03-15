import React from "react";
import { Stack, Typography, Divider } from "@mui/material";

interface FormSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  icon,
  title,
  children,
}) => (
  <Stack direction="column" spacing={3} sx={{ width: "100%" }}>
    <Stack direction="row" spacing={1} alignItems="center">
      {icon}
      <Typography variant="subtitle1" fontWeight={600}>
        {title}
      </Typography>
      <Divider sx={{ flex: 1, ml: 2 }} />
    </Stack>
    {children}
  </Stack>
);
