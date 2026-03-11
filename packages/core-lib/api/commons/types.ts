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

export type UserInfoResponse = ApiResponse<UserInformations>;
