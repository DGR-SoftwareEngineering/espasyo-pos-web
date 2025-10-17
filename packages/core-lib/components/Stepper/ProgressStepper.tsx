import React from "react";
import Box from "@mui/material/Box";
import { Props } from "./types";

const getStepStyles = (isActive: boolean, isCompleted: boolean) => ({
  activeColor: isActive ? "#0F2A71" : isCompleted ? "#70e000" : "gray",
  fontWeight: isActive ? "bold" : "normal",
  textColor: isActive ? "#0F2A71" : isCompleted ? "#70e000" : "gray",
});

export const ProgressStepper: React.FC<Props> = ({ steps, activeStep }) => (
  <Box
    className="w-full"
    sx={{
      borderBox: "box-sizing",
      marginTop: -2,
    }}
  >
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 2,
      }}
    >
      {steps.map((label, idx) => {
        const { activeColor, fontWeight, textColor } = getStepStyles(
          activeStep === idx,
          activeStep > idx
        );

        return (
          <Box
            key={idx}
            sx={{
              flex: 1,
              textAlign: "center",
              fontFamily: "PT Sans Narrow",
              fontSize: "clamp(0.73rem, 2.5vw, 1rem)",
              color: textColor,
              transition: "color 0.3s ease",
              fontWeight,
            }}
          >
            <Box
              sx={{
                height: "7px",
                backgroundColor: activeColor,
                borderRadius: "1px",
                marginTop: "0.5rem",
                transition: "background-color 0.3s ease",
              }}
            />
            <p>{label}</p>
          </Box>
        );
      })}
    </Box>
  </Box>
);
