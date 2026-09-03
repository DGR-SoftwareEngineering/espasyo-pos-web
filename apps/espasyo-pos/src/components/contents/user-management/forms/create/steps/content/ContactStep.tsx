import React from "react";
import {
  Flex,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Grid,
} from "@radix-ui/themes";;
import {
  AlternateEmailOutlined,
  PhoneOutlined,
  BadgeOutlined,
} from "@mui/icons-material";
import { TextField } from "core-lib/components/radix/form/TextField";
import { useUserCreateContext } from "../../UserCreateContext";
import { UserCreateStepProps } from "../UserCreateSteps";
import { UserCreateForm } from "../../validation";
import { StepShell } from "./StepShell";
import { StepNavigation } from "./StepNavigation";

const FIELDS_IN_STEP = [
  "email",
  "contactNumber",
  "licenseNumber",
] as const satisfies ReadonlyArray<keyof UserCreateForm>;

export const ContactStep: React.FC<UserCreateStepProps> = ({
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
      icon={<AlternateEmailOutlined />}
      title="Contact Details"
      subtitle="How you'll reach this user, and any compliance ID they carry."
      actions={
        <StepNavigation
          onBack={handleBack}
          onContinue={handleContinue}
          continueText="Continue"
        />
      }
    >
      <Flex direction="column" gap="3">
        <TextField
          name="email"
          control={control}
          label="Email"
          placeholder="user@espasyo.coffee"
          type="email"
          startAdornment={
            <AlternateEmailOutlined
              style={{ fontSize: 16, color: "var(--gray-10)" }}
            />
          }
        />
        <Grid columns={{ initial: "1", md: "2" }} gap="3">
          <TextField
            name="contactNumber"
            control={control}
            label="Contact Number"
            placeholder="+63 917 ..."
            startAdornment={
              <PhoneOutlined
                style={{ fontSize: 16, color: "var(--gray-10)" }}
              />
            }
          />
          {/* <TextField
            name="licenseNumber"
            control={control}
            label="License Number (optional)"
            placeholder="e.g. PRC ID"
            startAdornment={
              <BadgeOutlined
                style={{ fontSize: 16, color: "var(--gray-10)" }}
              />
            }
          /> */}
        </Grid>
        <Text size="1" color="gray">
          Email must be unique. The license number is only required for roles
          that need certification.
        </Text>
      </Flex>
    </StepShell>
  );
};
