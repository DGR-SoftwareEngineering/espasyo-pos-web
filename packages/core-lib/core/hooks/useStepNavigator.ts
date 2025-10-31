import { useCallback } from "react";

/**
 * A generic hook for managing step-based navigation in multi-step workflows.
 *
 * @template T - A union type representing all possible step identifiers.
 * @param next - A function to trigger the next step transition.
 * @param previous - A function to trigger the previous step transition.
 * @param nextStep - A function that accepts a step name of type `T` to set the next logical step.
 * @param previousStep - A function that accepts a step name of type `T` to set the previous logical step.
 *
 * @returns An object with `goToNextStep` and `goToPreviousStep` functions that accept a step name of type `T`.
 *
 * @example
 * ```ts
 * const { goToNextStep, goToPreviousStep } = useStepNavigator<CreationManagementSteps>(
 *   next,
 *   previous,
 *   nextStep,
 *   previousStep
 * );
 *
 * goToNextStep("AddingLocation");
 * goToPreviousStep("HelperSelection");
 */
type StepHandler<T extends string> = {
  goToNextStep: (step: T) => void;
  goToPreviousStep: (step: T) => void;
};

export function useStepNavigator<T extends string>(
  next: () => void,
  previous: () => void,
  nextStep: (step: T) => void,
  previousStep: (step: T) => void
): StepHandler<T> {
  const goToNextStep = useCallback(
    (step: T) => {
      next();
      nextStep(step);
    },
    [next, nextStep]
  );

  const goToPreviousStep = useCallback(
    (step: T) => {
      previous();
      previousStep(step);
    },
    [previous, previousStep]
  );

  return { goToNextStep, goToPreviousStep };
}
