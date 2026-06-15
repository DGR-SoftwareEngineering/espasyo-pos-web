import React from "react";
import { Flex } from "@radix-ui/themes";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { Button } from "../buttons/Button";

export interface WizardNavigationProps {
  onBack?: () => void;
  onContinue?: () => void;
  continueText?: string;
  continueDisabled?: boolean;
  loading?: boolean;
  hideBack?: boolean;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  onBack,
  onContinue,
  continueText = "Continue",
  continueDisabled,
  loading,
  hideBack,
}) => (
  <Flex justify="between" align="center" gap="3">
    {!hideBack ? (
      <Button type="Secondary" onClick={onBack} disabled={!onBack || loading}>
        <Flex align="center" gap="2">
          <ArrowLeftIcon />
          Back
        </Flex>
      </Button>
    ) : (
      <span />
    )}
    <Button
      type="Primary"
      onClick={onContinue}
      disabled={continueDisabled}
      loading={loading}
    >
      <Flex align="center" gap="2">
        {continueText}
        <ArrowRightIcon />
      </Flex>
    </Button>
  </Flex>
);
