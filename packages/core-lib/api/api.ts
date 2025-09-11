import { AuthenticationApi } from "./authentication/api";
import { CommonsApi } from "./commons/api";

export class Api {
    constructor(
        readonly authentication: AuthenticationApi,
        readonly commons: CommonsApi
    ) {}
}