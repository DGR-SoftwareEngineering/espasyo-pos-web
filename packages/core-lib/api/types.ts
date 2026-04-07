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
};

export type Driver = User & {
  licenseNumber: string;
};

export interface PaginationData {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type Car = {
  model: string;
  plateNumber: string;
  chassis: {
    type: string;
    serialNumber: string;
  };
  vehicleID: string;
};

export interface ChartData {
  chart: Nullable<{
    numberSuffix: string;
    numberPrefix: string;
  }>;
  chartType: string;
  data: ChartDataItem[] | null;
  datasets: { name: string; data: ChartDataItem[] }[] | null;
}

type ChartDataItem = { label: string; value: string };
