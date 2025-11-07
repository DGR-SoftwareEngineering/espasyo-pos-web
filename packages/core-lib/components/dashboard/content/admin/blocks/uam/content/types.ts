import { ApiResponse } from "../../../../../../../api/types";

export type UserInfoValueType = {
  firstName: string;
  middleName: string;
  lastName: string;
  userInfoID: string;
  userID: string;
  email: string;
  contactNumber: string;
  licenseNumber: string | null;
};

export type User = {
  userID: string;
  roleID: string;
  auth: unknown | null;
  userInfo: UserInfoValueType;
  createdBy?: string;
  createdAt?: string;
};

export type UserListResponse = ApiResponse<User[]>;

export type ActionsCellProps = {
  userID: string;
  userInfoID: string;
  onEdit: (userID: string, userInfoID: string) => void;
  onDelete: (userID: string) => void;
};

export const responseMockData: UserListResponse["response"] = [
  {
    userID: "6645ad22-dc87-4143-980c-08de1188f6a5",
    roleID: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    auth: null,
    userInfo: {
      firstName: "first",
      middleName: "nomid",
      lastName: "last",
      userInfoID: "4cadf94e-a95a-4acd-bf3a-08de1188f6b2",
      userID: "6645ad22-dc87-4143-980c-08de1188f6a5",
      email: "email@test.com",
      contactNumber: "0",
      licenseNumber: null,
    },
    createdBy: "45949dd5-ce16-400c-8123-d8a0ed4d8ab8",
    createdAt: "2025-10-22T16:35:08.3963118",
  },
  {
    userID: "f52498c2-570a-4e5a-8d2c-08de11897ee7",
    roleID: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    auth: null,
    userInfo: {
      firstName: "string",
      middleName: "string",
      lastName: "string",
      userInfoID: "074f601a-0794-4453-aeb4-08de11897ef3",
      userID: "f52498c2-570a-4e5a-8d2c-08de11897ee7",
      email: "driver@gmail.com",
      contactNumber: "0",
      licenseNumber: "0",
    },
  },
  {
    userID: "1f21bcaa-a1c7-4480-cd77-08de130fd2ce",
    roleID: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    auth: null,
    userInfo: {
      firstName: "Helpershit",
      middleName: "Helpershit",
      lastName: "Helpershit",
      userInfoID: "53c77a23-640f-458a-3e84-08de130fd2dc",
      userID: "1f21bcaa-a1c7-4480-cd77-08de130fd2ce",
      email: "test@gmail.com",
      contactNumber: "0",
      licenseNumber: "0",
    },
  },
];

export const fullUserListMock: UserListResponse = {
  statusCode: 200,
  success: true,
  response: responseMockData,
  message: null,
  errors: null,
  traceId: "0HNGT9P30M7IN:00000001",
};
