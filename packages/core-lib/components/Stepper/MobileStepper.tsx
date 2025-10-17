import React from "react";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import { Props } from "./types";

export const MobileStepper: React.FC<Props> = ({
  steps,
  activeStep,
  icons = [],
}) => (
  <Box
    sx={{
      width: "100%",
      paddingY: 2,
    }}
  >
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(15, 42, 113, 0.10)",
        boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.5)",
        paddingX: 4,
        borderRadius: "0.6875rem",
        paddingY: 4,
        gap: 2,
      }}
    >
      {steps.map((label, idx) => {
        const isActive = activeStep === idx;
        const isCompleted = activeStep > idx;
        const numStep = idx + 1;
        const showLabel = isCompleted || isActive;

        const stepStyle = {
          backgroundColor: isActive
            ? "rgba(15, 42, 113, 0.17)"
            : isCompleted
            ? "rgba(15, 113, 28, 0.19)"
            : "transparent",
          color: isActive ? "#0F2A71" : isCompleted ? "#0F711C" : "#495057",
        };

        return (
          <Box
            key={idx}
            sx={{
              flex: 1,
              textAlign: "center",
              paddingY: 4,
              fontFamily: "PT Sans",
              borderRadius: "0.6875rem",
              height: "100%",
              ...stepStyle,
              transition: "color 0.3s ease",
            }}
          >
            <Typography
              sx={{
                fontFamily: "PT Sans",
                fontSize: "0.75rem",
                paddingBottom: 2,
                color: stepStyle.color,
                fontWeight: isActive ? "bold" : "normal",
              }}
            >
              {showLabel && label}
            </Typography>
            <div className="flex items-center justify-center gap-2">
              <Typography
                className="w-12 px-2 rounded-full border border-darkBlue"
                sx={{
                  color: stepStyle.color,
                }}
              >
                {numStep}
              </Typography>
              {icons[idx]}
            </div>
          </Box>
        );
      })}
    </Box>
  </Box>
);
