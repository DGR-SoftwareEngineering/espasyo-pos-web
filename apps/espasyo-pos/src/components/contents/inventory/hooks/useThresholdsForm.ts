import { useBaseForm } from "core-lib/core/hooks/useBaseForm";
import { toNumeric } from "core-lib/business/number";
import {
  ThresholdsFormValues,
  thresholdsFormSchema,
} from "../forms/validation";
import { SUBMISSION_KEYS } from "../constants";

interface UseThresholdsFormProps {
  initialValues?: Partial<ThresholdsFormValues>;
  resetForm?: boolean;
  isInDialog: boolean;
  onSubmit: (values: ThresholdsFormValues) => void;
}

const defaultValues: ThresholdsFormValues = {
  reorderLevel: 0,
  minimumStockLevel: 0,
};

export const useThresholdsForm = ({
  initialValues,
  resetForm,
  isInDialog,
  onSubmit,
}: UseThresholdsFormProps) => {
  const submissionKey = SUBMISSION_KEYS.edit;

  const form = useBaseForm<ThresholdsFormValues>({
    schema: thresholdsFormSchema,
    defaultValues,
    initialValues,
    resetForm,
    isEdit: true,
    isInDialog,
    onSubmit,
    submissionKey,
  });

  const { watch } = form;
  const watchedValues = {
    reorderLevel: toNumeric(watch("reorderLevel")) ?? 0,
    minimumStockLevel: toNumeric(watch("minimumStockLevel")) ?? 0,
  };

  return {
    ...form,
    watchedValues,
    submissionKey,
  };
};
