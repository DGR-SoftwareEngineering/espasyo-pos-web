import { AccessApi } from "./access/api";
import { AuthenticationApi } from "./authentication/api";
import { CommonsApi } from "./commons/api";
import { CrmApi } from "./crm/api";

export class Api {
    constructor(
        readonly authentication: AuthenticationApi,
        readonly commons: CommonsApi,
        readonly access: AccessApi,
        readonly crm: CrmApi,
    ) {}
}
