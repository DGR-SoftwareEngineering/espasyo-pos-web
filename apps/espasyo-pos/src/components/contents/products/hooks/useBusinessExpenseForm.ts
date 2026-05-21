import { useCallback } from "react";
import {
  BusinessExpenseForm as BusinessExpenseFormType,
  businessExpenseFormSchema,
} from "../forms/BusinessExpenseForm/validation";
import { toNumeric } from "core-lib/business/number";
import { SUBMISSION_KEYS } from "../constants";
import { useBaseForm } from "core-lib/core/hooks/useBaseForm";

interface UseBusinessExpenseFormProps {
  initialValues?: Partial<BusinessExpenseFormType>;
  resetForm?: boolean;
  isEdit: boolean;
  isInDialog: boolean;
  onSubmit: (values: BusinessExpenseFormType) => void;
}

const defaultValues: BusinessExpenseFormType = {
  expenseDate: new Date().toISOString().split("T")[0],
  amount: 0,
  description: "",
  notes: null,
  businessSupplyCategoryID: null,
};

export const useBusinessExpenseForm = ({
  initialValues,
  resetForm,
  isEdit,
  isInDialog,
  onSubmit,
}: UseBusinessExpenseFormProps) => {
  const submissionKey = isEdit ? SUBMISSION_KEYS.edit : SUBMISSION_KEYS.create;

  const form = useBaseForm<BusinessExpenseFormType>({
    schema: businessExpenseFormSchema,
    defaultValues,
    initialValues,
    resetForm,
    isEdit,
    isInDialog,
    onSubmit,
    submissionKey,
  });

  const { watch } = form;

  const watchedValues = {
    expenseDate: watch("expenseDate"),
    amount: toNumeric(watch("amount")),
    description: watch("description"),
    notes: watch("notes"),
    businessSupplyCategoryID: watch("businessSupplyCategoryID"),
  };

  return {
    ...form,
    watchedValues,
    submissionKey,
  };
};
