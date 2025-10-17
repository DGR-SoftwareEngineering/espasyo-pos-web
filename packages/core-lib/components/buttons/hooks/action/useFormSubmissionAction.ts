import { useFormSubmissionContext } from "../../../../core/contexts";
import { CustomActionHook } from "../types";

export const useFormSubmissionAction: CustomActionHook = () => {
  const formSubmission = useFormSubmissionContext();
  return {
    execute: formSubmission.submit,
    loading: formSubmission.loading,
    disabled: !formSubmission.enabled,
    disableFurtherActions: true,
  };
};
