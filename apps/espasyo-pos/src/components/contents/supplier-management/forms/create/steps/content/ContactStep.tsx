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
  LocationOnOutlined,
} from "@mui/icons-material";
import { TextField } from "core-lib/components/radix/form/TextField";
import { useSupplierCreateContext } from "../../SupplierCreateContext";
import { SupplierCreateStepProps } from "../SupplierCreateSteps";
import { SupplierCreateForm } from "../../validation";
import { StepShell } from "./StepShell";
import { StepNavigation } from "./StepNavigation";

const FIELDS_IN_STEP = [
  "email",
  "contactNumber",
  "address",
] as const satisfies ReadonlyArray<keyof SupplierCreateForm>;

export const ContactStep: React.FC<SupplierCreateStepProps> = ({
  next,
  previous,
  nextStep,
  previousStep,
}) => {
  const { form } = useSupplierCreateContext();
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
      title="Contact"
      subtitle="How to reach this supplier. All fields are optional but at least one channel is recommended."
      actions={
        <StepNavigation
          onBack={handleBack}
          onContinue={handleContinue}
          continueText="Continue"
        />
      }
    >
      <Flex direction="column" gap="3">
        <Grid columns={{ initial: "1", md: "2" }} gap="3">
          <TextField
            name="email"
            control={control}
            label="Email"
            type="email"
            placeholder="vendor@example.com"
            startAdornment={
              <AlternateEmailOutlined
                style={{ fontSize: 16, color: "var(--gray-10)" }}
              />
            }
          />
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
        </Grid>
        <TextField
          name="address"
          control={control}
          label="Address"
          multiline
          rows={2}
          placeholder="Street, City, State / Province"
          startAdornment={
            <LocationOnOutlined
              style={{ fontSize: 16, color: "var(--gray-10)" }}
            />
          }
        />
        <Text size="1" color="gray">
          Address is a single free-form string today. If you need structured
          warehouse / billing addresses later, that's a future schema change.
        </Text>
      </Flex>
    </StepShell>
  );
};
