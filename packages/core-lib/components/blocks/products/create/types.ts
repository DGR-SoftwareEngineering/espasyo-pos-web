import { CategoryDataList } from "../../../../api/commons/types";
import { ProductForm as ProductFormType } from "./validation";

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

export interface FormSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

export interface PreviewBannerProps {
  name: string;
  category?: CategoryDataList;
  price: number | null;
  formatPrice: (price: number) => string;
  isMenuItem: boolean;
}

export interface ProfitMarginProps {
  unitPrice: number;
  costPrice: number;
}

export interface StockPreviewProps {
  reorderLevel: number;
  minimumStock: number;
}
