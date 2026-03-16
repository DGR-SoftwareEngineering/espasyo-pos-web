import { useEffect } from "react";
import {
  useForm,
  UseFormProps,
  FieldValues,
  DefaultValues,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFormSubmissionBindingHooks } from "core-lib/core/hooks";
import { AnyObjectSchema } from "yup";

interface UseBaseFormProps<T extends FieldValues> {
  schema: AnyObjectSchema;
  defaultValues: DefaultValues<T>;
  initialValues?: Partial<T>;
  resetForm?: boolean;
  isEdit: boolean;
  isInDialog: boolean;
  onSubmit: (values: T) => void;
  submissionKey: string;
  formOptions?: Partial<UseFormProps<T>>;
}

export const useBaseForm = <T extends FieldValues>({
  schema,
  defaultValues,
  initialValues,
  resetForm,
  isEdit,
  isInDialog,
  onSubmit,
  submissionKey,
  formOptions = {},
}: UseBaseFormProps<T>) => {
  const mergedDefaultValues = {
    ...defaultValues,
    ...initialValues,
  } as DefaultValues<T>;

  const form = useForm<T>({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: mergedDefaultValues,
    ...formOptions,
  });

  const { reset, formState, handleSubmit: rhfHandleSubmit } = form;
  const isDirty = formState.isDirty || isEdit;

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      reset({
        ...defaultValues,
        ...initialValues,
      } as T);
    }
  }, [initialValues, reset, defaultValues]);

  useEffect(() => {
    if (resetForm) {
      reset(defaultValues as T);
    }
  }, [resetForm, reset, defaultValues]);

  const handleFormSubmit = (data: T) => {
    onSubmit(data);
  };

  const asyncSubmit = async () => {
    console.log("Submission hook triggered");
    return new Promise<void>((resolve) => {
      rhfHandleSubmit(handleFormSubmit)();
      resolve();
    });
  };

  if (!isInDialog) {
    useFormSubmissionBindingHooks({
      key: submissionKey,
      isValid: formState.isValid,
      isDirty: isDirty,
      cb: asyncSubmit,
    });
  }

  return {
    ...form,
    isDirty,
    submitForm: () => {
      console.log("Direct submit called");
      rhfHandleSubmit(handleFormSubmit)();
    },
    handleSubmit: rhfHandleSubmit,
  };
};
