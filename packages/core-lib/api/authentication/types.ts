import { ApiResponse } from "../types";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SsoSessionParams {
  id: string;
}

export interface LoginParams {
  userName: string;
  password: string;
  platformKey?: string;
}

export type LogoutParams = AuthTokens;
export type RefreshParams = { refreshToken: string };

export type LoginResponse = ApiResponse<AuthTokens>;
export type RefreshTokenResponse = ApiResponse<AuthTokens>;
export type ValidateAccessTokenResponse = ApiResponse<string, unknown>;

// ===== MPIN =====

export interface SetMpinParams {
  currentPassword: string;
  mpin: string;
}

export interface ChangeMpinParams {
  currentMpin: string;
  newMpin: string;
}

export interface VerifyMpinParams {
  mpin: string;
}

export interface MpinStatusDto {
  hasMpin: boolean;
  mpinSetAt: string | null;
}

export interface AdminConfirmationParams {
  password: string;
  mpin: string;
}

export type CustomerRegistrationParams = {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
}

export type MpinStatusResponse = ApiResponse<MpinStatusDto>;
export type MpinActionResponse = ApiResponse<boolean>;
