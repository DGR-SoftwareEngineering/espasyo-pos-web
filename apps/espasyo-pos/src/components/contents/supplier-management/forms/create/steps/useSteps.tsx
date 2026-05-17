import React, { useEffect, useMemo } from "react";
import { Box, Flex } from "@radix-ui/themes";
import {
  useActiveSteps,
  useWizardForm,
  WizardFormMap,
} from "core-lib/core/hooks";
import { ProgressStepper } from "core-lib/components/radix/Stepper/ProgressStepper";
import { SupplierCreateForm } from "../validation";
import {
  SupplierCreateStepKey,
  SupplierCreateStepProps,
} from "./SupplierCreateSteps";
import {
  BusinessStep,
  CompanyStep,
  ContactStep,
  LogoStep,
  PortalStep,
  ReviewStep,
} from "./content";

const STEP_LABELS: Record<SupplierCreateStepKey, string> = {
  Company: "Company",
  Contact: "Contact",
  Business: "Business",
  Portal: "Portal",
  Logo: "Logo",
  Review: "Review",
};

const STEP_ORDER: SupplierCreateStepKey[] = [
  "Company",
  "Contact",
  "Business",
  "Portal",
  "Logo",
  "Review",
];

export const useSupplierCreateWizardSteps = (onSubmit: () => void) => {
  const steps = useMemo(() => {
    return {
      Company: {
        content: (props) => <CompanyStep {...props} />,
        nextStep: "Contact",
        previousStep: "Company",
      },
      Contact: {
        content: (props) => <ContactStep {...props} />,
        nextStep: "Business",
        previousStep: "Company",
      },
      Business: {
        content: (props) => <BusinessStep {...props} />,
        nextStep: "Portal",
        previousStep: "Contact",
      },
      Portal: {
        content: (props) => <PortalStep {...props} />,
        nextStep: "Logo",
        previousStep: "Business",
      },
      Logo: {
        content: (props) => <LogoStep {...props} />,
        nextStep: "Review",
        previousStep: "Portal",
      },
      Review: {
        content: (props) => <ReviewStep onSave={onSubmit} {...props} />,
        nextStep: "Review",
        previousStep: "Logo",
      },
    } as WizardFormMap<
      SupplierCreateStepKey,
      SupplierCreateForm,
      SupplierCreateStepProps
    >;
  }, [onSubmit]);

  const wizardValues = (
    prev: Partial<SupplierCreateForm> | undefined,
    next: Partial<SupplierCreateForm>,
  ): Partial<SupplierCreateForm> => ({ ...prev, ...next });

  const { renderStep, reset } = useWizardForm<
    SupplierCreateStepKey,
    SupplierCreateForm,
    SupplierCreateStepProps
  >(steps, wizardValues, "Company");

  const stepLabels = STEP_ORDER.map((k) => STEP_LABELS[k]);
  const {
    activeStep,
    next,
    previous,
    reset: resetStep,
  } = useActiveSteps(stepLabels.length - 1);

  useEffect(() => {
    resetStep();
    return () => resetStep();
  }, []);

  return {
    render: (
      <Flex direction="column" gap="4" style={{ width: "100%" }}>
        <Box
          style={{
            position: "sticky",
            top: 0,
            zIndex: 5,
            background: "var(--color-background)",
            paddingTop: 8,
            paddingBottom: 12,
          }}
        >
          <ProgressStepper steps={stepLabels} activeStep={activeStep} />
        </Box>

        <Box style={{ width: "100%" }}>
          {renderStep({
            isLoading: false,
            next,
            previous,
            resetStep,
            reset,
          })}
        </Box>
      </Flex>
    ),
  };
};
