import { UnitDto } from "core-lib/api/commons/types";
import { UnitConversionForm as UnitConversionFormType } from "./validation";

export interface UnitConversionFormProps {
  onSubmit: (values: UnitConversionFormType) => void;
  submitLoading: boolean;
  resetForm?: boolean;
  initialValues?: Partial<UnitConversionFormType>;
  isEdit?: boolean;
  isInDialog: boolean;
  units?: UnitDto[];
}
