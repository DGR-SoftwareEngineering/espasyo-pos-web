import React from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { Props } from "./types";

const stepColor = (isActive: boolean, isCompleted: boolean): string => {
  if (isActive) return "var(--accent-9)";
  if (isCompleted) return "var(--green-9)";
  return "var(--gray-7)";
};

export const ProgressStepper: React.FC<Props> = ({ steps, activeStep }) => (
  <Box width="100%" mt="-2" style={{ boxSizing: "border-box" }}>
    <Flex justify="center" align="center" mb="3">
      {steps.map((label, idx) => {
        const isActive = activeStep === idx;
        const isCompleted = activeStep > idx;
        const color = stepColor(isActive, isCompleted);

        return (
          <Box
            key={idx}
            style={{
              flex: 1,
              textAlign: "center",
              transition: "color 0.3s ease",
            }}
          >
            <Box
              style={{
                height: 7,
                background: color,
                borderRadius: 1,
                marginTop: "0.5rem",
                transition: "background-color 0.3s ease",
              }}
            />
            <Text
              as="p"
              size="2"
              weight={isActive ? "bold" : "regular"}
              style={{ color, marginTop: 8 }}
            >
              {label}
            </Text>
          </Box>
        );
      })}
    </Flex>
  </Box>
);
