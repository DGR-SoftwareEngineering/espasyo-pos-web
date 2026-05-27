import { CustomerFormType } from "./validation";

export interface CustomerFormProps {
  onSubmit: (values: CustomerFormType) => void;
  submitLoading: boolean;
  isEdit: boolean;
  isInDialog: boolean;
  initialValues?: Partial<CustomerFormType>;
}
