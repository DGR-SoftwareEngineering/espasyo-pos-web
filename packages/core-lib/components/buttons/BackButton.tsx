import { Box } from "@mui/material";
import { Button } from "./Button";
import { EvaIcon } from "../EvaIcon";
import React from "react";

type Props = {
  onClick: () => void;
  disabled?: boolean;
  text?: string;
  loading?: boolean;
};

export const BackButton: React.FC<Props> = ({
  onClick,
  disabled,
  text = "Back",
  loading,
}) => {
  return (
    <Box className="w-full flex items-center justify-start my-1">
      <Button
        onClick={onClick}
        disabled={disabled || loading}
        loading={loading}
        data-testid="back-button"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          color: "#0F2A71",
          boxShadow: 0,
          minWidth: 10,
          maxHeight: 10,
          gap: 1,
          borderRadius: "0px",          
          paddingX: 0,
          paddingY: 0,
          backgroundColor: "transparent",
          background: "transparent",  
          border: "1px solid transparent"
        }}
      >
        <EvaIcon
          name="arrow-ios-back-outline"
          fill="var(--linear-main-blue, linear-gradient(90deg, #0F2A71 0%, #181E2F 100%))"
          width={20}
          height={20}
        />
        {text}       
      </Button>
    </Box>
  );
};
