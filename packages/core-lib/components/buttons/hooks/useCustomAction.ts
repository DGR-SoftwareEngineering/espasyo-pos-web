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
    case "sign-in":
    case "espasyo-sign-in-submission":
    case "create-category-submission":
    case "edit-category-submission":
    case "create-product-submission":
    case "edit-product-submission":
    case "create-recipe-submission":
    case "create-unit-conversion-submission":
    case "edit-unit-conversion-submission":
      return useFormSubmissionAction();
  }
};
