import {
  BusinessSupplyCategoryDto,
} from "core-lib/api/commons/types";
import { BusinessExpenseForm as BusinessExpenseFormType } from "./validation";

export interface BusinessExpenseFormProps {
  onSubmit: (values: BusinessExpenseFormType) => void;
  submitLoading: boolean;
  resetForm?: boolean;
  initialValues?: Partial<BusinessExpenseFormType>;
  isEdit?: boolean;
  isInDialog: boolean;
  businessSupplyCategories: BusinessSupplyCategoryDto[];
  lookupsLoading?: boolean;
}
