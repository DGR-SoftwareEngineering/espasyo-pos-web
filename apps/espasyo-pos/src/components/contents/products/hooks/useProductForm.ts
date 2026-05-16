import { useCallback } from "react";
import {
  ProductForm as ProductFormType,
  productFormSchema,
} from "../forms/validation";
import { toNumeric } from "core-lib/business/number";
import { SUBMISSION_KEYS } from "../constants";
import { useBaseForm } from "core-lib/core/hooks/useBaseForm";

interface UseProductFormProps {
  initialValues?: Partial<ProductFormType>;
  resetForm?: boolean;
  isEdit: boolean;
  isInDialog: boolean;
  onSubmit: (values: ProductFormType) => void;
}

const defaultValues: ProductFormType = {
  name: "",
  description: "",
  unitPrice: undefined,
  costPrice: undefined,
  isMenuItem: true,
  categoryID: null,
  purchaseQuantity: undefined,
  purchaseUnitID: "",
  stockUnitID: "",
  imageFile: null,
  removeImage: false,
};

export const useProductForm = ({
  initialValues,
  resetForm,
  isEdit,
  isInDialog,
  onSubmit,
}: UseProductFormProps) => {
  const submissionKey = isEdit ? SUBMISSION_KEYS.edit : SUBMISSION_KEYS.create;

  const form = useBaseForm<ProductFormType>({
    schema: productFormSchema,
    defaultValues,
    initialValues,
    resetForm,
    isEdit,
    isInDialog,
    onSubmit,
    submissionKey,
  });

  const { watch, setValue, trigger } = form;
  const watchedValues = {
    name: watch("name"),
    unitPrice: toNumeric(watch("unitPrice")),
    costPrice: toNumeric(watch("costPrice")),
    categoryId: watch("categoryID"),
    isMenuItem: watch("isMenuItem"),
    purchaseQuantity: toNumeric(watch("purchaseQuantity")),
    purchaseUnitID: watch("purchaseUnitID"),
    stockUnitID: watch("stockUnitID"),
  };

  const handleProductTypeChange = useCallback(
    (isMenuItem: boolean) => {
      setValue("categoryID", null, { shouldValidate: true });
      if (isMenuItem) {
        setValue("costPrice", undefined, { shouldValidate: true });
        setValue("purchaseQuantity", undefined, { shouldValidate: true });
        setValue("purchaseUnitID", "", { shouldValidate: true });
        setValue("stockUnitID", "", { shouldValidate: true });
      } else {
        setValue("unitPrice", undefined, { shouldValidate: true });
      }
      void trigger();
    },
    [setValue, trigger],
  );

  return {
    ...form,
    watchedValues,
    submissionKey,
    handleProductTypeChange,
  };
};
