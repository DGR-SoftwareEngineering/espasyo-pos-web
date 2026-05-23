import {
  ProductCategoryDto,
  ProductDataList,
  PromoCalculateResult,
  PromoSuggestionDto,
} from "core-lib/api/commons/types";
import { PromoForm } from "./validation";

export interface PromoFormProps {
  onSubmit: (values: PromoForm) => void;
  submitLoading: boolean;
  isInDialog?: boolean;
  initialValues?: Partial<PromoForm>;
  products: ProductDataList[];
  productCategories: ProductCategoryDto[];
  fromSuggestion?: PromoSuggestionDto | null;
  calcResult?: PromoCalculateResult | null;
  onCalculate?: () => void;
  calcLoading?: boolean;
  onValuesChange?: (values: PromoForm) => void;
}
