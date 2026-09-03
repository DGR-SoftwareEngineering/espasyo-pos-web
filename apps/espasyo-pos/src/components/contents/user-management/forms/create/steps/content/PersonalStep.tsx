import React from "react";
import {
  Flex,
} from "core-lib/components/radix/proxies";
import {
  Grid,
} from "@radix-ui/themes";;
import { PersonOutlineOutlined } from "@mui/icons-material";
import { TextField } from "core-lib/components/radix/form/TextField";
import { useUserCreateContext } from "../../UserCreateContext";
import { UserCreateStepProps } from "../UserCreateSteps";
import { UserCreateForm } from "../../validation";
import { StepShell } from "./StepShell";
import { StepNavigation } from "./StepNavigation";

const FIELDS_IN_STEP = [
  "firstName",
  "middleName",
  "lastName",
] as const satisfies ReadonlyArray<keyof UserCreateForm>;

export const PersonalStep: React.FC<UserCreateStepProps> = ({
  next,
  previous,
  nextStep,
  previousStep,
}) => {
  const { form } = useUserCreateContext();
  const { control, trigger, getValues } = form;

  const handleContinue = async () => {
    const ok = await trigger([...FIELDS_IN_STEP]);
    if (ok) {
      next();
      nextStep?.(getValues());
    }
  };

  const handleBack = () => {
    previous();
    previousStep?.();
  };

  return (
    <StepShell
      icon={<PersonOutlineOutlined />}
      title="Personal Information"
      subtitle="The name shown on receipts, audit logs, and the staff list."
      actions={
        <StepNavigation
          onBack={handleBack}
          onContinue={handleContinue}
          continueText="Continue"
        />
      }
    >
      <Flex direction="column" gap="3">
        <Grid columns={{ initial: "1", md: "3" }} gap="3">
          <TextField
            name="firstName"
            control={control}
            label="First Name"
            placeholder="e.g. Juan"
          />
          <TextField
            name="middleName"
            control={control}
            label="Middle Name (optional)"
            placeholder="e.g. Santos"
          />
          <TextField
            name="lastName"
            control={control}
            label="Last Name"
            placeholder="e.g. Dela Cruz"
          />
        </Grid>
      </Flex>
    </StepShell>
  );
};
