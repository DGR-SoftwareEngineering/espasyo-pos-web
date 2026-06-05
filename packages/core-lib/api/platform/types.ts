import { ApiResponse } from "../types";

export interface PlatformDto {
  platformID: string;
  name: string;
  slugKey: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
}

export interface CreatePlatformParams {
  name: string;
  slugKey: string;
  description?: string;
}

export interface UpdatePlatformParams {
  name?: string;
  description?: string;
}

export interface PlatformUserDto {
  userPlatformID: string;
  userID: string;
  fullName: string;
  email?: string;
  roleName?: string;
  imageUrl?: string;
  assignedAt: string;
}

export type PlatformListResponse = ApiResponse<PlatformDto[]>;
export type PlatformResponse = ApiResponse<PlatformDto>;
export type PlatformUsersResponse = ApiResponse<PlatformUserDto[]>;
