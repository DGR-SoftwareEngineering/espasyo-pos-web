import { useEffect } from "react";
import {
  UnitConversionForm as UnitConversionFormType,
  unitConversionFormSchema,
} from "../forms/validation";
import { toNumeric } from "core-lib/business";
import { SUBMISSION_KEYS } from "../constants";
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
  const submissionKey = isEdit ? SUBMISSION_KEYS.edit : SUBMISSION_KEYS.create;

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
