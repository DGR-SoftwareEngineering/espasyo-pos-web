import React from "react";
import { Box } from "@radix-ui/themes";
import { useRecipeImportContext } from "../RecipeImportContext";
import { ProgressStepper } from "core-lib/components/radix/Stepper/ProgressStepper";
import { UploadStep } from "./content/UploadStep";
import { PreviewStep } from "./content/PreviewStep";
import { ResultStep } from "./content/ResultStep";

const STEP_ORDER = ["Upload File", "Preview", "Results"];

interface UseRecipeImportStepsReturn {
  render: React.ReactNode;
}

export const useRecipeImportSteps = (
  onSubmit: () => Promise<void>
): UseRecipeImportStepsReturn => {
  const { currentStep, setCurrentStep, reset } = useRecipeImportContext();

  const stepIndex = currentStep === "upload" ? 0 : currentStep === "preview" ? 1 : 2;

  const handleNext = () => {
    if (currentStep === "upload") {
      setCurrentStep("preview");
    } else if (currentStep === "preview") {
      setCurrentStep("result");
    }
  };

  const handlePrevious = () => {
    if (currentStep === "preview") {
      setCurrentStep("upload");
    } else if (currentStep === "result") {
      setCurrentStep("preview");
    }
  };

  const render = (
    <>
      <Box style={{ position: "sticky", top: 0, zIndex: 5, marginBottom: "1.5rem" }}>
        <ProgressStepper
          steps={STEP_ORDER}
          activeStep={stepIndex}
        />
      </Box>

      {currentStep === "upload" && (
        <UploadStep next={handleNext} previous={handlePrevious} reset={reset} />
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
