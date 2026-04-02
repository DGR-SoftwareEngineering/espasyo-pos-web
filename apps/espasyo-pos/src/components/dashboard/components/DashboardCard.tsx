import React, { ReactNode } from "react";
import { Card as MuiCard, CardContent, CardProps, styled } from "@mui/material";

interface Props extends CardProps {
  children: ReactNode;
  hoverEffect?: boolean;
  sx?: CardProps["sx"];
}

export const DashboardCard: React.FC<Props> = ({
  children,
  hoverEffect,
  sx,
  ...rest
}) => {
  const CardComponent = hoverEffect ? StyledCard : MuiCard;

  return (
    <CardComponent {...rest} sx={{ p: 3, borderRadius: 3, ...sx }}>
      <CardContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, p: 0 }}
      >
        {children}
      </CardContent>
    </CardComponent>
  );
};

const StyledCard = styled(MuiCard)(({ theme }) => ({
  position: "relative",
  transition: "transform 0.3s, box-shadow 0.3s",
  cursor: "pointer",
  "&:hover": {
    transform: "scale(1.02)", // subtle
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
  },
}));
