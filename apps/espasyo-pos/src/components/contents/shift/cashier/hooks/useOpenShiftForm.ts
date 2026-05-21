import { useBaseForm } from "core-lib/core/hooks/useBaseForm";
import { openShiftFormSchema, OpenShiftForm } from "../forms/validation";
import { SUBMISSION_KEYS } from "../constants";

const defaultValues: OpenShiftForm = { openingCash: 0, notes: "" };

interface UseOpenShiftFormProps {
  onSubmit: (values: OpenShiftForm) => void;
  resetForm?: boolean;
}

export const useOpenShiftForm = ({ onSubmit, resetForm }: UseOpenShiftFormProps) =>
  useBaseForm<OpenShiftForm>({
    schema: openShiftFormSchema,
    defaultValues,
    resetForm,
    isEdit: false,
    isInDialog: false,
    onSubmit,
    submissionKey: SUBMISSION_KEYS.create,
  });
