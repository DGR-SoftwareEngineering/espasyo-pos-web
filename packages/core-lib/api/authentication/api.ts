import { AxiosInstance } from "axios";
import {
  ChangeMpinParams,
  LoginParams,
  LoginResponse,
  MpinActionResponse,
  MpinStatusResponse,
  SetMpinParams,
  SsoSessionParams,
  LogoutParams,
  RefreshParams,
  RefreshTokenResponse,
  VerifyMpinParams,
} from "./types";
import { ApiResponse } from "../types";

export class AuthenticationApi {
  constructor(
    private readonly axios: AxiosInstance,
    private readonly ssrAxios: AxiosInstance,
  ) {}

  public login(params: LoginParams) {
    return this.ssrAxios.post<LoginResponse>(`/api/auth/login`, params);
  }

  public session() {
    return this.axios.get(`/authentication-api/api/sso/session`);
  }

  public logout(params: LogoutParams) {
    return this.axios.post(
      `/authentication-api/api/authentication/logout`,
      params,
    );
  }

  public logoutWithClearCookies() {
    return this.ssrAxios.post(`/api/auth/logout`);
  }

  public createSession(params: SsoSessionParams) {
    return this.axios.post(
      `/authentication-api/api/sso/session/create-session`,
      params,
    );
  }

  public keepAlive() {
    return this.axios.post(`/authentication-api/api/sso/session/keep-alive`);
  }

  public refreshToken(params: RefreshParams) {
    return this.axios.post<RefreshTokenResponse>(
      `/authentication-api/api/authentication/refresh-token`,
      params,
    );
  }

  public validateToken() {
    return this.axios.get<ApiResponse>(
      `/authentication-api/api/authentication/validate-token`,
    );
  }

  // ===== MPIN =====

  public mpinStatus() {
    return this.axios.get<MpinStatusResponse>(
      `/authentication-api/api/Authentication/mpin-status`,
    );
  }

  public setMpin(params: SetMpinParams) {
    return this.axios.post<MpinActionResponse>(
      `/authentication-api/api/Authentication/set-mpin`,
      params,
    );
  }

  public changeMpin(params: ChangeMpinParams) {
    return this.axios.post<MpinActionResponse>(
      `/authentication-api/api/Authentication/change-mpin`,
      params,
    );
  }

  public verifyMpin(params: VerifyMpinParams) {
    return this.axios.post<MpinActionResponse>(
      `/authentication-api/api/Authentication/verify-mpin`,
      params,
    );
  }
}
