import { SupplierCreateForm } from "../validation";

export type SupplierCreateStepKey =
  | "Company"
  | "Contact"
  | "Business"
  | "Portal"
  | "Logo"
  | "Review";

export interface SupplierCreateStepProps {
  isLoading: boolean;
  next: () => void;
  previous: () => void;
  reset: () => void;
  resetStep: () => void;
  nextStep?: (values: SupplierCreateForm) => void;
  previousStep?: () => void;
  values?: Partial<SupplierCreateForm>;
}
