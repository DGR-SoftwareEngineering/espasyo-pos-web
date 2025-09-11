import { AxiosInstance } from "axios";

export class AuthenticationApi {
    constructor(private readonly axios: AxiosInstance, private readonly ssrAxios: AxiosInstance) {}
}