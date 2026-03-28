import { useEffect } from "react";
import {
  UnitConversionForm as UnitConversionFormType,
  unitConversionFormSchema,
} from "../forms/unit-conversion/validation";
import { toNumeric } from "core-lib/business";
import { UNIT_CONVERSION_SUBMISSION_KEYS } from "../constants";
import { useBaseForm } from "core-lib/core/hooks/useBaseForm";

interface Props {
  initialValues?: Partial<UnitConversionFormType>;
  resetForm?: boolean;
  isEdit: boolean;
  isInDialog: boolean;
  onSubmit: (values: UnitConversionFormType) => void;
}

const defaultValues: UnitConversionFormType = {
  conversionRate: 0,
  fromUnitID: "",
  isApproximate: false,
  notes: "",
  toUnitID: "",
};

export const useUnitConversionForm = ({
  initialValues,
  resetForm,
  isEdit,
  isInDialog,
  onSubmit,
}: Props) => {
  const submissionKey = isEdit
    ? UNIT_CONVERSION_SUBMISSION_KEYS.edit
    : UNIT_CONVERSION_SUBMISSION_KEYS.create;

  const form = useBaseForm<UnitConversionFormType>({
    schema: unitConversionFormSchema,
    defaultValues,
    initialValues,
    resetForm,
    isEdit,
    isInDialog,
    onSubmit,
    submissionKey,
  });

  const { watch, setValue } = form;
  const watchedValues: UnitConversionFormType = {
    conversionRate: toNumeric(watch("conversionRate")) ?? 0,
    fromUnitID: watch("fromUnitID"),
    isApproximate: watch("isApproximate"),
    toUnitID: watch("toUnitID"),
    notes: watch("notes"),
  };

  useEffect(() => {
    if (resetForm) {
      form.reset(defaultValues);
    }
  }, [resetForm, form]);

  useEffect(() => {
    if (isEdit && initialValues) {
      form.reset({
        conversionRate: initialValues.conversionRate ?? 0,
        fromUnitID: initialValues.fromUnitID ?? "",
        isApproximate: initialValues.isApproximate ?? false,
        toUnitID: initialValues.toUnitID ?? "",
        notes: initialValues.notes ?? "",
      });
    }
  }, [isEdit, initialValues, form]);

  useEffect(() => {
    if (
      watchedValues.fromUnitID === watchedValues.toUnitID &&
      watchedValues.fromUnitID
    ) {
      setValue("toUnitID", "");
    }
  }, [watchedValues.fromUnitID, watchedValues.toUnitID, setValue]);

  return {
    control: form.control,
    handleSubmit: form.handleSubmit,
    formState: form.formState,
    watchedValues,
    isDirty: form.formState.isDirty,
    submissionKey,
    reset: form.reset,
    setValue: form.setValue,
  };
};
