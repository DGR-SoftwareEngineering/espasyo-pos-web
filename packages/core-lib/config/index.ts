import { getRuntimeConfig } from "./runtime";
import { parseDelimitedList } from "../business/strings";

export const config = {
  get value() {
    const { processEnv: env } = getRuntimeConfig();

    return {
      NODE_ENV: env.NODE_ENV ?? "development",
      WHITELISTED_COOKIES: parseDelimitedList(
        env.NEXT_PRIVATE_WHITELISTED_COOKIES,
        ";"
      ),
      SSO_COOKIE: env.NEXT_PRIVATE_SSO_COOKIE,
      APIURL: env.NEXT_PRIVATE_API_URL,
    };
  },
};
