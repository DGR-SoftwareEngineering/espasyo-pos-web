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
