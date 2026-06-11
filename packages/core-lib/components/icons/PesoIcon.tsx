import React from "react";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

export const PesoIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon viewBox="0 0 24 24" {...props}>
    <text
      x="12"
      y="17"
      textAnchor="middle"
      fontSize="16"
      fontFamily="Arial, sans-serif"
      fontWeight="bold"
      fill="currentColor"
    >
      ₱
    </text>
  </SvgIcon>
);
