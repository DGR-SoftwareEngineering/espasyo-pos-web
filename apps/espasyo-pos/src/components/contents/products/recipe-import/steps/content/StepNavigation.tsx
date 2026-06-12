import React from "react";
import { Button, Flex, Spinner } from "@radix-ui/themes";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";

interface StepNavigationProps {
  onBack?: () => void;
  onContinue: () => void;
  continueText?: string;
  continueDisabled?: boolean;
  loading?: boolean;
  hideBack?: boolean;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  onBack,
  onContinue,
  continueText = "Continue",
  continueDisabled = false,
  loading = false,
  hideBack = false,
}) => {
  return (
    <Flex gap="2" justify="between">
      {!hideBack && onBack ? (
        <Button onClick={onBack} variant="outline">
          <ArrowLeftIcon width={16} height={16} />
          Back
        </Button>
      ) : (
        <div />
      )}
      <Button
        onClick={onContinue}
        disabled={continueDisabled || loading}
      >
        {loading ? (
          <>
            <Spinner />
            {continueText}
          </>
        ) : (
          <>
            {continueText}
            <ArrowRightIcon width={16} height={16} />
          </>
        )}
      </Button>
    </Flex>
  );
};
