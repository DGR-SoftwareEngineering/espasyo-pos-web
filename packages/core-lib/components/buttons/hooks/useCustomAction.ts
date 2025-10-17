import { useFormSubmissionAction } from "./action";
import { CustomActionHook } from "./types";

interface Props {
  actionKey?: string;
}

/**
 * This hook should only be use in form submissions (creation)
 */
export const useCustomAction = ({
  actionKey,
}: Props): ReturnType<CustomActionHook> | undefined => {
  const [actionName, actionParam] = actionKey?.split(":") || [];

  switch (actionName) {
    case "sign-in": //example only.
      return useFormSubmissionAction();
  }
};
