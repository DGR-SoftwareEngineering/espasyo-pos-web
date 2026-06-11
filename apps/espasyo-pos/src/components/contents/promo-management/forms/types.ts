import {
  ProductCategoryDto,
  ProductVariantDto,
  PromoCalculateResult,
  PromoFeasibilityItemResultDto,
  PromoFeasibilityResultDto,
  PromoSuggestionDto,
  SellableProductDto,
} from "core-lib/api/commons/types";
import { PromoForm } from "./validation";

export interface PromoFormProps {
  onSubmit: (values: PromoForm) => void;
  submitLoading: boolean;
  isInDialog?: boolean;
  initialValues?: Partial<PromoForm>;
  products: SellableProductDto[];
  productCategories: ProductCategoryDto[];
  fromSuggestion?: PromoSuggestionDto | null;
  calcResult?: PromoCalculateResult | null;
  onCalculate?: (values: PromoForm) => void;
  calcLoading?: boolean;
  onValuesChange?: (values: PromoForm) => void;
  /** Map of productID → loaded active variants (populated on demand in variant targeting mode). */
  variantsByProductId?: Record<string, ProductVariantDto[]>;
  /** Callback to trigger variant loading for a given product ID. */
  onLoadVariants?: (productId: string) => void;
  /** Per-product loading state for variant fetches. */
  variantsLoading?: Record<string, boolean>;
  /** True once batch variant pre-load for all products is complete. */
  allVariantsLoaded?: boolean;
  feasibilityResult?: PromoFeasibilityResultDto | null;
  feasibilityLoading?: boolean;
  onCheckFeasibility?: (values: PromoForm) => void;
  onCreatePO?: (items: PromoFeasibilityItemResultDto[]) => void;
}
