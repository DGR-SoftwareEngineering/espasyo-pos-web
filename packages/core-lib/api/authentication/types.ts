export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type ApiResponse<TResponse = unknown, TError = unknown> = {
  statusCode: number;
  success: boolean;
  response: TResponse;
  message: string | null;
  errors: TError | null;
  traceId?: string;
};

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
