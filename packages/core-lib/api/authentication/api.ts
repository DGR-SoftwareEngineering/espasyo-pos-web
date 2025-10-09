import { AxiosInstance } from "axios";
import { LoginParams, LoginResponse, SsoSessionParams } from "./types";

export class AuthenticationApi {
  constructor(
    private readonly axios: AxiosInstance,
    private readonly ssrAxios: AxiosInstance
  ) {}

  public login(params: LoginParams) {
    return this.axios.post<LoginResponse>(
      `/authentication-api/api/authentication/login`,
      params
    );
  }

  public session() {
    return this.axios.get(`/authentication-api/api/sso/session`);
  }

  public createSession(params: SsoSessionParams) {
    return this.axios.post(
      `/authentication-api/api/sso/session/create`,
      params
    );
  }

  public keepAlive() {
    return this.axios.post(`/authentication-api/api/sso/session/keep-alive`);
  }
}
