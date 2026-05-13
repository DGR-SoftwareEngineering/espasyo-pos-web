import { ProductDataList, InventoryDto } from "core-lib/api/commons/types";
import {
  AdjustStockFormValues,
  InventoryFormValues,
  ThresholdsFormValues,
} from "./validation";

export interface InventoryFormProps {
  onSubmit: (values: InventoryFormValues) => void;
  submitLoading: boolean;
  resetForm?: boolean;
  initialValues?: Partial<InventoryFormValues>;
  isEdit?: boolean;
  isInDialog: boolean;
  ingredients: ProductDataList[];
  ingredientsLoading?: boolean;
}

export interface AdjustStockFormProps {
  inventory: InventoryDto;
  onSubmit: (values: AdjustStockFormValues) => void;
  submitLoading: boolean;
  resetForm?: boolean;
  isInDialog: boolean;
}

export interface ThresholdsFormProps {
  inventory: InventoryDto;
  onSubmit: (values: ThresholdsFormValues) => void;
  submitLoading: boolean;
  resetForm?: boolean;
  isInDialog: boolean;
}
