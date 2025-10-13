export interface SsoSessionParams {
  tokenId: string;
}

export interface LoginParams {
  userName: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LogoutParams {
  accessToken: string;
  refreshToken: string;
}
