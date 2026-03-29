import { UnitConversionForm as UnitConversionFormType } from "./unit-conversion/validation";
import { ProductForm as ProductFormType } from "./validation";
import { CategoryDataList } from "core-lib/api/commons/types";

export interface ProductFormProps {
  onSubmit: (values: ProductFormType) => void;
  submitLoading: boolean;
  resetForm?: boolean;
  initialValues?: Partial<ProductFormType>;
  isEdit?: boolean;
  isInDialog: boolean;
  categories?: CategoryDataList[];
  isMenuItems?: boolean;
}

export interface UnitConversionFormProps {
  onSubmit: (values: UnitConversionFormType) => void;
  submitLoading: boolean;
  resetForm?: boolean;
  initialValues?: Partial<UnitConversionFormType>;
  isEdit?: boolean;
  isInDialog: boolean;
  categories?: CategoryDataList[];
}
