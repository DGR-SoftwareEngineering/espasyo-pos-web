import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFormSubmissionBindingHooks } from "core-lib/core/hooks";
import {
  ProductForm as ProductFormType,
  productFormSchema,
} from "./validation";
import { toNumeric } from "./utils";

interface UseProductFormProps {
  initialValues?: Partial<ProductFormType>;
  resetForm?: boolean;
  isEdit: boolean;
  isInDialog: boolean;
  onSubmit: (values: ProductFormType) => void;
  submissionKey: string;
}

export const useProductForm = ({
  initialValues,
  resetForm,
  isEdit,
  isInDialog,
  onSubmit,
  submissionKey,
}: UseProductFormProps) => {
  const form = useForm<ProductFormType>({
    resolver: yupResolver(productFormSchema),
    mode: "all",
    defaultValues: {
      ...productFormSchema.getDefault(),
      ...initialValues,
    },
  });

  const { reset, watch, formState, handleSubmit, setValue } = form;
  const isDirty = formState.isDirty || isEdit;

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
      // Switching to menu item: clear costPrice
      setValue("costPrice", undefined);
    } else {
      // Switching to ingredient: clear unitPrice
      setValue("unitPrice", undefined);
    }
  }, [watchedValues.isMenuItem, setValue]);

  useEffect(() => {
    if (initialValues) {
      reset({
        ...productFormSchema.getDefault(),
        ...initialValues,
      });
    }
  }, [initialValues, reset]);

  useEffect(() => {
    if (resetForm) {
      reset(productFormSchema.getDefault());
    }
  }, [resetForm, reset]);

  if (!isInDialog) {
    useFormSubmissionBindingHooks({
      key: submissionKey,
      isValid: formState.isValid,
      isDirty: isDirty,
      cb: () => handleSubmit(onSubmit)(),
    });
  }

  return {
    ...form,
    watchedValues,
    isDirty,
  };
};
