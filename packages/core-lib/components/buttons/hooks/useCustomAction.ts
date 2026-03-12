import { useFormSubmissionAction } from "./action";
import { CustomActionHook } from "./types";

interface Props {
  actionKey?: string;
  params?: string;
}

/**
 * This hook should only be use in form submissions (creation)
 */
export const useCustomAction = ({
  actionKey,
  params,
}: Props): ReturnType<CustomActionHook> | undefined => {
  const [actionName, actionParam] = actionKey?.split(":") || [];

  switch (actionName) {
    case "sign-in": //example only.
      return useFormSubmissionAction();
    case "espasyo-sign-in-submission":
      return useFormSubmissionAction();
    case "create-category-submission":
      return useFormSubmissionAction();
    case "edit-category-submission":
      return useFormSubmissionAction();
  }
};
