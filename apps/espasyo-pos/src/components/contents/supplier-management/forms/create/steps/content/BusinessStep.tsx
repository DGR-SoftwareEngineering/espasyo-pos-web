import React from "react";
import {
  Flex,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Grid,
} from "@radix-ui/themes";;
import {
  BadgeOutlined,
  PaymentsOutlined,
  StickyNote2Outlined,
} from "@mui/icons-material";
import { TextField } from "core-lib/components/radix/form/TextField";
import { SelectField } from "core-lib/components/radix/form/SelectField";
import { PAYMENT_TERMS_OPTIONS } from "core-lib/components/dialog/contents/suppliers/constants";
import { useSupplierCreateContext } from "../../SupplierCreateContext";
import { SupplierCreateStepProps } from "../SupplierCreateSteps";
import { SupplierCreateForm } from "../../validation";
import { StepShell } from "./StepShell";
import { StepNavigation } from "./StepNavigation";

const FIELDS_IN_STEP = [
  "taxID",
  "paymentTerms",
  "notes",
] as const satisfies ReadonlyArray<keyof SupplierCreateForm>;

export const BusinessStep: React.FC<SupplierCreateStepProps> = ({
  next,
  previous,
  nextStep,
  previousStep,
}) => {
  const { form } = useSupplierCreateContext();
  const { control, trigger, getValues } = form;

  const paymentTermsOptions = React.useMemo(
    () => PAYMENT_TERMS_OPTIONS.map((value) => ({ value, label: value })),
    [],
  );

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
      icon={<PaymentsOutlined />}
      title="Business"
      subtitle="Tax ID and the payment terms you've agreed on. These show up on PO context later."
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
            name="taxID"
            control={control}
            label="Tax ID (optional)"
            placeholder="e.g. 123-456-789-001"
            startAdornment={
              <BadgeOutlined
                style={{ fontSize: 16, color: "var(--gray-10)" }}
              />
            }
          />
          <SelectField
            name="paymentTerms"
            control={control}
            options={paymentTermsOptions}
            label="Payment Terms (optional)"
            placeholder="Select payment terms"
          />
        </Grid>
        <TextField
          name="notes"
          control={control}
          label="Notes (optional)"
          multiline
          rows={4}
          placeholder="Any internal notes, e.g. lead times, packaging quirks, account contacts."
          startAdornment={
            <StickyNote2Outlined
              style={{ fontSize: 16, color: "var(--gray-10)" }}
            />
          }
        />
        <Text size="1" color="gray">
          Payment terms are free-text on the backend; the suggestions above are
          the common ones across the team.
        </Text>
      </Flex>
    </StepShell>
  );
};
