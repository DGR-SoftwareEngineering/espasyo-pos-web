import React from "react";
import {
  Box,
} from "core-lib/components/radix/proxies";;
import { useRecipeImportContext } from "../RecipeImportContext";
import { ProgressStepper } from "core-lib/components/radix/Stepper/ProgressStepper";
import { InfoStep } from "./content/InfoStep";
import { UploadStep } from "./content/UploadStep";
import { ConfigStep } from "./content/ConfigStep";
import { ModifyStep } from "./content/ModifyStep";
import { SummaryStep } from "./content/SummaryStep";
import { ResultStep } from "./content/ResultStep";

const STEP_ORDER = ["Guide", "Upload File", "Configure", "Edit Details", "Summary", "Done"];

const STEP_INDEX: Record<string, number> = {
  info: 0,
  upload: 1,
  config: 2,
  modify: 3,
  summary: 4,
  result: 5,
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
    else if (currentStep === "config") setCurrentStep("modify");
    else if (currentStep === "modify") setCurrentStep("summary");
    else if (currentStep === "summary") setCurrentStep("result");
  };

  const handlePrevious = () => {
    if (currentStep === "upload") setCurrentStep("info");
    else if (currentStep === "config") setCurrentStep("upload");
    else if (currentStep === "modify") setCurrentStep("config");
    else if (currentStep === "summary") setCurrentStep("modify");
    else if (currentStep === "result") setCurrentStep("summary");
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
      {currentStep === "modify" && (
        <ModifyStep next={handleNext} previous={handlePrevious} reset={reset} />
      )}
      {currentStep === "summary" && (
        <SummaryStep next={handleNext} previous={handlePrevious} reset={reset} onSubmit={onSubmit} />
      )}
      {currentStep === "result" && (
        <ResultStep next={handleNext} previous={handlePrevious} reset={reset} />
      )}
    </>
  );

  return { render };
};
