import React from "react";
import { Box } from "@radix-ui/themes";
import { useRecipeImportContext } from "../RecipeImportContext";
import { ProgressStepper } from "core-lib/components/radix/Stepper/ProgressStepper";
import { InfoStep } from "./content/InfoStep";
import { UploadStep } from "./content/UploadStep";
import { ConfigStep } from "./content/ConfigStep";
import { PreviewStep } from "./content/PreviewStep";
import { ResultStep } from "./content/ResultStep";

const STEP_ORDER = ["Guide", "Upload File", "Configure", "Preview & Assign", "Done"];

const STEP_INDEX: Record<string, number> = {
  info: 0,
  upload: 1,
  config: 2,
  preview: 3,
  result: 4,
};

interface UseRecipeImportStepsReturn {
  render: React.ReactNode;
}

export const useRecipeImportSteps = (
  onSubmit: (args: { password: string; mpin: string }) => Promise<void>
): UseRecipeImportStepsReturn => {
  const { currentStep, setCurrentStep, reset } = useRecipeImportContext();

  const stepIndex = STEP_INDEX[currentStep] ?? 0;

  const handleNext = () => {
    if (currentStep === "info") setCurrentStep("upload");
    else if (currentStep === "upload") setCurrentStep("config");
    else if (currentStep === "config") setCurrentStep("preview");
    else if (currentStep === "preview") setCurrentStep("result");
  };

  const handlePrevious = () => {
    if (currentStep === "upload") setCurrentStep("info");
    else if (currentStep === "config") setCurrentStep("upload");
    else if (currentStep === "preview") setCurrentStep("config");
    else if (currentStep === "result") setCurrentStep("preview");
  };

  const render = (
    <>
      <Box style={{ top: 0, zIndex: 5, marginBottom: "1.5rem" }}>
        <ProgressStepper steps={STEP_ORDER} activeStep={stepIndex} />
      </Box>

      {currentStep === "info" && (
        <InfoStep next={handleNext} previous={handlePrevious} reset={reset} />
      )}
      {currentStep === "upload" && (
        <UploadStep next={handleNext} previous={handlePrevious} reset={reset} />
      )}
      {currentStep === "config" && (
        <ConfigStep next={handleNext} previous={handlePrevious} reset={reset} />
      )}
      {currentStep === "preview" && (
        <PreviewStep next={handleNext} previous={handlePrevious} reset={reset} onSubmit={onSubmit} />
      )}
      {currentStep === "result" && (
        <ResultStep next={handleNext} previous={handlePrevious} reset={reset} />
      )}
    </>
  );

  return { render };
};
