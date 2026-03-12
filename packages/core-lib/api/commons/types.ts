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
export interface CategoryDataList {
  categoryID: string;
  name: string;
  type: number;
  description: string;
  displayOrder: string;
  createdBy: string;
}

export type UserInfoResponse = ApiResponse<UserInformations>;
export type CategoryListResponse = ApiResponse<CategoryDataList[]>;
