import React from "react";
import { Flex, Grid, Text } from "@radix-ui/themes";
import { BusinessOutlined, PersonOutlineOutlined } from "@mui/icons-material";
import { TextField } from "core-lib/components/radix/form/TextField";
import { useSupplierCreateContext } from "../../SupplierCreateContext";
import { SupplierCreateStepProps } from "../SupplierCreateSteps";
import { SupplierCreateForm } from "../../validation";
import { StepShell } from "./StepShell";
import { StepNavigation } from "./StepNavigation";

const FIELDS_IN_STEP = [
  "companyName",
  "contactPersonName",
] as const satisfies ReadonlyArray<keyof SupplierCreateForm>;

export const CompanyStep: React.FC<SupplierCreateStepProps> = ({
  next,
  nextStep,
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

  return (
    <StepShell
      icon={<BusinessOutlined />}
      title="Company"
      subtitle="Start with the business identity. Company name must be unique."
      iconAccent="var(--accent-11)"
      actions={
        <StepNavigation
          hideBack
          onContinue={handleContinue}
          continueText="Continue"
        />
      }
    >
      <Flex direction="column" gap="4">
        <Grid columns={{ initial: "1", md: "2" }} gap="3">
          <TextField
            name="companyName"
            control={control}
            label="Company Name"
            placeholder="e.g. Acme Foods Inc."
            startAdornment={
              <BusinessOutlined
                style={{ fontSize: 16, color: "var(--gray-10)" }}
              />
            }
          />
          <TextField
            name="contactPersonName"
            control={control}
            label="Contact Person (optional)"
            placeholder="e.g. Jane Smith"
            startAdornment={
              <PersonOutlineOutlined
                style={{ fontSize: 16, color: "var(--gray-10)" }}
              />
            }
          />
        </Grid>
        <Text size="1" color="gray">
          The contact person is the day-to-day human on the supplier side. You
          can update it later as the relationship evolves.
        </Text>
      </Flex>
    </StepShell>
  );
};
