import React from "react";
import {
  Flex,
  Text,
} from "core-lib/components/radix/proxies";;
import { PhotoCameraOutlined } from "@mui/icons-material";
import { ImageUploadField } from "core-lib/components/radix/form/ImageUploadField";
import { useUserCreateContext } from "../../UserCreateContext";
import { UserCreateStepProps } from "../UserCreateSteps";
import { StepShell } from "./StepShell";
import { StepNavigation } from "./StepNavigation";

export const PhotoStep: React.FC<UserCreateStepProps> = ({
  next,
  previous,
  nextStep,
  previousStep,
}) => {
  const { form } = useUserCreateContext();
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
      title="Profile Photo"
      subtitle="Optional. Used on the staff list, audit trail, and the user's own profile."
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
          name="imageFile"
          control={control}
          label=""
          accept="image/*"
          maxSizeBytes={5 * 1024 * 1024}
        />
        <Text size="1" color="gray">
          Recommended: square image, at least 256×256. The image is uploaded to
          Cloudinary on submit.
        </Text>
      </Flex>
    </StepShell>
  );
};
