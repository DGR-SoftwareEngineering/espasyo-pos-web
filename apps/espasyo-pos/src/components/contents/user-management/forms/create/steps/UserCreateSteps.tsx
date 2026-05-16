import { UserCreateForm } from "../validation";

export type UserCreateStepKey =
  | "Account"
  | "Personal"
  | "Contact"
  | "Photo"
  | "Review";

export interface UserCreateStepProps {
  isLoading: boolean;
  next: () => void;
  previous: () => void;
  reset: () => void;
  resetStep: () => void;
  nextStep?: (values: UserCreateForm) => void;
  previousStep?: () => void;
  values?: Partial<UserCreateForm>;
}
