import {
  IngredientCategoryDto,
  ProductCategoryDto,
  UnitDto,
} from "core-lib/api/commons/types";
import { ProductForm as ProductFormType } from "./validation";

export interface ProductFormProps {
  onSubmit: (values: ProductFormType) => void;
  submitLoading: boolean;
  resetForm?: boolean;
  initialValues?: Partial<ProductFormType>;
  isEdit?: boolean;
  isInDialog: boolean;
  productCategories: ProductCategoryDto[];
  ingredientCategories: IngredientCategoryDto[];
  units: UnitDto[];
  lookupsLoading?: boolean;
  isMenuItems?: boolean;
}
