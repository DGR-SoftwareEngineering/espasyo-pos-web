import { useBaseForm } from "core-lib/core/hooks/useBaseForm";
import { toNumeric } from "core-lib/business/number";
import {
  AdjustStockFormValues,
  adjustStockFormSchema,
} from "../forms/validation";
import { SUBMISSION_KEYS } from "../constants";

interface UseAdjustStockFormProps {
  resetForm?: boolean;
  isInDialog: boolean;
  onSubmit: (values: AdjustStockFormValues) => void;
}

const defaultValues: AdjustStockFormValues = {
  direction: "in",
  amount: 0,
  reason: "",
};

export const useAdjustStockForm = ({
  resetForm,
  isInDialog,
  onSubmit,
}: UseAdjustStockFormProps) => {
  const submissionKey = SUBMISSION_KEYS.edit;

  const form = useBaseForm<AdjustStockFormValues>({
    schema: adjustStockFormSchema,
    defaultValues,
    resetForm,
    isEdit: true,
    isInDialog,
    onSubmit,
    submissionKey,
  });

  const { watch } = form;
  const watchedValues = {
    direction: watch("direction"),
    amount: toNumeric(watch("amount")) ?? 0,
    reason: watch("reason"),
  };

  const signedDelta =
    watchedValues.direction === "out"
      ? -Math.abs(watchedValues.amount)
      : Math.abs(watchedValues.amount);

  return {
    ...form,
    watchedValues,
    signedDelta,
    submissionKey,
  };
};
