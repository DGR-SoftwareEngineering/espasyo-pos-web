import { useBaseForm } from "core-lib/core/hooks/useBaseForm";
import { closeShiftFormSchema, CloseShiftForm } from "../forms/validation";
import { SUBMISSION_KEYS } from "../constants";

const defaultValues: CloseShiftForm = {
  cashierShiftID: "",
  actualCash: 0,
  mpin: "",
  notes: "",
};

interface UseCloseShiftFormProps {
  initialValues?: Partial<CloseShiftForm>;
  onSubmit: (values: CloseShiftForm) => void;
}

export const useCloseShiftForm = ({
  initialValues,
  onSubmit,
}: UseCloseShiftFormProps) =>
  useBaseForm<CloseShiftForm>({
    schema: closeShiftFormSchema,
    defaultValues,
    initialValues,
    isEdit: false,
    isInDialog: true,
    onSubmit,
    submissionKey: SUBMISSION_KEYS.close,
  });
