import React, { useState } from "react";
import { Alert as MuiAlert, AlertProps, AlertTitle } from "@mui/material";

interface Props {
  severity: AlertProps["severity"];
  title: string;
  description?: string;
  style?: React.CSSProperties;
  Icon?: AlertProps["icon"];
  hasCloseButton?: boolean;
}

export const Alert: React.FC<Props> = ({ severity, ...props }) => {
  const { title, description, style, Icon, hasCloseButton } = props;

  const [isOpen, setIsOpen] = useState<Boolean>(true);

  const handleClose = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {isOpen && (
        <MuiAlert
          severity={severity}
          style={{
            backgroundColor: "#e3f2fd",
            color: "#0d47a1",
            border: "1px solid #90caf9",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "16px",
            ...style,
          }}
          icon={Icon}
          onClose={hasCloseButton ? handleClose : undefined}
        >
          <AlertTitle>{title}</AlertTitle>
          {description}
        </MuiAlert>
      )}
    </>
  );
};
