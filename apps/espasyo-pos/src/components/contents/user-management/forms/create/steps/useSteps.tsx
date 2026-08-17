import React, { useEffect, useMemo } from "react";
import {
  Box,
  Flex,
} from "core-lib/components/radix/proxies";;
import {
  useActiveSteps,
  useWizardForm,
  WizardFormMap,
} from "core-lib/core/hooks";
import { ProgressStepper } from "core-lib/components/radix/Stepper/ProgressStepper";
import { UserCreateForm } from "../validation";
import { UserCreateStepKey, UserCreateStepProps } from "./UserCreateSteps";
import {
  AccountStep,
  ContactStep,
  PersonalStep,
  PhotoStep,
  ReviewStep,
} from "./content";

const STEP_LABELS: Record<UserCreateStepKey, string> = {
  Account: "Account",
  Personal: "Personal",
  Contact: "Contact",
  Photo: "Profile Photo",
  Review: "Review",
};

const STEP_ORDER: UserCreateStepKey[] = [
  "Account",
  "Personal",
  "Contact",
  "Photo",
  "Review",
];

export const useUserCreateWizardSteps = (onSubmit: () => void) => {
  const steps = useMemo(() => {
    return {
      Account: {
        content: (props) => <AccountStep {...props} />,
        nextStep: "Personal",
        previousStep: "Account",
      },
      Personal: {
        content: (props) => <PersonalStep {...props} />,
        nextStep: "Contact",
        previousStep: "Account",
      },
      Contact: {
        content: (props) => <ContactStep {...props} />,
        nextStep: "Photo",
        previousStep: "Personal",
      },
      Photo: {
        content: (props) => <PhotoStep {...props} />,
        nextStep: "Review",
        previousStep: "Contact",
      },
      Review: {
        content: (props) => <ReviewStep onSave={onSubmit} {...props} />,
        nextStep: "Review",
        previousStep: "Photo",
      },
    } as WizardFormMap<UserCreateStepKey, UserCreateForm, UserCreateStepProps>;
  }, [onSubmit]);

  const wizardValues = (
    prev: Partial<UserCreateForm> | undefined,
    next: Partial<UserCreateForm>,
  ): Partial<UserCreateForm> => ({ ...prev, ...next });

  const { renderStep, reset } = useWizardForm<
    UserCreateStepKey,
    UserCreateForm,
    UserCreateStepProps
  >(steps, wizardValues, "Account");

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
