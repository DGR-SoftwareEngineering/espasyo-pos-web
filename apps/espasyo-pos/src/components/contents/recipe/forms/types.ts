import { ProductDataList, UnitDto } from "core-lib/api/commons/types";
import { RecipeForm as RecipeFormType } from "./validation";

export interface RecipeFormProps {
  onSubmit: (values: RecipeFormType) => void;
  submitLoading: boolean;
  resetForm?: boolean;
  initialValues?: Partial<RecipeFormType>;
  isEdit?: boolean;
  isInDialog: boolean;
  menuItems: ProductDataList[];
  ingredients: ProductDataList[];
  units: UnitDto[];
  onMenuItemSelect?: (menuItemId: string) => void;
}

export interface NewIngredient {
  ingredientProductID: string;
  quantityRequired: number;
  unitID: string;
  displayOrder: number;
  notes: string;
}
