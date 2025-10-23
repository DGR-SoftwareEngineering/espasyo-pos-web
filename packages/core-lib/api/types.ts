import { UserAddress } from "./internal/types";

export type CmsTokens = Nullable<{
  email: string;
  phoneNumber: string;
  systemDate: string;
  dateOfBirth: string;
  address: UserAddress;
  name: string;
  submissionDate: string;
}>;

export type ApiResponse<TResponse = unknown, TError = unknown> = {
  statusCode: number;
  success: boolean;
  response: TResponse;
  message: string | null;
  errors: TError | null;
  traceId?: string;
};

export type User = {
  fullName: string;
  userInfoID: string;
  userID: string;
  email: string;
  contactNumber: string;
}

export type Driver = User & {
  licenseNumber: string;
};
