import { useBaseForm } from "core-lib/core/hooks/useBaseForm";
import { toNumeric } from "core-lib/business/number";
import {
  InventoryFormValues,
  inventoryFormSchema,
} from "../forms/validation";
import { SUBMISSION_KEYS } from "../constants";

interface UseInventoryFormProps {
  initialValues?: Partial<InventoryFormValues>;
  resetForm?: boolean;
  isEdit: boolean;
  isInDialog: boolean;
  onSubmit: (values: InventoryFormValues) => void;
}

const defaultValues: InventoryFormValues = {
  productID: "",
  currentQuantity: 0,
  reorderLevel: 0,
  minimumStockLevel: 0,
};

export const useInventoryForm = ({
  initialValues,
  resetForm,
  isEdit,
  isInDialog,
  onSubmit,
}: UseInventoryFormProps) => {
  const submissionKey = isEdit ? SUBMISSION_KEYS.edit : SUBMISSION_KEYS.create;

  const form = useBaseForm<InventoryFormValues>({
    schema: inventoryFormSchema,
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
    productID: watch("productID"),
    currentQuantity: toNumeric(watch("currentQuantity")) ?? 0,
    reorderLevel: toNumeric(watch("reorderLevel")) ?? 0,
    minimumStockLevel: toNumeric(watch("minimumStockLevel")) ?? 0,
  };

  return {
    ...form,
    watchedValues,
    submissionKey,
  };
};
