export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type ApiResponse<T> = {
  response: T;
};

export interface SsoSessionParams {
  accessTokenJti: string;
}

export interface LoginParams {
  userName: string;
  password: string;
}

export type LogoutParams = AuthTokens;
export type RefreshParams = { refreshToken: string };

export type LoginResponse = ApiResponse<AuthTokens>;
export type RefreshTokenResponse = ApiResponse<AuthTokens>;
