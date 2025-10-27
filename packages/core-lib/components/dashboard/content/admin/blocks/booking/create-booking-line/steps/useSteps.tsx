import React, { useMemo } from "react";
import { CreationManagementProps, CreationManagementSteps } from "./creation";
import {
  useActiveSteps,
  useResolution,
  useWizardForm,
  WizardFormMap,
} from "../../../../../../../../core/hooks";
import { MobileStepper, ProgressStepper } from "../../../../../../../Stepper";
import { CreateBookingType } from "../validation";
import { useCreateBookingFormContext } from "../CreateBookingContext";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import DriveEtaIcon from "@mui/icons-material/DriveEta";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AddLocationIcon from "@mui/icons-material/AddLocation";
import SummarizeIcon from "@mui/icons-material/Summarize";
import { DriverSelectionBlock, HelperSelectionBlock, CarSelectionBlock } from "./contents";

export const useCreateBookingWizardSteps = (onSubmit: VoidFunction) => {
  const { isMobile } = useResolution();

  const steps = useMemo(() => {
    return {
      DriverSelection: {
        content: (props) => <DriverSelectionBlock {...props} />,
        nextStep: "HelperSelection",
      },
      HelperSelection: {
        content: (props) => <HelperSelectionBlock {...props} />,
        nextStep: "VehicleAndChassisSelection",
        previousStep: "DriverSelection",
      },
      VehicleAndChassisSelection: {
        content: (props) => <CarSelectionBlock {...props} />,
        nextStep: "AddingLocation",
        previousStep: "HelperSelection",
      },
      AddingLocation: {
        content: (props) => <>add start and stop location...</>,
        nextStep: "SummaryView",
        previousStep: "VehicleAndChassisSelection",
      },
      SummaryView: {},
    } as WizardFormMap<
      Partial<CreationManagementSteps>,
      CreateBookingType,
      CreationManagementProps
    >;
  }, []);

  const formWizardValues = (
    prev: Partial<CreateBookingType> | undefined,
    values: Partial<CreateBookingType>
  ): Partial<CreateBookingType> => ({
    ...prev,
    ...values,
  });

  const { renderStep, reset } = useWizardForm<
    CreationManagementSteps,
    CreateBookingType,
    CreationManagementProps
  >(steps, formWizardValues, "DriverSelection");

  const stepKeys = Object.keys(steps);
  const stepLabels = stepKeys.map((step) =>
    step.replace(/([A-Z])/g, " $1").trim()
  );

  const {
    activeStep,
    next,
    previous,
    reset: resetStep,
  } = useActiveSteps(stepLabels.length);

  const icons = stepKeys.map((step, index) => {
    switch (step) {
      case "DriverSelection":
        return <DriveEtaIcon key={index} />;
      case "HelperSelection":
        return <AccessibilityIcon key={index} />;
      case "VehicleAndChassisSelection":
        return <DirectionsCarIcon key={index} />;
      case "AddingLocation":
        return <AddLocationIcon key={index} />;
      case "SummaryView":
        return <SummarizeIcon key={index} />;
      default:
        return null;
    }
  });
  const { loading } = useCreateBookingFormContext();

  return {
    render: (
      <div className="w-full h-full flex items-center justify-center flex-col">
        {!isMobile ? (
          <MobileStepper
            steps={stepLabels}
            activeStep={activeStep}
            onStepChange={next}
            icons={icons}
          />
        ) : (
          <ProgressStepper
            steps={stepLabels}
            activeStep={activeStep}
            onStepChange={next}
            icons={icons}
          />
        )}
        <div className="w-full p-2 lg:w-[800px] lg:p-0 relative">
          {renderStep({ isLoading: loading, next, previous, resetStep, reset })}
        </div>
      </div>
    ),
  };
};
