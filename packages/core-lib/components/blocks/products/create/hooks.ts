import { useEffect } from "react";

import {
  ProductForm as ProductFormType,
  productFormSchema,
} from "./validation";
import { toNumeric } from "./utils";
import { SUBMISSION_KEYS } from "./constants";
import { useBaseForm } from "../../../../core/hooks/useBaseForm";
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
  unitPrice: 0.01,
  costPrice: undefined,
  isMenuItem: true,
  categoryID: null,
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

  const { watch, setValue } = form;
  const watchedValues = {
    name: watch("name"),
    unitPrice: toNumeric(watch("unitPrice")),
    costPrice: toNumeric(watch("costPrice")),
    categoryId: watch("categoryID"),
    isMenuItem: watch("isMenuItem"),
  };

  useEffect(() => {
    const isMenuItem = watchedValues.isMenuItem;
    if (isMenuItem) {
      setValue("costPrice", undefined);
    } else {
      setValue("unitPrice", undefined);
    }
  }, [watchedValues.isMenuItem, setValue]);

  return {
    ...form,
    watchedValues,
  };
};
