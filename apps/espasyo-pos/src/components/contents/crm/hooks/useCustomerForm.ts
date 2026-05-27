import { useBaseForm } from "core-lib/core/hooks/useBaseForm";
import { customerFormSchema, CustomerFormType } from "../forms/validation";
import { SUBMISSION_KEYS } from "../constants";

const defaultValues: CustomerFormType = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  birthday: "",
  tags: [],
};

interface UseCustomerFormProps {
  initialValues?: Partial<CustomerFormType>;
  isEdit: boolean;
  isInDialog: boolean;
  onSubmit: (values: CustomerFormType) => void;
}

export const useCustomerForm = ({
  initialValues,
  isEdit,
  isInDialog,
  onSubmit,
}: UseCustomerFormProps) => {
  return useBaseForm<CustomerFormType>({
    schema: customerFormSchema,
    defaultValues,
    initialValues,
    isEdit,
    isInDialog,
    onSubmit,
    submissionKey: isEdit ? SUBMISSION_KEYS.edit : SUBMISSION_KEYS.create,
  });
};
