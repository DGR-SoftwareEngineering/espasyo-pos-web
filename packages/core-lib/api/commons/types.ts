import { ApiResponse } from "../types";

export interface UserInformations {
  roleID: string;
  userInfo: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
  };
}
export interface CreateCategoryParams {
  name: string;
  description: string;
  type: number;
  displayOrder: number;
}

export interface CreateProductParams {
  name: string;
  description: string;
  unitPrice?: number;
  costPrice?: number;
  isMenuItem: boolean;
  categoryID?: string | null;
}
export interface CategoryDataList {
  categoryID: string;
  name: string;
  type: number;
  description: string;
  displayOrder: string;
  createdBy: string;
}
export interface ProductDataList {
  productID: string;
  name: string;
  description: string | null;
  unitPrice: number | null;
  costPrice: number | null;
  isMenuItem: boolean;
  categoryID: string | null;
  categoryName: string | null;
  categoryType: number | null;
  status?: number;
  createdBy: string | null;
  createdAt: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
  isActive: boolean;
}

export type UserInfoResponse = ApiResponse<UserInformations>;
export type CategoryListResponse = ApiResponse<CategoryDataList[]>;
export type ProductListResponse = ApiResponse<ProductDataList[]>;
