import { StepperProps } from "@mui/material";

export type Props = {
  steps: string[];
  activeStep: number;
  onStepChange?: (step: number) => void;
  showButtons?: boolean;
  sx?: StepperProps["sx"];
  icons?: React.ReactNode[];
};
