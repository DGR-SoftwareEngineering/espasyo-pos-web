import React from "react";
import { Flex, Text } from "@radix-ui/themes";
import { PhotoCameraOutlined } from "@mui/icons-material";
import { ImageUploadField } from "core-lib/components/radix/form/ImageUploadField";
import { useSupplierCreateContext } from "../../SupplierCreateContext";
import { SupplierCreateStepProps } from "../SupplierCreateSteps";
import { StepShell } from "./StepShell";
import { StepNavigation } from "./StepNavigation";

export const LogoStep: React.FC<SupplierCreateStepProps> = ({
  next,
  previous,
  nextStep,
  previousStep,
}) => {
  const { form } = useSupplierCreateContext();
  const { control, getValues } = form;

  const handleContinue = () => {
    next();
    nextStep?.(getValues());
  };

  const handleBack = () => {
    previous();
    previousStep?.();
  };

  return (
    <StepShell
      icon={<PhotoCameraOutlined />}
      title="Company Logo"
      subtitle="Optional. Shown on the supplier list, PO context, and the read-only detail page."
      actions={
        <StepNavigation
          onBack={handleBack}
          onContinue={handleContinue}
          continueText="Continue to Review"
        />
      }
    >
      <Flex direction="column" gap="3">
        <ImageUploadField
          name="logoFile"
          control={control}
          label=""
          accept="image/*"
          maxSizeBytes={5 * 1024 * 1024}
        />
        <Text size="1" color="gray">
          Wide landscape logos render best. The image is uploaded to Cloudinary
          on submit.
        </Text>
      </Flex>
    </StepShell>
  );
};
