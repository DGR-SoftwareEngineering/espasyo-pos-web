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
}

export type LogoutParams = AuthTokens;
export type RefreshParams = { refreshToken: string };

export type LoginResponse = ApiResponse<AuthTokens>;
export type RefreshTokenResponse = ApiResponse<AuthTokens>;
export type ValidateAccessTokenResponse = ApiResponse<string, unknown>;
