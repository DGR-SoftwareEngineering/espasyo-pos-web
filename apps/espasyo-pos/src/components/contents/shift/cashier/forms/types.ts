import { OpenShiftForm } from "./validation";

export interface OpenShiftFormProps {
  onSubmit: (values: OpenShiftForm) => void;
  submitLoading: boolean;
  resetForm?: boolean;
}
